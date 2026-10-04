import { NextResponse } from 'next/server';
import { connectDB, Product, Order, mongoose } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { checkPincode, shippingFor } from '@/lib/pincode';

const MAX_QTY_PER_ITEM = 10;
const VALID_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

function parseItems(body) {
  if (Array.isArray(body.items)) return body.items;
  if (body.productId) return [{ productId: body.productId, quantity: 1, size: body.size || 'M' }];
  return [];
}

function dummyTransaction(method) {
  const prefix = method === 'UPI' ? 'UPI' : method === 'CARD' ? 'CARD' : 'COD';
  const rand = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `${prefix}_${Date.now().toString(36).toUpperCase()}${rand}`;
}

export async function POST(request) {
  try {
    await connectDB();
    const user = await requireUser(request);
    const body = await request.json();
    const items = parseItems(body);
    const address = body.address || {};
    const paymentMethod = ['UPI', 'CARD', 'COD'].includes(body.paymentMethod) ? body.paymentMethod : 'UPI';

    if (items.length === 0) {
      return NextResponse.json({ success: false, message: 'Your cart is empty.' }, { status: 400 });
    }
    // Address validation
    const required = ['fullName', 'phone', 'line1', 'city', 'state', 'pincode'];
    for (const f of required) {
      if (!String(address[f] || '').trim()) {
        return NextResponse.json({ success: false, message: `Delivery address incomplete: missing ${f}.` }, { status: 400 });
      }
    }
    if (!/^\d{10}$/.test(String(address.phone).replace(/\D/g, '').slice(-10))) {
      return NextResponse.json({ success: false, message: 'Enter a valid 10-digit phone number.' }, { status: 400 });
    }
    const pin = checkPincode(address.pincode);
    if (!pin.serviceable) {
      return NextResponse.json({ success: false, message: pin.reason || 'This pincode is not serviceable.' }, { status: 400 });
    }
    if (paymentMethod === 'COD' && pin.codAvailable === false) {
      return NextResponse.json({ success: false, message: 'COD is not available for this pincode. Choose UPI or Card.' }, { status: 400 });
    }

    for (const { productId, quantity, size } of items) {
      if (!mongoose.isValidObjectId(productId)) {
        return NextResponse.json({ success: false, message: 'Invalid product in cart.' }, { status: 400 });
      }
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY_PER_ITEM) {
        return NextResponse.json({ success: false, message: `Quantity must be between 1 and ${MAX_QTY_PER_ITEM}.` }, { status: 400 });
      }
      if (size && !VALID_SIZES.includes(size)) {
        return NextResponse.json({ success: false, message: `Invalid size "${size}".` }, { status: 400 });
      }
    }

    // Dummy payment: simulate a gateway. Random 3% failure for realism (never fail COD).
    if (paymentMethod !== 'COD' && Math.random() < 0.03) {
      return NextResponse.json(
        { success: false, message: 'Payment failed at the (dummy) gateway. No money was deducted. Please retry.', code: 'PAYMENT_FAILED' },
        { status: 402 }
      );
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const orderItems = [];
      let subtotal = 0;

      for (const { productId, quantity, size } of items) {
        const updatedProduct = await Product.findOneAndUpdate(
          { _id: productId, stock: { $gte: quantity } },
          { $inc: { stock: -quantity } },
          { returnDocument: 'after', session }
        );

        if (!updatedProduct) {
          const existing = await Product.findById(productId).session(session);
          const label = existing ? `"${existing.name}"` : 'an item in your cart';
          throw new Error(`Out of stock! Not enough ${label} left. Someone grabbed it a millisecond faster.`);
        }

        orderItems.push({
          productId,
          name: updatedProduct.name,
          emoji: updatedProduct.emoji,
          size: size || 'M',
          quantity,
          priceAtPurchase: updatedProduct.price,
        });
        subtotal += updatedProduct.price * quantity;
      }

      const { fee: shipping } = shippingFor(subtotal);
      const totalAmount = subtotal + shipping;
      const transactionId = dummyTransaction(paymentMethod);

      const newOrder = new Order({
        userId: user?._id || undefined,
        userEmail: user?.email || body.email || 'guest@example.com',
        items: orderItems,
        subtotal,
        shipping,
        totalAmount,
        address: {
          fullName: address.fullName,
          phone: address.phone,
          line1: address.line1,
          line2: address.line2 || '',
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          label: address.label || 'Home',
        },
        pincode: address.pincode,
        etaDays: pin.etaDays,
        payment: {
          method: paymentMethod,
          transactionId,
          status: paymentMethod === 'COD' ? 'PENDING' : 'SUCCESS',
          last4: body.cardLast4 || undefined,
        },
        status: 'PLACED',
        statusHistory: [{ status: 'PLACED', at: new Date(), note: `Payment ${transactionId} confirmed (dummy gateway)` }],
      });

      await newOrder.save({ session });
      await session.commitTransaction();

      return NextResponse.json({
        success: true,
        message: 'Order placed successfully!',
        orderId: newOrder._id,
        transactionId,
        totalAmount,
        etaDays: pin.etaDays,
      });
    } catch (error) {
      await session.abortTransaction();
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    } finally {
      session.endSession();
    }
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Database connection failed: ' + err.message }, { status: 500 });
  }
}
