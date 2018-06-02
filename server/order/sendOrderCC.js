var request = require('request');
var crypto = require('crypto');
var fs = require('fs');
var async = require('async');
var config = JSON.parse(fs.readFileSync('../../config/config.json'));


var key = config.ccApikey;
var secret = config.ccSecretkey;

module.exports.sendOrder = function(x, y, z){
    var timestamp = Date.now().toString();
    var path = '/api/exchange/orders'
    var method = 'POST';
    var body = JSON.stringify({
      "pair": "btc_jpy",
      "order_type": x,
      "rate": y,
      "amount": z
    })
    var sign = crypto.createHmac('sha256', secret).update(timestamp+ 'https://coincheck.com/api/exchange/orders'+body).digest('hex');
    var options = {
      url:'https://coincheck.com/api/exchange/orders',
      method:method,
      body:body,
      headers: {
        'ACCESS-KEY': key,
        'ACCESS-NONCE': timestamp,
        'ACCESS-SIGNATURE': sign,
        'Content-Type': 'application/json'
      }
    };

    request(options, function(err, response, payload){
      console.log(payload);
    })

}
