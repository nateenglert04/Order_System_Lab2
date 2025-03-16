const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerID: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  items: [{
     productID: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
     quantity: { type: Number, required: true }
    }],
  totalPrice: { type: Number },
  status: { type: String, enum: ['Pending','Completed','Cancelled'], default: 'Pending'},
  paymentStatus : { type: String, enum: ['Pending', 'Paid'], default: 'Pending'}
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;