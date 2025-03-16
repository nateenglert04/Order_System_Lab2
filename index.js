const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://nenglert22:PUL2IhMSFTfpr68Y@lab2.ex0vk.mongodb.net/?retryWrites=true&w=majority&appName=Lab2';
mongoose.connect(MONGO_URI, {
  ssl: true,
  tlsAllowInvalidCertificates: false
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Routes
const customerRouter = require('./routes/customerRoute');
const orderRouter = require('./routes/orderRoute');
const productRouter = require('./routes/productRoute');

app.use('/customer', customerRouter);
app.use('/order', orderRouter);
app.use('/product', productRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});