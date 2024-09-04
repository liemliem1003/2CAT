const express = require('express');
const router = express.Router();
const toppingController = require('../controllers/toppingController');

// Define routes
router.get('/', toppingController.getAllToppings);
router.get('/:id', toppingController.getToppingById);
router.post('/', toppingController.createTopping);
router.put('/:id', toppingController.updateTopping);
router.delete('/:id', toppingController.deleteTopping);

module.exports = router;
