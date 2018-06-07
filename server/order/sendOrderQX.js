let request = require('request');
let crypto = require('crypto');
let async = require('async');
let fs = require('fs');
let jwt = require('json-web-token');
let config = JSON.parse(fs.readFileSync('../../config/config.json'));

let key = config.qxApiKey;
let secret = config.qxSecretKey;

module.exports = {
    sendOrder: function(x, y, z){
      let request = require('request');
      let path = '/orders/';
      let query = '';
      let timestamp = Date.now().toString();
      let payload = {
        "path": '/orders/',
        "nonce": timestamp,
        "token_id": key
      };
      let orderInfo = JSON.stringify({
        "order": {
        "order_type": "limit",
        "product_id": 5,
        "side": x,
        "quantity": z,
        "price": y
      }})
      // encode
      jwt.encode(secret, payload, function (err, token) {
        if (err) {
          console.error(err.name, err.message);
        } else {
          sign = token;
        }
      });
      let options = {
        url: 'https://api.quoine.com' + path,
        method: 'POST',
        body: orderInfo,
        headers: {
          'X-Quoine-API-Version': '2',
          'X-Quoine-Auth': sign,
          'Content-Type' : 'application/json'
        }
      };

      request(options, function (err, response, payload) {
        let res = JSON.parse(payload);
        console.log(payload)
        // "status":"filled"チェック
        });
    },
    sendOrder2: function(x, y, z){
      let request = require('request');
      let path = '/orders/';
      let query = '';
      let timestamp = Date.now().toString();
      let payload = {
        "path": '/orders/',
        "nonce": timestamp,
        "token_id": key
      };
      let orderInfo = JSON.stringify({
        "order": {
        "order_type": "limit",
        "product_id": 5,
        "side": x,
        "quantity": z,
        "price": y
      }})
      // encode
      jwt.encode(secret, payload, function (err, token) {
        if (err) {
          console.error(err.name, err.message);
        } else {
          sign = token;
        }
      });
      let options = {
        url: 'https://api.quoine.com' + path,
        method: 'POST',
        body: orderInfo,
        headers: {
          'X-Quoine-API-Version': '2',
          'X-Quoine-Auth': sign,
          'Content-Type' : 'application/json'
        }
      };

      request(options, function (err, response, payload) {
        let res = JSON.parse(payload);
        console.log(payload)
        // "status":"filled"チェック
        });
    },
    cancelOrder: function(id){
      let request = require('request');
      let path = '/orders/' + id + '/cancel';
      let query = '';
      let timestamp = Date.now().toString();
      let payload = {
        "path": path,
        "nonce": timestamp,
        "token_id": key
      };
      // encode
      jwt.encode(secret, payload, function (err, token) {
        if (err) {
          console.error(err.name, err.message);
        } else {
          sign = token;
        }
      });
      let options = {
        url: 'https://api.quoine.com' + path,
        method: 'PUT',
        body: '',
        headers: {
          'X-Quoine-API-Version': '2',
          'X-Quoine-Auth': sign,
          'Content-Type' : 'application/json'
        }
      };

      request(options, function (err, response, payload) {
        console.log(payload)
        });
    },
    getOrder: function(callbackGetOrder){
      let request = require('request');
      let path = '/orders?funding_currency=JPY&product_id=5&status=live';
      let query = '';
      let timestamp = Date.now().toString();
      let payload = {
        "path": path,
        "nonce": timestamp,
        "token_id": key
      };
            console.log(payload.nonce)
      // encode
      jwt.encode(secret, payload, function (err, token) {
        if (err) {
          console.error(err.name, err.message);
        } else {
          sign = token;
        }
      });
      let options = {
        url: 'https://api.quoine.com' + path,
        method: 'GET',
        body: '',
        headers: {
          'X-Quoine-API-Version': '2',
          'X-Quoine-Auth': sign,
          'Content-Type' : 'application/json'
        }
      };

      request(options, function (err, response, payload) {
        let res = JSON.parse(payload);
        let stopQXb = "";
        let orderIDb = "";
        if(res.models.length === 0){
          stopQXb = "1";
        } else {
          orderIDb = res.models[0].id;
        }
        callbackGetOrder(orderIDb, stopQXb)
        });
    }
};
