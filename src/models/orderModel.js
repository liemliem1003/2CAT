const { json } = require('express');
const db = require('../config/db');
const Item = require('./itemModel')
const Topping = require('./toppingModel')


const Order = {
  getAll: (limit, paging, callback) => {
    limit ? limit = limit : limit = 10
    paging ? paging = paging : paging = 0

    const offset = limit * paging;
    const query = `SELECT * FROM Orders limit  ${limit} offset ${offset}`;
    const countQuery = `SELECT COUNT(*) AS total_orders FROM orders`;


    db.query(query, [limit, offset], (err, orders) => {
      if (err) return callback(err);
      db.query(countQuery, (err, countResult) => {
        if (err) return callback(err);

        const totalOrders = countResult[0].total_orders;
        callback(null, { orders, totalOrders });
      });
    });
  },

  getById: (id, callback) => {
    const query = 'SELECT * FROM orders WHERE order_id = ?';
    var dataItems
    var dataToppings
    var dataOrder


    db.query(query, [id], (err, result) => {
      dataOrder = result

      if (err) {
        return callback(err)
      }
      var queryOrderItems = `select * from order_items inner join items_for_sale on order_items.item_id = items_for_sale.item_id where order_items.order_id = ${id}`
      db.query(queryOrderItems, (err, result) => {
        if (err) {
          return callback(err)
        }
        db.query(queryOrderItems, (err, result) => {
          if (err) {
            return callback(err)
          }
          dataItems = result
          var queryOrderToppings = `select * from order_toppings inner join topping on order_toppings.topping_id = topping.topping_id where order_toppings.order_id = ${id}`
          db.query(queryOrderToppings, (err, result) => {
            if (err) {
              return callback(err)
            }
            dataToppings = result
            return callback(null, {
              order: dataOrder[0],
              items: dataItems,
              toppings: dataToppings
            })
          })
        })
      })
    });
  },
  create: (orderData, callback) => {
    var d = new Date()
    var orderDate = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
    const query = `INSERT INTO orders (order_date,total_price,status) values ('${orderDate}',${orderData.total_price},0)`;
    if (orderData.items.length == 0) {
      return callback(null, { result: "null" })
    }
    db.query(query, (err, result) => {
      if (err) {
        callback(err)
      }
      var orderID = result.insertId
      if (orderData.items.length > 0) {
        var queryOrderItems = "INSERT INTO order_items (item_id,order_id,quantity,price) values "
        for (let i = 0; i < orderData.items.length; i++) {
          var value = `(${orderData.items[i].item_id},${orderID},${orderData.items[i].quantity},${orderData.items[i].price})`
          queryOrderItems += value
          i < orderData.items.length - 1 ? queryOrderItems += "," : true
        }
        db.query(queryOrderItems, (err, result) => {
          if (err) {
            return callback(err)
          }
          console.log(queryOrderItems);

          if (orderData.toppings.length > 0) {
            var queryOrderToppings = "INSERT INTO order_toppings (topping_id,order_id,item_id,quantity,price) values "
            for (let i = 0; i < orderData.toppings.length; i++) {
              var value = `(${orderData.toppings[i].topping_id},${orderID},${orderData.toppings[i].item_id},${orderData.toppings[i].quantity},${orderData.toppings[i].price})`
              queryOrderToppings += value
              i < orderData.toppings.length - 1 ? queryOrderToppings += "," : true
            }
            console.log(queryOrderToppings);
            db.query(queryOrderToppings, (err, result) => {
              if (err) {
                return callback(err)
              }
              return callback(null, { result: "success" })
            })
          } else {
            return callback(null, { result: "success" })
          }
        })
      }
    });
  },
  update: (id, orderData, callback) => {
    const queryOrderUpdate = `UPDATE orders SET total_price = ${orderData.total_price}, status = ${orderData.status} WHERE order_id = ${id}`;
    db.query(queryOrderUpdate, (err, result) => {
      if (err) {
        return callback(err);
      }

      if (orderData.items.length > 0) {
        let itemValues = [];
        orderData.items.forEach(item => {
          itemValues.push(`(${item.order_item_id || 'NULL'}, ${item.item_id}, ${id}, ${item.quantity}, ${item.price})`);
        });

        if (itemValues.length > 0) {
          let queryOrderItems = `
                    INSERT INTO order_items (order_item_id, item_id, order_id, quantity, price)
                    VALUES ${itemValues.join(', ')}
                    ON DUPLICATE KEY UPDATE
                        quantity = VALUES(quantity),
                        price = VALUES(price);
                `;

          db.query(queryOrderItems, (err, result) => {
            if (err) {
              return callback(err);
            }

            if (orderData.toppings.length > 0) {
              let toppingValues = [];
              orderData.toppings.forEach(topping => {
                toppingValues.push(`(${topping.order_topping_id || 'NULL'}, ${topping.item_id}, ${id}, ${topping.quantity}, ${topping.price})`);
              });

              if (toppingValues.length > 0) {
                let queryOrderToppings = `
                                INSERT INTO order_toppings (order_topping_id, item_id, order_id, quantity, price)
                                VALUES ${toppingValues.join(', ')}
                                ON DUPLICATE KEY UPDATE
                                    quantity = VALUES(quantity),
                                    price = VALUES(price);
                            `;

                db.query(queryOrderToppings, (err, result) => {
                  if (err) {
                    return callback(err);
                  }
                  return callback(null, { result: "success" });
                });
              } else {
                return callback(null, { result: "success" });
              }
            } else {
              return callback(null, { result: "success" });
            }
          });
        } else {
          if (orderData.toppings.length > 0) {
            let toppingValues = [];
            orderData.toppings.forEach(topping => {
              toppingValues.push(`(${topping.order_topping_id || 'NULL'}, ${topping.item_id}, ${id}, ${topping.quantity}, ${topping.price})`);
            });

            if (toppingValues.length > 0) {
              let queryOrderToppings = `
                            INSERT INTO order_toppings (order_topping_id, item_id, order_id, quantity, price)
                            VALUES ${toppingValues.join(', ')}
                            ON DUPLICATE KEY UPDATE
                                quantity = VALUES(quantity),
                                price = VALUES(price);
                        `;

              db.query(queryOrderToppings, (err, result) => {
                if (err) {
                  return callback(err);
                }
                return callback(null, { result: "success" });
              });
            } else {
              return callback(null, { result: "success" });
            }
          } else {
            return callback(null, { result: "success" });
          }
        }
      } else {
        if (orderData.toppings.length > 0) {
          let toppingValues = [];
          orderData.toppings.forEach(topping => {
            toppingValues.push(`(${topping.order_topping_id || 'NULL'}, ${topping.item_id}, ${id}, ${topping.quantity}, ${topping.price})`);
          });

          if (toppingValues.length > 0) {
            let queryOrderToppings = `
                        INSERT INTO order_toppings (order_topping_id, item_id, order_id, quantity, price)
                        VALUES ${toppingValues.join(', ')}
                        ON DUPLICATE KEY UPDATE
                            quantity = VALUES(quantity),
                            price = VALUES(price);
                    `;

            db.query(queryOrderToppings, (err, result) => {
              if (err) {
                return callback(err);
              }
              return callback(null, { result: "success" });
            });
          } else {
            return callback(null, { result: "success" });
          }
        } else {
          return callback(null, { result: "success" });
        }
      }
    });
  },


  // update: (id, orderData, callback) => {
  //   console.log(orderData);

  //   const query = 'UPDATE orders SET ? WHERE order_id = ?';

  //   var price = 0;
  //   //update items
  //   if (orderData.items != null) {
  //     for (let i = 0; i < orderData.items.length; i++) {
  //       if (orderData.items[i].order_item_id == null) {
  //         const query = 'INSERT INTO order_items SET ?';
  //         orderData.items[i].order_id = id
  //         db.query(query, orderData.items[i], (err, result) => {
  //           if (err) {
  //             callback(err)
  //           }
  //         })
  //       } else {
  //         const query = 'UPDATE order_items SET ? WHERE order_item_id = ?';
  //         db.query(query, [orderData.items[i], orderData.items[i].order_item_id], (err, result) => {
  //           if (err) {
  //             callback(err)
  //           }
  //         })
  //       }
  //       price += orderData.items[i].price
  //     }
  //   }

  //   //update toppings

  //   if (orderData.toppings != null) {
  //     for (let i = 0; i < orderData.toppings.length; i++) {
  //       if (orderData.toppings[i].order_topping_id == null) {
  //         const query = 'INSERT INTO order_toppings SET ?';
  //         orderData.toppings[i].order_id = id
  //         db.query(query, orderData.toppings[i], (err, result) => {
  //           if (err) {
  //             callback(err)
  //           }
  //         })
  //       } else {
  //         const query = 'UPDATE order_toppings SET ? WHERE order_topping_id = ?';
  //         db.query(query, [orderData.toppings[i], orderData.toppings[i].order_topping_id], (err, result) => {
  //           if (err) {
  //             callback(err)
  //           }
  //         })
  //       }
  //       price += orderData.toppings[i].price
  //     }
  //   }



  //   delete orderData.order_id;
  //   delete orderData.date_added;
  //   delete orderData.items;
  //   delete orderData.toppings;

  //   orderData.total_price = price;

  //   db.query(query, [orderData, id], callback);

  // },

  delete: (id, callback) => {
    const query = 'DELETE FROM orders WHERE orders_id = ?';
    db.query(query, [id], callback);
  }
};

module.exports = Order;
