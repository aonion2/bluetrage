var assetBF = require('./assetBitFlyer.js');
var assetBFFX = require('./assetBitFlyerFX.js');

assetBF.assetBF(function(c){
//  console.log(c);
});
assetBFFX.assetBFFX();

/*
        console.log("---bitflyer現物---")
        console.log("JPY:"+assetBF.jpy_available)
        console.log("BTC:"+btc_available)
        console.log("BTC(円換):"+total_assets)
        console.log("Total:"+total)


*/
