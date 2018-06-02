var request = require('request');
var crypto = require('crypto');
var async = require('async');
var fs = require('fs');
var config = JSON.parse(fs.readFileSync('../../config/config.json'));

var key = config.apikey;
var secret = config.secretkey;

module.exports.assetBFFX = function(){
    var timestamp = Date.now().toString();
    var method = 'GET';
    var path = '/v1/me/getcollateral';
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
    var fxtotal = parseInt(body.collateral)+parseInt(body.open_position_pnl);
    console.log("bitflyerFX評価証拠金:"+fxtotal);
    });
};
