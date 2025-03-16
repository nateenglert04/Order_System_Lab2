const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Order = require('../models/order');

/**
 * @swagger
 * tags:
 *      name: Product
 *      description: Product API endpoint management
*/

/**
 * @swagger
 * /product:
 *   post:
 *     summary: Create a new product
 *     tags: [Product]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jellybean
 *               description:
 *                 type: string
 *                 example: Tasty Jellybean
 *               price:
 *                 type: number
 *                 example: 1.00
 *               stock:
 *                 type: number
 *                 example: 100
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The auto-generated ID of the product
 *                   example: 64f1b2c3e4d5f6a7b8c9d0e2
 *                 name:
 *                   type: string
 *                   example: Jellybean
 *                 description:
 *                   type: string
 *                   example: Tasty Jellybean
 *                 price:
 *                   type: number
 *                   example: 1.00
 *                 stock:
 *                   type: number
 *                   example: 100
 *                 __v:
 *                   type: number
 *                   example: 0
 *       400:
 *         description: Bad request. Missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Name, description, price, and stock are required
 */

// Create a Product
router.post('/', async (req, res) => {
    try {
      const { name, description, price, stock } = req.body;

      if (!name || !description || !price || !stock) {
        return res.status(400).json({ message: 'Name, description, price, and stock are required' });
      }

      const newProduct = await Product.create({ name, description, price, stock });
      res.status(201).json(newProduct);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
});

/**
 * @swagger
 * /product/{id}:
 *   delete:
 *     summary: Delete a product by ID
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to delete
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product deleted and removed from current orders
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product not found
 */

// Delete a Product (by ID)
router.delete('/:id', async (req, res) => {
    try {
      const productID = req.params.id;
      const product = await Product.findById(productID);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      await product.deleteOne();

      await Order.updateMany(
        { 'items.productID': productID }, 
        { $pull: { items: { productID } } } 
      );

      res.json({ message: 'Product deleted and removed from current orders' });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
});

module.exports = router;