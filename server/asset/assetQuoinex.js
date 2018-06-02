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
    getQXPrice: function(callbackGetQXPrice){
      let request = require('request');
      let path = '/products/5';
      let query = '';
      let url = 'https://api.quoine.com/' + path + query;
      request(url, function (err, response, payload) {
      let body = JSON.parse(payload);
      callbackGetQXPrice(body.last_traded_price,body.market_bid,body.market_ask)
      });
    },
    getQXAsset: function(callbackGetQXAsset){
      let request = require('request');
      let path = '/accounts/balance';
      let query = '';
      let payload = {
        "path": '/accounts/balance',
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
        method: 'GET',
        headers: {
          'X-Quoine-API-Version': '2',
          'X-Quoine-Auth': sign
        }
      };

      request(options, function (err, response, payload) {
        let body = JSON.parse(payload);
        let jpyassetQX = body[2].balance;
        let btcassetQX = body[7].balance;
        callbackGetQXAsset(jpyassetQX, btcassetQX)
        });
    }
};
