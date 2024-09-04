const Order = require('../models/orderModel');

// Controller methods
const getAllOrders = (req, res) => {
  const limit = req.query.limit;
  const paging = req.query.paging;
  Order.getAll(limit,paging,(err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

const getOrderById = (req, res) => {
  const id = req.params.id;
  Order.getById(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!result) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(result);
  });
};

const createOrder = (req, res) => {
  const newOrder = req.body;
  Order.create(newOrder, (err, result) => {
    console.log(result);
    
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // res.status(201).json({ id: result.insertId, ...newOrder });
    res.status(201).json({ 
      code:201,
      message: "Create order successfully"
     });
  });
};

const updateOrder = (req, res) => {
  const id = req.params.id;
  const updatedOrder = req.body;
  Order.update(id, updatedOrder, (err) => {
    console.log(err);
    
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    console.log(res);
    res.json({ 
      code:201,
      message: "Update order successfully"
     });
  });
};

const deleteOrder = (req, res) => {
  const id = req.params.id;
  Order.delete(id, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Order deleted successfully' });
  });
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder
};
