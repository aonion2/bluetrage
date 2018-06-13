let sendOrderBF = require('./sendOrderBF.js');
let sendOrderZaif = require('./sendOrderZaif.js');
let callOrderFunction = require('./callsendorderFunction.js');
let callorderBF = require('./callsendorderBF.js')
let assetZaif = require('../asset/assetZaif.js');
let assetBF = require('../asset/assetBitFlyer.js');
let fs = require('fs');
let orderConfig = JSON.parse(fs.readFileSync('../../config/orderConfig.json'));

/*
let Log4js = require('log4js');

Log4js.configure('../../config/log-config.json');

// ログ出力
let systemLogger = Log4js.getLogger('system');
let accessLogger = Log4js.getLogger('access');
let errorLogger = Log4js.getLogger('error');

// Informationログを出力する
systemLogger.info('this is system log!!!');
accessLogger.info('this is access log!!!');
errorLogger.info('this is error log!!!');
*/

//Choose arbitrage type
//1:ZaifがBitflyerより高い。調整（BTCをZaif->bitflyer）（bitflyer:Buy, Zaif:Sell）
//2:BitflyerがZaifより高い。調整（BTCをbitflyer->Zaif）（bitflyer:Sell, Zaif:Buy）
let arbitrageOrderType = '';
let normalTrade = '';
let diffGO = orderConfig.diffGO;
let diffFlat = orderConfig.diffFlat;
let minOrderSizeBTCconfig = orderConfig.minOrderSizeOptimizeBTC;
let minOrderSizeBTC = '';
let antiOrderSize = orderConfig.antiOrderSize;
let diffPrice = 0;
let judgeGO = '';
let logPrice1 = [];
let logPrice2 = [];
let logOrderInfoForTest = [];
let timeoutValue = 10000;

let timer1 = null;
let cnt = 0;
let pricelog = {};
let priceGotton1 = {};
let priceGotton2 = {};

let lockFlag = "";

//test mode
//0:production mode, 1:test mode
let testMode = orderConfig.testMode;
if (testMode == 1){
  size = orderConfig.testOrderSize;
  marketLimitBF = orderConfig.testMarketLimitBF;
}else{
  size = orderConfig.orderSize;
  marketLimitBF = orderConfig.prodMarketLimitBF;
}

//Function2 資産残高を取得
let zaifJPYPriceForCheck = "";
let zaifBTCPriceForCheck = "";
let BFJPYPriceForCheck = "";
let BFBTCPriceForCheck = "";

let zaifPrice = "";
let BFPrice = "";
let CCPrice = "";
let QXPrice = "";

// callback
let callbackAsset = function(exchangeAsset){
    zaifJPYPriceForCheck = exchangeAsset[0].jpyAssetZaif;
    zaifBTCPriceForCheck = exchangeAsset[1].btcAssetZaif;
    BFJPYPriceForCheck = exchangeAsset[2].jpyassetbf;
    BFBTCPriceForCheck = exchangeAsset[3].btcassetbf;
    CCJPYPriceForCheck = exchangeAsset[4].jpyAssetCC;
    CCBTCPriceForCheck = exchangeAsset[5].btcAssetCC;
    QXJPYPriceForCheck = exchangeAsset[6].jpyAssetQX;
    QXBTCPriceForCheck = exchangeAsset[7].btcAssetQX;
};

let callbackAssetCheckFlag = function(assetCheckFlag){
    assetCheckForArbitrage = assetCheckFlag
    CCBuyable  = assetCheckFlag[0];
    CCSellable = assetCheckFlag[1];
    BFBuyable = assetCheckFlag[2];
    BFSellable = assetCheckFlag[3];
    QXBuyable = assetCheckFlag[4];
    QXSellable = assetCheckFlag[5];
};

let callbackExchangePrice = function(exchangePrice){
    BFPrice = exchangePrice[0].BFPrice;
    //zaifPrice = exchangePrice[1].zaifPrice;
    zaifPrice = 0;
    CCPrice = exchangePrice[2].CCPrice;
    QXPrice = exchangePrice[7].QXPrice;
    BFPriceLower = exchangePrice[3].BFPriceLower;
    BFPriceUpper = exchangePrice[4].BFPriceUpper;
    CCPriceLower = exchangePrice[5].CCPriceLower;
    CCPriceUpper = exchangePrice[6].CCPriceUpper;
    QXPriceLower = exchangePrice[8].QXPriceLower;
    QXPriceUpper = exchangePrice[9].QXPriceUpper;
};

let callbackCheckAsset = function(assetCheckB){
    assetCheck = assetCheckB;
};
let callbackCheckCCAsset = function(assetCCCheckB){
    assetCCCheck = assetCCCheckB;
};
let marketStatusAdd = "";
let callbackMarketStatus = function(marketStatusAddB){
    marketStatusAdd = marketStatusAddB;
};

let orderGOAnti ="";
let antiSize ="";
let callbackAntiTrade = function(orderGOAntiB,arbitrageOrderTypeB){
    orderGOAnti = orderGOAntiB;
    if(orderGOAnti==="1"){
      arbitrageOrderType = arbitrageOrderTypeB;
    }
};

let orderGOArbitrage ="";
let callbackArbitrageTrade = function(orderGOArbitrageB, arbitrageOrderTypeB, diffPriceB, diffPerB, diffPerArrayB){
    orderGOArbitrage = orderGOArbitrageB;
    diffPrice = diffPriceB;
    diffPer = diffPerB;
    diffPerArray = diffPerArrayB
    if(orderGOArbitrage==="1"){
      arbitrageOrderType = arbitrageOrderTypeB;
      normalTrade = "1";
      judgeGO = "1";
    }
};
// Function1 Asset取得
callOrderFunction.getAsset(callbackAsset);

//注文残高（お金、コインが足りているか）チェックフラグ
let zaifBuyable = "";
let zaifSellable = "";
let BFBuyable = "";
let BFSellable = "";
let CCBuyable = "";
let CCSellable = "";

function event() {
    cnt++;
    //0. Get market status
    //1.各取引所の価格を取得する　{price}
    //2.差分をチェックする {price->diff->diffcheck->buyorsell}
    //2.1差分がなければ収束をチェックする {price->diff->flatcheck->buyorsell}
    //3.差分または収束ありの場合、注文サイズを取得する {asset,price->size}
    //4.資産チェック
    //5.注文する{buyorsell,size}

    //0. Get market status
    callOrderFunction.getMarketStatus(callbackMarketStatus);
    setTimeout(function(){
        diffGO = orderConfig.diffGO + marketStatusAdd
    },1000)

    //1.各取引所の価格を取得する　{price}
    callOrderFunction.getPrice(callbackExchangePrice);
    setTimeout(function(){
      logPrice1 = [];
      logPrice2 = [];
      judgeGO = "";
      assetCheck = "";
      // pricelog = {zaifPrice:zaifPrice,BFPrice:BFPrice,CCPrice:CCPrice}
      priceGotton1 = {BFPriceUpper:BFPriceUpper,CCPriceUpper:CCPriceUpper}
      priceGotton2 = {BFPriceLower:BFPriceLower,CCPriceLower:CCPriceLower}
      logPrice1.push(priceGotton1)
      logPrice2.push(priceGotton2)

      /*Check用Diff取得
      let diffBFCC = Math.abs(BFPrice-CCPrice);
      let diffBFQX = Math.abs(BFPrice-QXPrice);
      let diffBFZF = Math.abs(BFPrice-zaifPrice);
      let diffCCQX = Math.abs(CCPrice-QXPrice);
      let diffCCZF = Math.abs(CCPrice-zaifPrice);
      let diffQXZF = Math.abs(QXPrice-zaifPrice);

      console.log("diffBFCC:"+(Math.round(diffBFCC * 100) / 100)+" diffBFQX:"+(Math.round(diffBFQX * 100) / 100)
      +" diffBFZF:"+(Math.round(diffBFZF * 100) / 100)+" diffCCQX:"+(Math.round(diffCCQX * 100) / 100)
      +" diffCCZF:"+(Math.round(diffCCZF * 100) / 100)+" diffQXZF:"+(Math.round(diffQXZF * 100) / 100))
      */

      //Asset Check Flag Setting
      callOrderFunction.getAssetCheckFlagSetting(CCJPYPriceForCheck, CCBTCPriceForCheck, BFJPYPriceForCheck, BFBTCPriceForCheck, QXJPYPriceForCheck, QXBTCPriceForCheck, size, CCPrice, BFPrice, QXPrice, callbackAssetCheckFlag);

      if(CCPrice==="" || BFPrice==="" || BFJPYPriceForCheck==="" || CCJPYPriceForCheck==="" || QXJPYPriceForCheck===""){
        console.log("Err:価格取得できず")
      }else{
        //2.差分をチェックする {price->diff->diffcheck->buyorsell}

        //For test
        /*1. All flat no diff
        BFPriceLower = 990000;
        BFPriceUpper = 993000;
        CCPriceLower = 990000;
        CCPriceUpper = 993000;
        QXPriceLower = 990000;
        QXPriceUpper = 993000;
        //*/
        /*2. BF > QX > CC
        BFPriceLower = 990000;
        BFPriceUpper = 993000;
        CCPriceLower = 950000;
        CCPriceUpper = 960000;
        QXPriceLower = 970000;
        QXPriceUpper = 980000;
        //*/
        /*3. BF > CC > QX
        BFPriceLower = 990000;
        BFPriceUpper = 993000;
        CCPriceLower = 970000;
        CCPriceUpper = 980000;
        QXPriceLower = 950000;
        QXPriceUpper = 960000;
        //*/
        /*4. QX > BF > CC
        BFPriceLower = 970000;
        BFPriceUpper = 980000;
        CCPriceLower = 950000;
        CCPriceUpper = 960000;
        QXPriceLower = 990000;
        QXPriceUpper = 993000;
        //*/
        /*5. QX > CC > BF
        BFPriceLower = 950000;
        BFPriceUpper = 960000;
        CCPriceLower = 970000;
        CCPriceUpper = 980000;
        QXPriceLower = 990000;
        QXPriceUpper = 993000;
        //*/
        /*6. CC > QX > BF
        BFPriceLower = 950000;
        BFPriceUpper = 960000;
        CCPriceLower = 990000;
        CCPriceUpper = 993000;
        QXPriceLower = 970000;
        QXPriceUpper = 980000;
        //*/
        /*7. CC > BF > QX
        BFPriceLower = 950000;
        BFPriceUpper = 960000;
        CCPriceLower = 990000;
        CCPriceUpper = 993000;
        QXPriceLower = 930000;
        QXPriceUpper = 940000;
        //*/
        /*8. QX > BF > CC(no asset)
        BFPriceLower = 970000;
        BFPriceUpper = 980000;
        CCPriceLower = 950000;
        CCPriceUpper = 960000;
        QXPriceLower = 990000;
        QXPriceUpper = 993000;
        //*/
        /*9. CC > QX > BF(no asset)
        BFPriceLower = 950000;
        BFPriceUpper = 960000;
        CCPriceLower = 990000;
        CCPriceUpper = 993000;
        QXPriceLower = 970000;
        QXPriceUpper = 980000;
        //*/
        /*10. CC > BF > QX(no asset)
        BFPriceLower = 950000;
        BFPriceUpper = 960000;
        CCPriceLower = 990000;
        CCPriceUpper = 993000;
        QXPriceLower = 930000;
        QXPriceUpper = 940000;
        //*/
        /*11. QX(no asset) > BF > CC
        BFPriceLower = 970000;
        BFPriceUpper = 980000;
        CCPriceLower = 950000;
        CCPriceUpper = 960000;
        QXPriceLower = 990000;
        QXPriceUpper = 993000;
        //*/
        /*12. CC(no asset) > QX > BF
        BFPriceLower = 950000;
        BFPriceUpper = 960000;
        CCPriceLower = 990000;
        CCPriceUpper = 993000;
        QXPriceLower = 970000;
        QXPriceUpper = 980000;
        //*/
        /*13. BF(no asset) > CC > QX
        BFPriceLower = 990000;
        BFPriceUpper = 993000;
        CCPriceLower = 970000;
        CCPriceUpper = 980000;
        QXPriceLower = 950000;
        QXPriceUpper = 960000;
        //*/

        let priceInfo = [];
        let priceInfoCulumn = {
            "CCPrice":CCPrice,
            "BFPrice":BFPrice,
            "QXPrice":QXPrice,
            "BFPriceLower":BFPriceLower,
            "BFPriceUpper":BFPriceUpper,
            "CCPriceLower":CCPriceLower,
            "CCPriceUpper":CCPriceUpper,
            "QXPriceLower":QXPriceLower,
            "QXPriceUpper":QXPriceUpper,
            "diffPriceBFminusCC":BFPriceLower-CCPriceUpper,
            "diffPriceCCminusBF":CCPriceLower-BFPriceUpper,
            "diffPriceBFminusQX":BFPriceLower-QXPriceUpper,
            "diffPriceQXminusBF":QXPriceLower-BFPriceUpper,
            "diffPriceQXminusCC":QXPriceLower-CCPriceUpper,
            "diffPriceCCminusQX":CCPriceLower-QXPriceUpper
        }
        priceInfo.push(priceInfoCulumn)
        callOrderFunction.getArbitrageTrade(priceInfo, diffGO, assetCheckForArbitrage, callbackArbitrageTrade);
        /* For test
        console.log(arbitrageOrderType);
        console.log(normalTrade);
        console.log(judgeGO);
        console.log(diffPrice);
        console.log(diffPer);
        //*/

        //反対売買ロジック
        //BTCが乖離してたら、差分を埋める
        if(judgeGO !== "1"){
          callOrderFunction.getAntiTrade(BFBTCPriceForCheck,CCBTCPriceForCheck,QXBTCPriceForCheck,priceInfo,diffFlat,callbackAntiTrade);
          if(orderGOAnti === "1"){
            normalTrade = "2";
            judgeGO = "1";
            size = orderConfig.antiOrderSize;
          }
        }

          let logDate = new Date();
          console.log(logDate + "normalTrade:"+normalTrade+" type:"+arbitrageOrderType
           + " diffBF-CC:"+(Math.round(diffPerArray.diffPerBFminusCC * 10000) / 100)
           + " diffBF-QX:"+(Math.round(diffPerArray.diffPerBFminusQX * 10000) / 100)
           + " diffCC-BF:"+(Math.round(diffPerArray.diffPerCCminusBF * 10000) / 100)
           + " diffCC-QX:"+(Math.round(diffPerArray.diffPerCCminusQX * 10000) / 100)
           + " diffQX-BF:"+(Math.round(diffPerArray.diffPerQXminusBF * 10000) / 100)
           + " diffQX-CC:"+(Math.round(diffPerArray.diffPerQXminusCC * 10000) / 100)
           +" judegeGo:"+judgeGO)
          callOrderFunction.getDiff(BFPrice,CCPrice,zaifPrice);
      }

      //3/20ここまでテスト完了
      if (judgeGO === "1" && timer1 != null) {
          //指値のために本番ちょい安を設定
          let orderPriceSell = CCPrice - 50000;
          //指値のために本番ちょい高を設定
          let orderPriceBuy = CCPrice + 50000;
          //指値で絶対入らないぐらい高い売りを設定
          let testOrderPriceSell = CCPrice + 300000;
          //指値のために本番ちょい高を設定
          let testOrderPriceBuy = CCPrice - 300000;

          //Buy or Sell 判定
          let assetCheck = "";

          let sideBF = "";
          let sideCC = "";
          let sideQX = "";
          let testPriceBF = "";
          let testorderPriceCC = "";
          let testorderPriceQX = "";
          let prodorderPriceCC = "";
          let prodorderPriceQX = "";

          if (arbitrageOrderType === "BFBuyCCSell"){
            //side
            sideBF = "BUY";
            //sideZaif = "ask"; //action bid:買い、ask:売り
            sideCC = "sell";
            //price(test)
            testPriceBF = testOrderPriceBuy;
            //testorderPriceZaif = testOrderPriceSell;
            testorderPriceCC = testOrderPriceSell;
            //price(prod)
            //prodorderPriceZaif = orderPriceSell;
            prodorderPriceCC = orderPriceSell;
            if(BFBuyable == "1" && CCSellable == "1"){
              assetCheck = "1";
            }
          } else if (arbitrageOrderType === "CCBuyBFSell"){
            //side
            sideBF = "SELL";
            //sideZaif = "bid"; //action bid:買い、ask:売り
            sideCC = "buy";
            //price(test)
            testPriceBF = testOrderPriceSell;
            //testorderPriceZaif = testOrderPriceBuy;
            testorderPriceCC = testOrderPriceBuy;
            //price(prod)
            //prodorderPriceZaif = orderPriceBuy;
            prodorderPriceCC = orderPriceBuy;
            if(BFSellable == "1" && CCBuyable == "1"){
              assetCheck = "1";
            }
          } else if (arbitrageOrderType === "BFBuyQXSell"){
            //side
            sideBF = "BUY";
            //sideQX
            sideQX = "sell"
            //price(test)
            testPriceBF = testOrderPriceBuy;
              //testorderPriceZaif = testOrderPriceBuy;
            testorderPriceQX = testOrderPriceSell;

            //price(prod)
            //prodorderPriceZaif = orderPriceBuy;
            prodorderPriceQX = orderPriceSell;
            if(QXSellable == "1" && BFBuyable == "1"){
              assetCheck = "1";
            }
          } else if (arbitrageOrderType === "CCBuyQXSell"){
            //sideZaif = "bid"; //action bid:買い、ask:売り
            sideCC = "buy";
            //sideQX
            sideQX = "sell"
            //testorderPriceZaif = testOrderPriceBuy;
            testorderPriceCC = testOrderPriceBuy;
            //testorderPriceZaif = testOrderPriceBuy;
            testorderPriceQX = testOrderPriceSell;
            //price(prod)
            //prodorderPriceZaif = orderPriceBuy;
            prodorderPriceCC = orderPriceBuy;
            //prodorderPriceZaif = orderPriceBuy;
            prodorderPriceQX = orderPriceSell;
            if(QXSellable == "1" && CCBuyable == "1"){
              assetCheck = "1";
            }
          } else if (arbitrageOrderType === "QXBuyBFSell"){
            //side
            sideBF = "SELL";
            //sideQX
            sideQX = "buy"
            //price(test)
            testPriceBF = testOrderPriceSell;
            //testorderPriceZaif = testOrderPriceBuy;
            testorderPriceQX = testOrderPriceBuy;
            //price(prod)
            //prodorderPriceZaif = orderPriceBuy;
            prodorderPriceQX = orderPriceBuy;
            if(BFSellable == "1" && QXBuyable == "1"){
              assetCheck = "1";
            }
          } else if (arbitrageOrderType === "QXBuyCCSell"){
            //sideQX
            sideQX = "buy"
            //sideZaif = "bid"; //action bid:買い、ask:売り
            sideCC = "sell";
            //testorderPriceZaif = testOrderPriceBuy;
            testorderPriceQX = testOrderPriceBuy;
            //testorderPriceZaif = testOrderPriceBuy;
            testorderPriceCC = testOrderPriceSell;
            //price(prod)
            //prodorderPriceZaif = orderPriceBuy;
            prodorderPriceCC = orderPriceSell;
            //prodorderPriceZaif = orderPriceBuy;
            prodorderPriceQX = orderPriceBuy;
            if(CCSellable == "1" && QXBuyable == "1"){
              assetCheck = "1";
            }
          } else {
            judgeGO = "";
            console.log("Side取得エラー")
          }
        console.log("assetCheck:"+assetCheck)

        /*For test
        console.log("sideBF"+sideBF)
        console.log("sideCC"+sideCC)
        console.log("sideQX"+sideQX)
        console.log("testorderPriceCC"+testorderPriceCC)
        console.log("testorderPriceQX"+testorderPriceQX)
        console.log("testPriceBF"+testPriceBF)
        console.log("prodorderPriceCC"+prodorderPriceCC)
        console.log("prodorderPriceQX"+prodorderPriceQX)
        //*/

        // let checkOK = "";

          // test prod setting
        let message = "";
        if (testMode == 1){
          //orderPriceZaif = testorderPriceZaif;
          orderPriceCC = testorderPriceCC;
          orderPriceBF = testPriceBF;
          orderPriceQX = testorderPriceQX;
          message = "テスト発注です"
        }else{
          //orderPriceZaif = prodorderPriceZaif;
          orderPriceCC = prodorderPriceCC;
          orderPriceBF = 0;
          orderPriceQX = prodorderPriceQX;
          message = "本番発注です"
        }

        if(testMode=='1'){
            let orderInfoForTest = {judgeGO:judgeGO,assetCheck:assetCheck,sideCC:sideCC,orderPriceCC:orderPriceCC,
            size:size,sideBF:sideBF,orderPriceBF:orderPriceBF,sideQX:sideQX,orderPriceQX:orderPriceQX}
            logOrderInfoForTest.push(orderInfoForTest)
            console.log(JSON.stringify(logOrderInfoForTest))
        }else if(judgeGO != "1" || assetCheck != "1" || lockFlag === "1"){
            console.log("orderしない");
        }else{
            // 注文呼び出し
            //callOrderFunction.sendOrderBFandZaif(sideZaif,orderPriceZaif, size, marketLimitBF, sideBF, orderPriceBF)
            if(arbitrageOrderType === "BFBuyCCSell" || arbitrageOrderType === "CCBuyBFSell"){
              callOrderFunction.sendOrderBFandCC(sideCC,orderPriceCC, size, marketLimitBF, sideBF, orderPriceBF)
            } else if(arbitrageOrderType === "BFBuyQXSell" || arbitrageOrderType === "QXBuyBFSell") {
              callOrderFunction.sendOrderBFandQX(size, marketLimitBF, sideBF, orderPriceBF, sideQX, orderPriceQX)
            } else if(arbitrageOrderType === "CCBuyQXSell" || arbitrageOrderType === "QXBuyCCSell") {
              callOrderFunction.sendOrderCCandQX(size, sideCC, orderPriceCC, sideQX, orderPriceQX)
            }

            console.log("normalTrade(1:アビトラ,2:反対):"+normalTrade
            + " diffBF-CC:"+(Math.round(diffPerArray.diffPerBFminusCC * 10000) / 100)
            + " diffBF-QX:"+(Math.round(diffPerArray.diffPerBFminusQX * 10000) / 100)
            + " diffCC-BF:"+(Math.round(diffPerArray.diffPerCCminusBF * 10000) / 100)
            + " diffCC-QX:"+(Math.round(diffPerArray.diffPerCCminusQX * 10000) / 100)
            + " diffQX-BF:"+(Math.round(diffPerArray.diffPerQXminusBF * 10000) / 100)
            + " diffQX-CC:"+(Math.round(diffPerArray.diffPerQXminusCC * 10000) / 100)
            + " diffGO:"+diffGO)
            lockFlag = "1";
            //setTimeout(function(){
            clearInterval(timer1);
            //},1000)
        }
        console.log(message)

    }
  },2800);
}

setTimeout(function(){
  //コインチェック資産チェック
  callOrderFunction.checkCCAsset(BFBTCPriceForCheck,CCBTCPriceForCheck, QXBTCPriceForCheck, orderConfig.TotalBTCAsset, callbackCheckCCAsset)
  //価格チェック
  if(BFJPYPriceForCheck==="" || CCJPYPriceForCheck==="" || QXJPYPriceForCheck==="" ||typeof BFJPYPriceForCheck === 'undefined' || typeof CCJPYPriceForCheck === 'undefined' || typeof QXJPYPriceForCheck === 'undefined' || assetCCCheck == ""){
      console.log("Err:資産情報取得エラー")
  } else {
    logPrice = [];
    pricelog = {
      "BFJPYPriceForCheck":BFJPYPriceForCheck,
      "BFBTCPriceForCheck":BFBTCPriceForCheck,
      "CCJPYPriceForCheck":CCJPYPriceForCheck,
      "CCBTCPriceForCheck":CCBTCPriceForCheck,
      "QXJPYPriceForCheck":QXJPYPriceForCheck,
      "QXBTCPriceForCheck":QXBTCPriceForCheck,
      "Total":(Math.round(BFJPYPriceForCheck * 10000) / 10000)
      + (Math.round(CCJPYPriceForCheck * 10000) / 10000)
      + (Math.round(QXJPYPriceForCheck * 10000) / 10000)
      + ((Math.round(BFBTCPriceForCheck * 10000) / 10000)+(Math.round(CCBTCPriceForCheck * 10000) / 10000)+(Math.round(QXBTCPriceForCheck * 10000) / 10000))*900000
    }
    logPrice.push(pricelog)
    console.log(JSON.stringify(logPrice))
    setTimeout(function(){
      timer1 = setInterval(event, 2700);
    },2000);
  }
},3000);
