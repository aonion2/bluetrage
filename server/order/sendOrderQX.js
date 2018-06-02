let request = require('request');
let crypto = require('crypto');
let async = require('async');
let fs = require('fs');
let jwt = require('json-web-token');
let config = JSON.parse(fs.readFileSync('../../config/config.json'));

let key = config.qxApiKey;
let secret = config.qxSecretKey;
let timestamp = Date.now().toString();

module.exports = {
    sendOrder: function(x, y, z){
      let request = require('request');
      let path = '/orders/';
      let query = '';
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
    }
};
