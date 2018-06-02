var request = require('request');
var crypto = require('crypto');
var async = require('async');
var fs = require('fs');

var config = JSON.parse(fs.readFileSync('../../config/config.json'));

var key = config.ccApikey;
var secret = config.ccSecretkey;
var timestamp = Date.now().toString();
var sign = crypto.createHmac('sha256', secret).update(timestamp+ 'https://coincheck.com/api/accounts/balance').digest('hex');

module.exports = {
    getCCPrice: function(callbackGetCCPrice){
      var request = require('request');
      var path = '/api/ticker';
      var query = '';
      var url = 'https://coincheck.com' + path + query;
      request(url, function (err, response, payload) {
      var body = JSON.parse(payload);
      callbackGetCCPrice(body.last,body.bid,body.ask)
      });
    },
    getCCAsset: function(callbackGetCCAsset){
      var request = require('request');
      var path = '/api/accounts/balance';
      var query = '';
      var options = {
      url: 'https://coincheck.com' + path,
      method: 'GET',
      headers: {
      'ACCESS-KEY': key,
      'ACCESS-NONCE': timestamp,
      'ACCESS-SIGNATURE': sign
      }
      };
      request(options, function (err, response, payload) {
        var body = JSON.parse(payload);
        var jpyassetCC = body.jpy;
        var btcassetCC = body.btc;
        callbackGetCCAsset(jpyassetCC, btcassetCC)
        });
    }
};
