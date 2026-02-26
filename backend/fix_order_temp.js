const mongoose = require('mongoose');
const Order = require('./models/Order');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const orders = await Order.find({ status: 'pending' }).sort({ createdAt: -1 }).limit(5).lean();
  console.log('Pending orders:');
  for (const o of orders) {
    console.log('ID:', o._id.toString(), '| Created:', o.createdAt, '| Items:', (o.items||[]).map(i=>i.name).join(', '));
  }
  if (orders[0]) {
    await Order.findByIdAndUpdate(orders[0]._id, { status: 'completed', paymentId: '419464731', paymobOrderId: '476686051' });
    console.log('FIXED:', orders[0]._id.toString());
  }
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
