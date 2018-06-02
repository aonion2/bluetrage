// Node.js のサンプル
var PubNub = require('pubnub');
var pubnub = new PubNub({
    subscribeKey: 'sub-c-52a9ab50-291b-11e5-baaa-0619f8945a4f'
});
pubnub.addListener({
    message: function (message) {
        //console.log(message.channel, message.message);
        //console.log(message.channel);

        //console.log(message.best_bid);
        var bfprice = message.message.ltp
        var dummyCCprice = 915000
        console.log("ask:"+message.message.best_ask+"-bid:"+message.message.best_bid+"-(diff:"+ (parseInt(message.message.best_ask) - parseInt(message.message.best_bid))+")");
        //console.log((dummyCCprice-bfprice)/bfprice);
        //console.log(6000/900000);
        if(bfprice>=dummyCCprice){
          var biggerPrice = bfprice;
          var smallerPrice = dummyCCprice;
        }else {
          var biggerPrice = dummyCCprice;
          var smallerPrice = bfprice;
        }


        var ratioBFandCC = (biggerPrice-smallerPrice)/biggerPrice;

        //残高チェック

        if(ratioBFandCC>0.008 && bfprice > dummyCCprice){
          //console.log("BF is bigger than CC");
          //console.log("BF:"+bfprice+" - CC"+dummyCCprice);
          //bfで売り注文発注
          //CCで買い注文発注
        } else if (ratioBFandCC<0.002) {
          //console.log("diff is smaller")
          //console.log("BF:"+bfprice+" - CC"+dummyCCprice);
          //発注
        }
      }
});
pubnub.subscribe({
    channels: ['lightning_ticker_BTC_JPY']
});
