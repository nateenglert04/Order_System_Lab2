const express = require('express');
const router = express.Router();
const Customer = require('../models/customer');
const Order = require('../models/order');
const Product = require('../models/product');
  
// Create an Order
router.post('/', async (req, res) => {
    try {
      const { customerID, items } = req.body;

      if (!customerID || !items || items.length === 0) {
        return res.status(400).json({ message: 'CustomerID and items are required' });
      }

      const customer = await Customer.findById(customerID);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      let totalPrice = 0;
      for (const item of items) {
        const product = await Product.findById(item.productID);
        if (!product) {
          return res.status(404).json({ message: `Product not found: ${item.productID}` });
        }
        if (product.stock < item.quantity) {
          return res.status(400).json({ message: `Insufficient stock for product: ${product.name}` });
        }
        product.stock -= item.quantity;
        totalPrice += product.price * item.quantity;
        await product.save();
      }

      const newOrder = new Order({customerID, items, totalPrice });
      await newOrder.save();
      res.status(201).json(newOrder);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
});

// Cancel an Order (by ID)
router.put('/:id/cancel', async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      order.status = 'Cancelled';
      await order.save();
      res.json(order);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
});
  
// Submit payment for an order (by ID)
router.post('/:id/pay', async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      await new Promise((resolve) => setTimeout(resolve,2000));

      order.status = 'Completed';
      order.paymentStatus = 'Paid';
      await order.save();
      res.json(order);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
});

// Get all current orders and display information of CustomerID and ProductID
router.get('/', async (req, res) => {
    try {
      const orders = await Order.find()
        .populate('customerID', 'firstName lastName email')
        .populate('items.productID', 'name description price stock');
      res.json(orders);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
});

module.exports = router;