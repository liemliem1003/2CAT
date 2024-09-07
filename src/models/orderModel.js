const { json } = require('express');
const db = require('../config/db');
const Item = require('./itemModel')
const Topping = require('./toppingModel')


const Order = {
  getAll: (limit, paging, callback) => {
    limit ? limit = limit : limit = 10;
    paging ? paging = paging : paging = 0;
    const offset = limit * paging;

    const query = `SELECT * FROM Orders LIMIT ${limit} OFFSET ${offset}`;
    console.log(query);
    
    const countQuery = `SELECT COUNT(*) AS total_orders FROM Orders`;
    db.query(query, (err, orders) => {
      if (err) return callback(err);
      db.query(countQuery, (err, countResult) => {
        if (err) return callback(err);

        let totalOrders = countResult[0].total_orders;

        // If no orders, return early
        if (!orders.length) {
          return callback(null, { orders, totalOrders });
        }

        let processedOrders = 0;  // Track how many orders have been processed
        let totalItems = 0; // Track the number of items to know when all items and toppings are processed

        orders.forEach((order, index) => {
          const queryItems = `select * from order_items inner join items_for_sale on order_items.item_id = items_for_sale.item_id where order_items.order_id = ?`;

          db.query(queryItems, [order.order_id], (err, items) => {
            if (err) return callback(err);

            orders[index].items = items; // Assign items to the order
            totalItems += items.length; // Track how many items need to have toppings assigned

            // If the order has no items, consider it processed
            if (!items.length) {
              processedOrders++;
              if (processedOrders === orders.length && totalItems === 0) {
                callback(null, { orders, totalOrders });
              }
            }
            items.forEach((item, i) => {
              const queryToppings = `select * from order_toppings inner join topping on order_toppings.topping_id = topping.topping_id
                                     where order_toppings.item_id = ? and order_toppings.order_id = ?`;

              db.query(queryToppings, [item.item_id, order.order_id], (err, toppings) => {
                if (err) return callback(err);

                // Assign toppings to the respective item
                orders[index].items[i].toppings = toppings;

                // Decrease totalItems after each topping query completes
                totalItems--;

                // When all toppings for all items are fetched, check if all orders are processed
                if (totalItems === 0 && processedOrders === orders.length) {
                  callback(null, { orders, totalOrders });
                }
              });
            });

            // If all items for the current order are processed
            processedOrders++;
            console.log(orders);
            
            if (processedOrders === orders.length && totalItems === 0) {
              callback(null, { orders, totalOrders });
            }
          });
        });
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
      var queryOrderItems = `select * from order_items inner join items_for_sale on order_items.item_id = items_for_sale.item_id where order_items.order_id = ${id} and order_items.status = 1`
      db.query(queryOrderItems, (err, result) => {
        if (err) {
          return callback(err)
        }
        db.query(queryOrderItems, (err, result) => {
          if (err) {
            return callback(err)
          }
          dataItems = result
          var queryOrderToppings = `select * from order_toppings inner join topping on order_toppings.topping_id = topping.topping_id where order_toppings.order_id = ${id} and order_toppings.status = 1`
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
          if (orderData.toppings.length > 0) {
            var queryOrderToppings = "INSERT INTO order_toppings (topping_id,order_id,item_id,quantity,price) values "
            for (let i = 0; i < orderData.toppings.length; i++) {
              var value = `(${orderData.toppings[i].topping_id},${orderID},${orderData.toppings[i].item_id},${orderData.toppings[i].quantity},${orderData.toppings[i].price})`
              queryOrderToppings += value
              i < orderData.toppings.length - 1 ? queryOrderToppings += "," : true
            }
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
  closeOrder: (id, callback) => {
    const query = `UPDATE orders SET status = 1 WHERE order_id = ${id}`;
    db.query(query, (err, result) => {
      if (err) {
        return callback(err);
      }
      return callback(null, { result: "success" });
    })
  },
  update: (id, orderData, callback) => {
    const queryOrderUpdate = `UPDATE orders SET total_price = ${orderData.total_price}, status = ${orderData.status} WHERE order_id = ${id}`;
    db.query(queryOrderUpdate, (err, result) => {
      if (err) {
        return callback(err);
      }
      if (orderData.removedItems.length != 0) {
        orderData.removedItems.forEach(item => {
          const queryRemovedItem = `UPDATE order_items SET status = 0 where order_item_id = ${item}`
          db.query(queryRemovedItem, (err, result) => {
            if (err) {
              callback(err)
            }
          })
        })
      }
      if (orderData.removedToppings.length != 0) {
        orderData.removedToppings.forEach(topping => {
          const removedToppings = `UPDATE order_items SET order_id = 0 where order_topping_id = ${topping}`
          db.query(removedToppings, (err, result) => {
            if (err) {
              callback(err)
            }
          })
        })
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
                toppingValues.push(`(${topping.order_topping_id || 'NULL'}, ${topping.item_id},${topping.topping_id}, ${id}, ${topping.quantity}, ${topping.price})`);
              });

              if (toppingValues.length > 0) {
                let queryOrderToppings = `
                                INSERT INTO order_toppings (order_topping_id, item_id, topping_id, order_id, quantity, price)
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
  delete: (id, callback) => {
    const query = 'DELETE FROM orders WHERE orders_id = ?';
    db.query(query, [id], callback);
  }
};

module.exports = Order;
