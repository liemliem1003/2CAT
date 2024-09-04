const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');

app.use(cors({
    origin: 'http://localhost:4200' 
}));
// Middleware to parse JSON bodies
app.use(express.json());

// Import and use routes
const itemRoutes = require('./src/routes/itemRoutes');
app.use('/items', itemRoutes);

const orderRoutes = require('./src/routes/orderRoutes');
app.use('/orders', orderRoutes);

const toppingRoutes = require('./src/routes/toppingRoutes');
app.use('/toppings', toppingRoutes);



// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
