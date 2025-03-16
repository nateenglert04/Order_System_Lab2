const express = require('express');
const router = express.Router();
const Customer = require('../models/customer');

/**
 * @swagger
 * tags:
 *      name: Customer
 *      description: Customer API endpoint management
*/

/**
 * @swagger
 * /customer:
 *   post:
 *     summary: Create a new customer
 *     tags: [Customer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Nathan
 *               lastName:
 *                 type: string
 *                 example: Englert
 *               email:
 *                 type: string
 *                 example: nke5100@psu.edu
 *     responses:
 *       201:
 *         description: Customer created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The auto-generated ID of the customer
 *                   example: 64f1b2c3e4d5f6a7b8c9d0e1
 *                 firstName:
 *                   type: string
 *                   example: Nathan
 *                 lastName:
 *                   type: string
 *                   example: Englert
 *                 email:
 *                   type: string
 *                   example: nke5100@psu.edu
 *                 __v:
 *                   type: number
 *                   description: The version key of the document
 *                   example: 0
 *       400:
 *         description: Bad request. Missing required fields, email already exists, or other error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: First name, last name, and email are required
 */

// Create a Customer
router.post('/', async (req, res) => {
    try {
      const { firstName, lastName, email } = req.body;

      if (!firstName || !lastName || !email) {
        return res.status(400).json({ message: 'First name, last name, and email are required' });
      }

      const existingCustomer = await Customer.findOne({ email });
      if (existingCustomer) {
        return res.status(400).json({ message: 'Customer with this email already exists' });
      }

      const newCustomer = await Customer.create({ firstName, lastName, email });
      res.status(201).json(newCustomer);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
});

module.exports = router;