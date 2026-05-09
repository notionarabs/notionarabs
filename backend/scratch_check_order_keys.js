const Order = require('./models/Order');

async function run() {
  try {
    const hazemId = '09e34c61ae25528fa339c236';
    const orders = await Order.find({ user: hazemId });
    console.log('--- RECENT ORDERS FROM MODEL ---');
    if (orders && orders.length > 0) {
      console.log('Keys of first order:', Object.keys(orders[0]));
      console.log('First order details:', JSON.stringify(orders[0], null, 2));
    } else {
      console.log('No orders found');
    }
  } catch (err) {
    console.error(err);
  }
}

run();
