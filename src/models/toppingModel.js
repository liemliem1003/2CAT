const { json } = require('express');
const db = require('../config/db');

const Topping = {
  getAll: (limit, paging, isGetAll, callback) => {
    limit ? limit = limit : limit = 10
    paging ? paging = paging : paging = 0

    const offset = limit * paging;
    if (isGetAll) {
      const countQuery = `SELECT COUNT(*) AS total_toppings FROM topping where status = 1`;
      const query = `SELECT * FROM topping where status = 1`;
      db.query(query, (err, toppings) => {
        if (err) return callback(err);
        db.query(countQuery, (err, countResult) => {
          if (err) return callback(err);
          const totalToppings = countResult[0].total_toppings;
          callback(null, { toppings, totalToppings });
        });
      })
    } else {
      const countQuery = `SELECT COUNT(*) AS total_toppings FROM topping`;
      const query = `SELECT * FROM topping limit  ${limit} offset ${offset}`;
      db.query(query, [limit, offset], (err, toppings) => {
        if (err) return callback(err);
        db.query(countQuery, (err, countResult) => {
          if (err) return callback(err);

          const totalToppings = countResult[0].total_toppings;
          callback(null, { toppings, totalToppings });
        });
      });

    }


  },

  getById: (id, callback) => {
    const query = 'SELECT * FROM topping WHERE topping_id = ?';
    db.query(query, [id], callback);
  },

  create: (toppingData, callback) => {
    const query = 'INSERT INTO topping SET ?';
    db.query(query, toppingData, callback);
  },

  update: (id, toppingData, callback) => {
    const query = 'UPDATE topping SET ? WHERE topping_id = ?';

    delete toppingData.topping_id;
    delete toppingData.date_added;
    db.query(query, [toppingData, id], callback);

  },

  delete: (id, callback) => {
    const query = 'DELETE FROM topping WHERE topping_id = ?';
    db.query(query, [id], callback);
  }
};

module.exports = Topping;
