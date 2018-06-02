var fs = require('fs');
var config = JSON.parse(fs.readFileSync('../../config/config.json'));
var zaif = require('zaif.jp');
var apiPublic = zaif.PublicApi;
zaif.Constant.OPT_TIMEOUT_SEC = 30;

var api = zaif.createPrivateApi(config.zaifApikey, config.zaifSecretkey, 'user agent is node-zaif');

//method
//sendOrderZaif
//Zaifにorderを発注する
//引数1 action:buy or sell, price:注文価格, amount:注文数量
module.exports = {
    sendOrderZaif: function(action, price, amount, callback2){
        api.trade('BTC_JPY', action, price, amount).then(function(res){
          var status = '';
          if(res.received>=0){
            console.log(res.received)
            status = '1';
            callback2(status);
          };
       });
    }
};

//指値:LIMIT, 成行:MARKET
//var child_order_type = 'LIMIT'
//var side = 'SELL';
// 指値の場合必須
//var price = 1000000;
//var size = 0.1;

//action bid:買い、ask:売り

//module.exports.sendOrder = function(m, x, y, z){

/*
    var timestamp = Date.now().toString();
    //var path = '/v1/me/sendchildorder'
    var method = 'POST';
    //var side = 'BUY'
    var body = JSON.stringify({
      "currency_pair": "BTC_JPY",
      "action": "bid",
      "price": 700000,
      "amount": 0.05,
    })
    var text = timestamp + method + body;
    var sign = crypto.createHmac('sha256', secret).update(text).digest('hex');
    var options = {
      url:'https://api.zaif.jp/tapi/',
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
    })
*/
//}
// sendOrder(side, price, size)
// sendOrder = sendOrder();
