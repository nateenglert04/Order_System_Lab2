const express = require('express');
const router = express.Router();
const Customer = require('../models/customer');
const Order = require('../models/order');
const Product = require('../models/product');
  
/**
 * @swagger
 * tags:
 *      name: Order
 *      description: Order API endpoint management
*/

/**
 * @swagger
 * /order:
 *   post:
 *     summary: Create a new order
 *     tags: [Order]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerID:
 *                 type: string
 *                 description: The ID of the customer placing the order held in MongoDB
 *                 example: 64f1b2c3e4d5f6a7b8c9d0e1
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productID:
 *                       type: string
 *                       description: The ID of the product held in MongoDB
 *                       example: 64f1b2c3e4d5f6a7b8c9d0e2
 *                     quantity:
 *                       type: number
 *                       example: 2
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The auto-generated ID of the order
 *                   example: 64f1b2c3e4d5f6a7b8c9d0e3
 *                 customerID:
 *                   type: string
 *                   description: The ID of the customer who placed the order
 *                   example: 64f1b2c3e4d5f6a7b8c9d0e1
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productID:
 *                         type: string
 *                         example: 64f1b2c3e4d5f6a7b8c9d0e2
 *                       quantity:
 *                         type: number
 *                         example: 2
 *                 totalPrice:
 *                   type: number
 *                   description: The total price of the order
 *                   example: 20.00
 *                 status:
 *                   type: string
 *                   enum: [Pending, Completed, Cancelled]
 *                   default: Pending
 *                 paymentStatus:
 *                   type: string
 *                   enum: [Pending, Paid]
 *                   default: Pending
 *                 __v:
 *                   type: number
 *                   example: 0
 *       400:
 *         description: Bad request. Missing required fields or insufficient stock.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: CustomerID and items are required
 *       404:
 *         description: Customer or product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Customer not found
 */

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

/**
 * @swagger
 * /order/{id}/cancel:
 *   put:
 *     summary: Cancel an order by ID
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the order to cancel
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The auto-generated ID of the order
 *                   example: 64f1b2c3e4d5f6a7b8c9d0e3
 *                 customerID:
 *                   type: string
 *                   description: The ID of the customer
 *                   example: 64f1b2c3e4d5f6a7b8c9d0e1
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productID:
 *                         type: string
 *                         example: 64f1b2c3e4d5f6a7b8c9d0e2
 *                       quantity:
 *                         type: number
 *                         example: 2
 *                 totalPrice:
 *                   type: number
 *                   description: The total price of the order
 *                   example: 1.00
 *                 status:
 *                   type: string
 *                   example: Cancelled
 *                 paymentStatus:
 *                   type: string
 *                   example: Pending
 *                 __v:
 *                   type: number
 *                   example: 0
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order not found
 */

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
  
/**
 * @swagger
 * /order/{id}/pay:
 *   post:
 *     summary: Submit payment for an order by ID
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the order to pay
 *     responses:
 *       200:
 *         description: Payment submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The auto-generated ID of the order
 *                   example: 64f1b2c3e4d5f6a7b8c9d0e3
 *                 customerID:
 *                   type: string
 *                   description: The ID of the customer
 *                   example: 64f1b2c3e4d5f6a7b8c9d0e1
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productID:
 *                         type: string
 *                         example: 64f1b2c3e4d5f6a7b8c9d0e2
 *                       quantity:
 *                         type: number
 *                         example: 2
 *                 totalPrice:
 *                   type: number
 *                   description: The total price of the order
 *                   example: 1.00
 *                 status:
 *                   type: string
 *                   example: Completed
 *                 paymentStatus:
 *                   type: string
 *                   example: Paid
 *                 __v:
 *                   type: number
 *                   example: 0
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order not found
 */

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

/**
 * @swagger
 * /order:
 *   get:
 *     summary: Get all current orders with customer and product details
 *     tags: [Order]
 *     responses:
 *       200:
 *         description: List of all orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 64f1b2c3e4d5f6a7b8c9d0e3
 *                   customerID:
 *                     type: object
 *                     properties:
 *                       firstName:
 *                         type: string
 *                         example: Nathan
 *                       lastName:
 *                         type: string
 *                         example: Englert
 *                       email:
 *                         type: string
 *                         example: nke5100@psu.edu
 *                   items:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         productID:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               example: Jellybean
 *                             description:
 *                               type: string
 *                               example: Tasty Jellybean
 *                             price:
 *                               type: number
 *                               example: 1.00
 *                             stock:
 *                               type: number
 *                               example: 100
 *                         quantity:
 *                           type: number
 *                           example: 1
 *                   totalPrice:
 *                     type: number
 *                     example: 1.00
 *                   status:
 *                     type: string
 *                     example: Pending
 *                   paymentStatus:
 *                     type: string
 *                     example: Pending
 *                   __v:
 *                     type: number
 *                     example: 0
 *       400:
 *         description:  Bad request. Invalid request.
 */

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