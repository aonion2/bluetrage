var request = require('request');
var crypto = require('crypto');
var async = require('async');
var fs = require('fs');

var config = JSON.parse(fs.readFileSync('../../config/config.json'));

var key = config.apikey;
var secret = config.secretkey;
var timestamp = Date.now().toString();
var sign = crypto.createHmac('sha256', secret).update(timestamp + 'GET' + '/v1/me/getbalance').digest('hex');

module.exports = {
    getBFPrice: function(callback1){
      var request = require('request');
      var path = '/v1/getticker';
      var query = '';
      var url = 'https://api.bitflyer.jp' + path + query;
      request(url, function (err, response, payload) {
      var body = JSON.parse(payload);
      callback1(body.ltp,body.best_bid,body.best_ask)
      });
    },getBFAsset: function(callback4){
      var request = require('request');
      var path = '/v1/me/getbalance';
      var query = '';
      var options = {
      url: 'https://api.bitflyer.jp' + path,
      method: 'GET',
      headers: {
      'ACCESS-KEY': key,
      'ACCESS-TIMESTAMP': timestamp,
      'ACCESS-SIGN': sign
      }
      };
      request(options, function (err, response, payload) {
        var body = JSON.parse(payload);
        var jpyassetbf = body[0].amount;
        var btcassetbf = body[1].amount;
        callback4(jpyassetbf, btcassetbf)
        });
    },getBFMarketStatus: function(callbackBFMarketStatus){
      var request = require('request');
      var path = '/v1/gethealth';
      var query = '';
      var url = 'https://api.bitflyer.jp' + path + query;
      request(url, function (err, response, payload) {
        var body = JSON.parse(payload);
        callbackBFMarketStatus(body.status)
      });
    }
};
