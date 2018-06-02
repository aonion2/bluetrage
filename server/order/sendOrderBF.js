var request = require('request');
var crypto = require('crypto');
var fs = require('fs');
var async = require('async');
var config = JSON.parse(fs.readFileSync('../../config/config.json'));

var key = config.apikey;
var secret = config.secretkey;

//指値:LIMIT, 成行:MARKET
var child_order_type = 'LIMIT'
var side = 'SELL';
// 指値の場合必須
var price = 1000000;
var size = 0.1;

module.exports.sendOrder = function(m, x, y, z, callback5){
    var timestamp = Date.now().toString();
    var path = '/v1/me/sendchildorder'
    var method = 'POST';
    //var side = 'BUY'
    var body = JSON.stringify({
      "product_code": "BTC_JPY",
      "child_order_type": m,
      "side": x,
      "price": y,
      "size": z,
      "minute_to_expire": 10000,
      "time_in_force": "GTC"
    })
    var text = timestamp + method + path + body;
    var sign = crypto.createHmac('sha256', secret).update(text).digest('hex');
    var options = {
      url:'https://api.bitflyer.jp/v1/me/sendchildorder',
      method:method,
      body:body,
      headers: {
          'ACCESS-KEY': key,
          'ACCESS-TIMESTAMP': timestamp,
          'ACCESS-SIGN': sign,
          'Content-Type': 'application/json'
      }
    };

    request(options, function(err, response, payload){
      console.log(payload);
      let childOrderID = '';
      let status = '';
      childOrderID = JSON.parse(payload).child_order_acceptance_id;
      status = JSON.parse(payload).status;
      callback5(childOrderID,status);
    })

}
