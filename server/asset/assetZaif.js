var fs = require('fs');
var config = JSON.parse(fs.readFileSync('../../config/config.json'));
var zaif = require('zaif.jp');
var apiPublic = zaif.PublicApi;
var last_price = '';
zaif.Constant.OPT_TIMEOUT_SEC = 30;

//method
//getZaifPrice
//Zaifから最新価格を取得する
//引数なし
module.exports = {
    getZaifPrice: function(callback){
      apiPublic.lastPrice('btc_jpy').then(function(res){
          var lastPrice = res.last_price;
          callback(lastPrice);
       });
    },
    getZaifAsset2: function(callback3){
       var api = zaif.createPrivateApi(config.zaifinfoApikey, config.zaifinfoSecretkey, 'user agent is node-zaif');
       api.getInfo().then(function(res){
           var jpyAssetZaif = res.deposit.jpy;
           var btcAssetZaif = res.deposit.btc;
           callback3(jpyAssetZaif, btcAssetZaif);
       });
    }
};

//method
//getZaifAsset
//Zaifの資産情報を表示する
//引数なし
module.exports.getZaifAsset = function(){
    var api = zaif.createPrivateApi(config.zaifinfoApikey, config.zaifinfoSecretkey, 'user agent is node-zaif');

    api.getInfo().then(function(res){
        var zaifJPY = res.deposit.jpy;
        var zaifBTC = res.deposit.btc;
        exports.zaifJPY = zaifJPY;
        exports.zaifBTC = zaifBTC;
        console.log("JPY:"+zaifJPY);
        console.log("BTC:"+zaifBTC);
    });
};
