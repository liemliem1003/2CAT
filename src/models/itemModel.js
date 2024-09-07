const { json } = require('express');
const db = require('../config/db');

const Item = {
  getAll: (limit, paging,isGetAll, callback) => {
    limit ? limit = limit : limit = 10
    paging ? paging = paging : paging = 0
    const offset = limit * paging;
    if (isGetAll) {
      const countQuery = `SELECT COUNT(*) AS total_items FROM items_for_sale where status = 1`;
      const query = `SELECT * FROM items_for_sale where status = 1`;
      db.query(query, (err, items) => {
        if (err) return callback(err);
        db.query(countQuery, (err, countResult) => {
          if (err) return callback(err);
          const totalItems = countResult[0].total_items;
          callback(null, { items, totalItems });
        });
      })
    } else {
      const countQuery = `SELECT COUNT(*) AS total_items FROM items_for_sale`;
      const query = `SELECT * FROM items_for_sale limit  ${limit} offset ${offset}`;
      db.query(query, [limit, offset], (err, items) => {
        if (err) return callback(err);
        db.query(countQuery, (err, countResult) => {
          if (err) return callback(err);
          const totalItems = countResult[0].total_items;
          callback(null, { items, totalItems });
        });
      });
    }


  },

  getById: (id, callback) => {
    const query = 'SELECT * FROM items_for_sale WHERE item_id = ?';
    db.query(query, [id], callback);
  },

  create: (itemData, callback) => {
    const query = 'INSERT INTO items_for_sale SET ?';
    db.query(query, itemData, callback);
  },

  update: (id, itemData, callback) => {
    const query = 'UPDATE items_for_sale SET ? WHERE item_id = ?';

    delete itemData.item_id;
    delete itemData.date_added;
    db.query(query, [itemData, id], callback);

  },

  delete: (id, callback) => {
    const query = 'DELETE FROM items_for_sale WHERE item_id = ?';
    db.query(query, [id], callback);
  }
};

module.exports = Item;
