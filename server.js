const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
const localtunnel = require('localtunnel');

const API_TOKEN = "LIEMLIEM1003"


const allowedOrigins = [
  'http://localhost:4200',   // Local development
  'https://2cat.loca.lt' // Ngrok URL
];


// Handle preflight requests
app.options('*', cors());  // Preflight route for all routes

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization','ngrok-skip-browser-warning']
}));

app.use((req, res, next) => {
  const token = req.headers['authorization'];
  if (token === `Bearer ${API_TOKEN}`) {
    next(); // Token is valid, proceed to the next middleware or route
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});


// const tunnel = localtunnel(port, { subdomain: '2cat-be' }, (err, tunnel) => {
//   if (err) {
//     console.error('Error creating tunnel:', err);
//     return;
//   }
//   console.log('Tunnel is live at:', tunnel.url);
// });

// tunnel.on('close', function () {
//   console.log('Tunnel closed');
// });

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
