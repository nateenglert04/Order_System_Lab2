# Order_System_Lab2
Repository to hold an Order System made through RESTful APIs using Node.js and Express.js.

## Schemas
The following are the schemas that were exported to MongoDB for implementation of basic data persistence:

### Customer
```
const customerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
});
```

### Order
```
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
```

### Product
```
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
});
```

## Routes
The API endpoints for the respective schemas are provided under Order_System_Lab2/routes and are used to manipulate the data entered in the MongoDb database that is connected within index.js. The uploaded Postman collection and environment will be used to enter data and test said data within MongoDB.

## Postman
The Postman_Lab2.zip contains a Postman collection JSON file containing the API endpoints to be tested. Furthermore, a Postman environment JSON file is used to automatically assign the relevant IDs (customer_id, product_id, and order_id) within global variables for ease of testing. 

## Swagger
The Swagger documentation for Order_System_Lab2 can be accessed at http://localhost:4000/api-docs and will cover the uses of the API endpoints and relevant examples for each endpoint.
