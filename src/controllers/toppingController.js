const Topping = require('../models/toppingModel');

// Controller methods
const getAllToppings = (req, res) => {
  const limit = req.query.limit;
  const paging = req.query.paging;
  const isGetAll = req.query.isgetall;
  Topping.getAll(limit,paging,isGetAll,(err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

const getToppingById = (req, res) => {
  const id = req.params.id;
  Topping.getById(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!result) {
      return res.status(404).json({ message: 'Topping not found' });
    }
    res.json(result);
  });
};

const createTopping = (req, res) => {
  const newTopping = req.body;
  Topping.create(newTopping, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: result.insertId, ...newTopping });
  });
};

const updateTopping = (req, res) => {
  const id = req.params.id;
  const updatedTopping = req.body;
  Topping.update(id, updatedTopping, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Topping updated successfully' });
  });
};

const deleteTopping = (req, res) => {
  const id = req.params.id;
  Topping.delete(id, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Topping deleted successfully' });
  });
};

module.exports = {
  getAllToppings,
  getToppingById,
  createTopping,
  updateTopping,
  deleteTopping
};
