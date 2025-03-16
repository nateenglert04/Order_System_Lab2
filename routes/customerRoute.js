const express = require('express');
const router = express.Router();
const Customer = require('../models/customer');

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