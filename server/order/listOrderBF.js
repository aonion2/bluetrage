var request = require('request');
var crypto = require('crypto');
var fs = require('fs');
var async = require('async');
var config = JSON.parse(fs.readFileSync('../../config/config.json'));


var key = config.apikey;
var secret = config.secretkey;

var timestamp = Date.now().toString();
var method = 'GET';
var path = '/v1/me/getchildorders';
var text = timestamp + method + path;
var sign = crypto.createHmac('sha256', secret).update(text).digest('hex');
var options = {
    url: 'https://api.bitflyer.jp' + path,
    method: method,
    headers: {
    'ACCESS-KEY': key,
    'ACCESS-TIMESTAMP': timestamp,
    'ACCESS-SIGN': sign
    }
};
request(options, function (err, response, payload) {
    var body = JSON.parse(payload);
    var sent = '';
    for (var i=0; i < body.length; i++){
      if (body[i].child_order_state != "COMPLETED"){
          console.log(body[i].child_order_state)
      }
    }
});
