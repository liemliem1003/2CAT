const Item = require('../models/itemModel');

// Controller methods
const getAllItems = (req, res) => {
 
  const limit = req.query.limit;
  const paging = req.query.paging;
  const isGetAll = req.query.isgetall;

  Item.getAll(limit,paging,isGetAll,(err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

const getItemById = (req, res) => {
  const id = req.params.id;
  Item.getById(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!result) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(result);
  });
};

const createItem = (req, res) => {
  const newItem = req.body;
  Item.create(newItem, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: result.insertId, ...newItem });
  });
};

const updateItem = (req, res) => {
  const id = req.params.id;
  const updatedItem = req.body;
  Item.update(id, updatedItem, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Item updated successfully' });
  });
};

const deleteItem = (req, res) => {
  const id = req.params.id;
  Item.delete(id, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Item deleted successfully' });
  });
};

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
};
