let assetZaif = require('../asset/assetZaif.js');
let assetBF = require('../asset/assetBitFlyer.js');
let assetCC = require('../asset/assetCoinCheck.js');
let assetQX = require('../asset/assetQuoinex.js');
let sendOrderBF = require('./sendOrderBF.js');
let sendOrderZaif = require('./sendOrderZaif.js');
let sendOrderCC = require('./sendOrderCC.js');
let sendOrderQX = require('./sendOrderQX.js');
let callorderBF = require('./callsendorderBF.js')

module.exports = {
    getPrice: function(callbackExchangePrice){
      //Function1 現在値を取得
      //zaif
      let exchangePrice = [];
      let callback = function(lastPrice){
        exchangePrice[1] = {zaifPrice:lastPrice};
      };
      assetZaif.getZaifPrice(callback);
      //BF
      let callback1 = function(lastPrice1,lowPrice,upperPrice){
        exchangePrice[0] = {BFPrice:lastPrice1};
        exchangePrice[3] = {BFPriceLower:lowPrice};
        exchangePrice[4] = {BFPriceUpper:upperPrice};
      };
      assetBF.getBFPrice(callback1);
      //Coincheck
      let callbackGetCCPrice = function(lastPrice2,lowPrice2,upperPrice2){
        exchangePrice[2] = {CCPrice:lastPrice2};
        exchangePrice[5] = {CCPriceLower:lowPrice2};
        exchangePrice[6] = {CCPriceUpper:upperPrice2};
      };
      assetCC.getCCPrice(callbackGetCCPrice);
      setTimeout(function(){
        callbackExchangePrice(exchangePrice)
      },1000);
      //Quoinex
      let callbackGetQXPrice = function(lastPrice3,lowPrice3,upperPrice3){
        exchangePrice[7] = {QXPrice:lastPrice3};
        exchangePrice[8] = {QXPriceLower:lowPrice3};
        exchangePrice[9] = {QXPriceUpper:upperPrice3};
      };
      assetQX.getQXPrice(callbackGetQXPrice);

      setTimeout(function(){
        callbackExchangePrice(exchangePrice)
      },1000);
    },
    getDiff: function(BFPrice,CCPrice,ZaifPrice){
      let diffBFandCC = "";
      let diffBFandZaif = "";
      let diffCCandZaif = "";
      let diffPerBFandCC = "";
      let diffPerBFandZaif = "";
      let diffPerCCandZaif = "";
      diffBFandCC = Math.abs(CCPrice-BFPrice);
      diffPerBFandCC = (Math.round((diffBFandCC/BFPrice) * 10000) / 100);
      diffBFandZaif = Math.abs(BFPrice-ZaifPrice);
      diffPerBFandZaif = (Math.round((diffBFandZaif/ZaifPrice) * 10000) / 100);
      diffCCandZaif = Math.abs(CCPrice-ZaifPrice);
      diffPerCCandZaif = (Math.round((diffCCandZaif/ZaifPrice) * 10000) / 100);
      pricelog2 = {diffBFandCC:diffBFandCC,diffPerBFandCC:diffPerBFandCC,diffBFandZaif:diffBFandZaif,diffPerBFandZaif:diffPerBFandZaif,diffCCandZaif:diffCCandZaif,diffPerCCandZaif:diffPerCCandZaif}
      //console.log(JSON.stringify(pricelog2))
    },
    /*
    Method:getAntiTrade
    引数:
    BFBTCPriceForCheck
    CCBTCPriceForCheck




    */
    getAntiTrade: function(BFBTCPriceForCheck, CCBTCPriceForCheck, QXBTCPriceForCheck, priceInfo, diffFlat, callbackAntiTrade){

      let orderGOAntiB = "";
      let arbitrageOrderTypeB = "";
      let diffPriceBFminusCC = priceInfo[0].BFPriceLower-priceInfo[0].CCPriceUpper;
      let diffPriceCCminusBF = priceInfo[0].CCPriceLower-priceInfo[0].BFPriceUpper;
      let diffPriceBFminusQX = priceInfo[0].BFPriceLower-priceInfo[0].QXPriceUpper;
      let diffPriceQXminusBF = priceInfo[0].QXPriceLower-priceInfo[0].BFPriceUpper;
      let diffPriceQXminusCC = priceInfo[0].QXPriceLower-priceInfo[0].CCPriceUpper;
      let diffPriceCCminusQX = priceInfo[0].CCPriceLower-priceInfo[0].QXPriceUpper;

      //For test
      /*Case1 Go and BF > QX > CC
      BFBTCPriceForCheck = 0.4
      QXBTCPriceForCheck = 0.3
      CCBTCPriceForCheck = 0.2
      diffPriceBFminusCC = 700
      diffPriceCCminusBF = 700
      diffPriceQXminusCC = 700
      diffPriceQXminusBF = 700
      diffPriceBFminusQX = 700
      diffPriceCCminusQX = 700
      //*/
      /*Case2 Go and BF > QX > CC
      BFBTCPriceForCheck = 0.4
      QXBTCPriceForCheck = 0.3
      CCBTCPriceForCheck = 0.2
      diffPriceBFminusCC = 400
      diffPriceCCminusBF = 700
      diffPriceQXminusCC = 700
      diffPriceQXminusBF = 700
      diffPriceBFminusQX = 700
      diffPriceCCminusQX = 700
      //*/
      /*Case3 Go and BF > CC > QX
      BFBTCPriceForCheck = 0.4
      QXBTCPriceForCheck = 0.2
      CCBTCPriceForCheck = 0.3
      diffPriceBFminusCC = 700
      diffPriceCCminusBF = 700
      diffPriceQXminusCC = 700
      diffPriceQXminusBF = 700
      diffPriceBFminusQX = 700
      diffPriceCCminusQX = 700
      //*/
      /*Case4 Go and BF > CC > QX
      BFBTCPriceForCheck = 0.4
      QXBTCPriceForCheck = 0.2
      CCBTCPriceForCheck = 0.3
      diffPriceBFminusCC = 700
      diffPriceCCminusBF = 700
      diffPriceQXminusCC = 700
      diffPriceQXminusBF = 700
      diffPriceBFminusQX = 400
      diffPriceCCminusQX = 700
      //*/
      /*Case5 Go and CC > BF > QX
      BFBTCPriceForCheck = 0.3
      QXBTCPriceForCheck = 0.2
      CCBTCPriceForCheck = 0.4
      diffPriceBFminusCC = 700
      diffPriceCCminusBF = 700
      diffPriceQXminusCC = 700
      diffPriceQXminusBF = 700
      diffPriceBFminusQX = 700
      diffPriceCCminusQX = 700
      //*/
      /*Case6 Go and CC > BF > QX
      BFBTCPriceForCheck = 0.3
      QXBTCPriceForCheck = 0.2
      CCBTCPriceForCheck = 0.4
      diffPriceBFminusCC = 700
      diffPriceCCminusBF = 700
      diffPriceQXminusCC = 700
      diffPriceQXminusBF = 700
      diffPriceBFminusQX = 700
      diffPriceCCminusQX = 400
      //*/
      /*Case7 Go and CC > QX > BF
      BFBTCPriceForCheck = 0.2
      QXBTCPriceForCheck = 0.3
      CCBTCPriceForCheck = 0.4
      diffPriceBFminusCC = 700
      diffPriceCCminusBF = 700
      diffPriceQXminusCC = 700
      diffPriceQXminusBF = 700
      diffPriceBFminusQX = 700
      diffPriceCCminusQX = 700
      //*/
      /*Case8 Go and CC > QX > BF
      BFBTCPriceForCheck = 0.2
      QXBTCPriceForCheck = 0.3
      CCBTCPriceForCheck = 0.4
      diffPriceBFminusCC = 700
      diffPriceCCminusBF = 400
      diffPriceQXminusCC = 700
      diffPriceQXminusBF = 700
      diffPriceBFminusQX = 700
      diffPriceCCminusQX = 400
      //*/
      /*Case9 Go and QX > CC > BF
      BFBTCPriceForCheck = 0.2
      QXBTCPriceForCheck = 0.4
      CCBTCPriceForCheck = 0.3
      diffPriceBFminusCC = 700
      diffPriceCCminusBF = 700
      diffPriceQXminusCC = 700
      diffPriceQXminusBF = 700
      diffPriceBFminusQX = 700
      diffPriceCCminusQX = 700
      //*/
      /*Case10 Go and QX > CC > BF
      BFBTCPriceForCheck = 0.2
      QXBTCPriceForCheck = 0.4
      CCBTCPriceForCheck = 0.3
      diffPriceBFminusCC = 700
      diffPriceCCminusBF = 700
      diffPriceQXminusCC = 700
      diffPriceQXminusBF = 400
      diffPriceBFminusQX = 700
      diffPriceCCminusQX = 400
      //*/
      /*Case11 Go and QX > BF > CC
      BFBTCPriceForCheck = 0.3
      QXBTCPriceForCheck = 0.4
      CCBTCPriceForCheck = 0.2
      diffPriceBFminusCC = 700
      diffPriceCCminusBF = 700
      diffPriceQXminusCC = 700
      diffPriceQXminusBF = 700
      diffPriceBFminusQX = 700
      diffPriceCCminusQX = 700
      //*/
      /*Case12 Go and QX > BF > CC
      BFBTCPriceForCheck = 0.3
      QXBTCPriceForCheck = 0.4
      CCBTCPriceForCheck = 0.2
      diffPriceBFminusCC = 700
      diffPriceCCminusBF = 700
      diffPriceQXminusCC = 400
      diffPriceQXminusBF = 700
      diffPriceBFminusQX = 700
      diffPriceCCminusQX = 400
      //*/

      maxBTCExchange = Math.max(BFBTCPriceForCheck,CCBTCPriceForCheck,QXBTCPriceForCheck);
      minBTCExchange = Math.min(BFBTCPriceForCheck,CCBTCPriceForCheck,QXBTCPriceForCheck);
      BFBTCPriceForCheck = Number(BFBTCPriceForCheck);
      CCBTCPriceForCheck = Number(CCBTCPriceForCheck);
      QXBTCPriceForCheck = Number(QXBTCPriceForCheck);

      if(maxBTCExchange-minBTCExchange>=0.1){
          if(maxBTCExchange===BFBTCPriceForCheck&&minBTCExchange===CCBTCPriceForCheck&&diffPriceBFminusCC>diffFlat){
            arbitrageOrderTypeB = "CCBuyBFSell";
            orderGOAntiB = "1";
          }else if(maxBTCExchange===BFBTCPriceForCheck&&minBTCExchange===QXBTCPriceForCheck&&diffPriceBFminusQX>diffFlat){
            arbitrageOrderTypeB = "QXBuyBFSell";
            orderGOAntiB = "1";
          }else if(maxBTCExchange===CCBTCPriceForCheck&&minBTCExchange===BFBTCPriceForCheck&&diffPriceCCminusBF>diffFlat){
            arbitrageOrderTypeB = "BFBuyCCSell";
            orderGOAntiB = "1";
          }else if(maxBTCExchange===CCBTCPriceForCheck&&minBTCExchange===QXBTCPriceForCheck&&diffPriceCCminusQX>diffFlat){
            arbitrageOrderTypeB = "QXBuyCCSell";
            orderGOAntiB = "1";
          }else if(maxBTCExchange===QXBTCPriceForCheck&&minBTCExchange===BFBTCPriceForCheck&&diffPriceQXminusBF>diffFlat-500){
            arbitrageOrderTypeB = "BFBuyQXSell";
            orderGOAntiB = "1";
          }else if(maxBTCExchange===QXBTCPriceForCheck&&minBTCExchange===CCBTCPriceForCheck&&diffPriceQXminusCC>diffFlat){
            arbitrageOrderTypeB = "CCBuyQXSell";
            orderGOAntiB = "1";
          }
      }
      callbackAntiTrade(orderGOAntiB, arbitrageOrderTypeB)
    },
    checkCCAsset: function(BFBTCPriceForCheck, CCBTCPriceForCheck, QXBTCPriceForCheck, TotalBTCAsset, callbackCheckCCAsset){
      let assetCCCheckB = "";
      let TotalBTCAssetForCheck = (Math.round(BFBTCPriceForCheck * 10000) / 10000) + (Math.round(CCBTCPriceForCheck * 10000) / 10000) + (Math.round(QXBTCPriceForCheck * 10000) / 10000);
      if((TotalBTCAssetForCheck > TotalBTCAsset - 0.03) && (TotalBTCAssetForCheck < TotalBTCAsset + 0.03)){
        assetCCCheckB = "1";
      }
      callbackCheckCCAsset(assetCCCheckB)
    },
    checkCCAsset2: function(BFBTCPriceForCheck, CCBTCPriceForCheck, callbackCheckCCAsset){
      let assetCCCheckB = "";
      let TotalBTCAssetForCheck = (Math.round(BFBTCPriceForCheck * 10000) / 10000) + (Math.round(CCBTCPriceForCheck * 10000) / 10000);
      if((TotalBTCAssetForCheck > TotalBTCAsset - 0.03) && (TotalBTCAssetForCheck < TotalBTCAsset + 0.03)){
        assetCCCheckB = "1";
      }
      callbackCheckCCAsset(assetCCCheckB)
    },
    checkAsset: function(arbitrageOrderType,CCJPYPriceForCheck,CCBTCPriceForCheck,BFJPYPriceForCheck,BFBTCPriceForCheck,size,CCPrice,BFPrice,callbackCheckAsset){
      let assetCheckB = "";
      if(arbitrageOrderType=="BFBuyCCSell"){
        if(CCBTCPriceForCheck>=size&&BFJPYPriceForCheck>=(size*BFPrice*1.03)){
          assetCheckB = "1" ;
        }
      }else if(arbitrageOrderType=="CCBuyBFSell"){
        if(CCJPYPriceForCheck>= (size*CCPrice*1.03)&&BFBTCPriceForCheck>=size){
          assetCheckB = "1" ;
        }
        callbackCheckAsset(assetCheckB);
      }
      /*
      if(CCJPYPriceForCheck>= (size*CCPrice*1.03)){
        CCBuyable = "1" ;
      }
      //CC sellable check
      if(CCBTCPriceForCheck>=size){
        CCSellable = "1" ;
      }
      //BF buyable check
      if(BFJPYPriceForCheck>=(size*BFPrice*1.03)){
        BFBuyable = "1" ;
      }
      //BF sellable check
      if(BFBTCPriceForCheck>=size){
        BFSellable = "1" ;
      }
      */
    },
    getAsset: function(callbackAsset){
      //zaif 資産残高を取得
      let exchangeAsset = [];
      exchangeAsset[0] ={};
      exchangeAsset[1] ={};
      exchangeAsset[2] ={};
      exchangeAsset[3] ={};
      exchangeAsset[4] ={};
      exchangeAsset[5] ={};
      exchangeAsset[6] ={};
      exchangeAsset[7] ={};
      let callback3 = function(jpyAssetZaif,btcAssetZaif){
        exchangeAsset[0] = {jpyAssetZaif:jpyAssetZaif};
        exchangeAsset[1] = {btcAssetZaif:btcAssetZaif};
      };
      assetZaif.getZaifAsset2(callback3);

      //BitFlyer 資産残高を取得
      let callback4 = function(jpyassetbf, btcassetbf){
        exchangeAsset[2] = {jpyassetbf:jpyassetbf};
        exchangeAsset[3] = {btcassetbf:btcassetbf};
      };
      assetBF.getBFAsset(callback4);

      let callbackGetCCAsset = function(jpyAssetCC,btcAssetCC){
        exchangeAsset[4] = {jpyAssetCC:jpyAssetCC};
        exchangeAsset[5] = {btcAssetCC:btcAssetCC};
      };
      assetCC.getCCAsset(callbackGetCCAsset);

      let callbackGetQXPrice = function(jpyAssetQX,btcAssetQX){
        exchangeAsset[6] = {jpyAssetQX:jpyAssetQX};
        exchangeAsset[7] = {btcAssetQX:btcAssetQX};
      };
      assetQX.getQXAsset(callbackGetQXPrice);

      setTimeout(function(){
        callbackAsset(exchangeAsset)
      },2500);
    },
    sendOrderBFandZaif: function(sideZaif,orderPriceZaif, size, marketLimitBF, sideBF, orderPriceBF){
      var zaifOrderOK = "";
      var callback2 = function(status){
        zaifOrderOK = status;
      };

      sendOrderZaif.sendOrderZaif(sideZaif,orderPriceZaif, size, callback2);
      console.log("order実行");
      //発注後5秒待って処理開始
      setTimeout(function(){
          console.log("zaifOrderOK1"+zaifOrderOK);
          if(zaifOrderOK == '1'){callorderBF.orderBF(marketLimitBF, sideBF, orderPriceBF, size)}else{
            setTimeout(function(){
              console.log("zaifOrderOK2"+zaifOrderOK);
              if(zaifOrderOK == '1'){callorderBF.orderBF(marketLimitBF, sideBF, orderPriceBF, size)}else{
                setTimeout(function(){
                  console.log("zaifOrderOK3"+zaifOrderOK);
                  if(zaifOrderOK == '1'){callorderBF.orderBF(marketLimitBF, sideBF, orderPriceBF, size)}else{
                    setTimeout(function(){
                    console.log("zaifOrderOK4"+zaifOrderOK);
                    if(zaifOrderOK == '1'){callorderBF.orderBF(marketLimitBF, sideBF, orderPriceBF, size)}else{
                        setTimeout(function(){
                          console.log("zaifOrderOK5"+zaifOrderOK);
                          if(zaifOrderOK == '1'){callorderBF.orderBF(marketLimitBF, sideBF, orderPriceBF, size)}else{
                            setTimeout(function(){
                              console.log("zaifOrderOK6"+zaifOrderOK);
                              if(zaifOrderOK == '1'){callorderBF.orderBF(marketLimitBF, sideBF, orderPriceBF, size)}else{
                                setTimeout(function(){
                                  console.log("zaifOrderOK7"+zaifOrderOK);
                                  if(zaifOrderOK == '1'){callorderBF.orderBF(marketLimitBF, sideBF, orderPriceBF, size)}else{
                                    setTimeout(function(){
                                      console.log("zaifOrderOK8"+zaifOrderOK);
                                      if(zaifOrderOK == '1'){callorderBF.orderBF(marketLimitBF, sideBF, orderPriceBF, size)}else{
                                        setTimeout(function(){
                                          console.log("zaifOrderOK9"+zaifOrderOK);
                                          if(zaifOrderOK == '1'){callorderBF.orderBF(marketLimitBF, sideBF, orderPriceBF, size)}else{
                                            setTimeout(function(){
                                              console.log("zaifOrderOK10"+zaifOrderOK);
                                              if(zaifOrderOK == '1'){callorderBF.orderBF(marketLimitBF, sideBF, orderPriceBF, size)}else{
                                                setTimeout(function(){
                                                  console.log("zaifOrderOK12"+zaifOrderOK);
                                                  if(zaifOrderOK == '1'){callorderBF.orderBF(marketLimitBF, sideBF, orderPriceBF, size)}else{
                                                    setTimeout(function(){
                                                      console.log("zaifOrderOK15"+zaifOrderOK);
                                                      if(zaifOrderOK == '1'){callorderBF.orderBF(marketLimitBF, sideBF, orderPriceBF, size)}else{
                                                        setTimeout(function(){
                                                          console.log("zaifOrderOK18"+zaifOrderOK);
                                                          if(zaifOrderOK == '1'){callorderBF.orderBF(marketLimitBF, sideBF, orderPriceBF, size)}else{
                                                            setTimeout(function(){
                                                              console.log("zaifOrderOK21"+zaifOrderOK);
                                                              if(zaifOrderOK == '1'){callorderBF.orderBF(marketLimitBF, sideBF, orderPriceBF, size)}else{
                                                                setTimeout(function(){
                                                                  console.log("zaifOrderOK24"+zaifOrderOK);
                                                                  if(zaifOrderOK == '1'){callorderBF.orderBF(marketLimitBF, sideBF, orderPriceBF, size)}else{
                                                                    setTimeout(function(){
                                                                      console.log("zaifOrderOK27"+zaifOrderOK);
                                                                      if(zaifOrderOK == '1'){callorderBF.orderBF(marketLimitBF, sideBF, orderPriceBF, size)}else{
                                                                        setTimeout(function(){
                                                                          console.log("zaifOrderOK30"+zaifOrderOK);
                                                                          if(zaifOrderOK == '1'){callorderBF.orderBF(marketLimitBF, sideBF, orderPriceBF, size)};
                                                                        },3000); //30sec
                                                                      }
                                                                    },3000);
                                                                  }
                                                                },3000);
                                                              }
                                                            },3000);
                                                          }
                                                        },3000);
                                                      }
                                                    },3000); // 15sec
                                                  }
                                                },2000);
                                              }
                                            },1000); // 10sec
                                          }
                                        },1000);
                                      }
                                    },1000);
                                  }
                                },1000);
                              }
                            },1000);
                          }
                        },1000); // 10sec
                      }
                    },1000);
                  }
                },1000);
              }
            },1000);
          }
      },1000);
    },
    sendOrderBFandCC: function(sideCC,orderPriceCC, size, marketLimitBF, sideBF, orderPriceBF){
      // callorderBF.orderBF(marketLimitBF, sideBF, orderPriceBF, size)
      let bfOrderOK = '';
      let callback5 = function(childOrderID, status){
        console.log(childOrderID, status)
        bfOrderOK = childOrderID;
        bfStatus = status;
      };
      sendOrderBF.sendOrder(marketLimitBF, sideBF, orderPriceBF, size, callback5)
      setTimeout(function(){
        if(typeof bfOrderOK !== 'undefined'){
          console.log("CC発注")
          sendOrderCC.sendOrder(sideCC,orderPriceCC, size);
        }else{
          console.log("BF発注失敗")
        }
      },1500);
      console.log("order実行");
    },
    getMarketStatus: function(callbackMarketStatus){
      //zaif 資産残高を取得
      let marketStatusAddB = 0;
      let marketStatus = [];
      //BF
      marketStatus[0] ={};
      let callbackBFMarketStatus = function(BFstatus){
        marketStatus[0] = {BFstatus:BFstatus};
      };
      assetBF.getBFMarketStatus(callbackBFMarketStatus);

      setTimeout(function(){
        if(marketStatus[0].BFstatus==="NORMAL"){
          marketStatusAddB = marketStatusAddB + 0;
        }else if(marketStatus[0].BFstatus==="BUSY"){
          marketStatusAddB = marketStatusAddB + 0.0005;
        }else if(marketStatus[0].BFstatus==="VERY BUSY"){
          marketStatusAddB = marketStatusAddB + 0.001;
        }else{
          marketStatusAddB = marketStatusAddB + 0.1;
        }
        callbackMarketStatus(marketStatusAddB)
      },800);
    },
    getResult: function(){
        console.log("Result"
        + " normalTrade(1:アビトラ,2:反対):" + normalTrade
        + " diffPerBFminusCC:" + (Math.round(diffPerBFminusCC * 10000) / 100)
        + " diffPerCCminusBF:" + (Math.round(diffPerCCminusBF * 10000) / 100)
        + " diffGO:" + diffGO)
    },
    getAssetCheckFlagSetting: function(CCJPYPriceForCheck, CCBTCPriceForCheck, BFJPYPriceForCheck, BFBTCPriceForCheck, QXJPYPriceForCheck, QXBTCPriceForCheck, size, CCPrice, BFPrice, QXPrice, callbackAssetCheckFlag){
      // For test
      /*1. All null
      size = 0.5
      //*/
      /*2. All 1
      BFJPYPriceForCheck = 300000;
      BFBTCPriceForCheck = 0.3;
      CCJPYPriceForCheck = 300000;
      CCBTCPriceForCheck = 0.3;
      QXJPYPriceForCheck = 300000;
      QXBTCPriceForCheck = 0.3;
      size = 0.05
      //*/
      /*3 Partial 1
      BFJPYPriceForCheck = 300000;
      BFBTCPriceForCheck = 0;
      CCJPYPriceForCheck = 300000;
      CCBTCPriceForCheck = 0;
      QXJPYPriceForCheck = 300000;
      QXBTCPriceForCheck = 0;
      size = 0.05
      //*/
      /*3 Partial 1
      BFJPYPriceForCheck = 0;
      BFBTCPriceForCheck = 0.5;
      CCJPYPriceForCheck = 0;
      CCBTCPriceForCheck = 0.5;
      QXJPYPriceForCheck = 0;
      QXBTCPriceForCheck = 0.5;
      size = 0.05
      //*/

      let assetCheckFlag = ["","","","","",""];
      if(CCJPYPriceForCheck>= (size*CCPrice*1.03)){
        assetCheckFlag[0] = "1" ;
      }
      //CC sellable check
      if(CCBTCPriceForCheck>=size){
        assetCheckFlag[1] = "1" ;
      }
      //BF buyable check
      if(BFJPYPriceForCheck>=(size*BFPrice*1.03)){
        assetCheckFlag[2] = "1" ;
      }
      //BF sellable check
      if(BFBTCPriceForCheck>=size){
        assetCheckFlag[3] = "1" ;
      }
      //QX buyable check
      if(QXJPYPriceForCheck>=(size*QXPrice*1.03)){
        assetCheckFlag[4] = "1" ;
      }
      //QX sellable check
      if(QXBTCPriceForCheck>=size){
        assetCheckFlag[5] = "1" ;
      }
      callbackAssetCheckFlag(assetCheckFlag)
    },
    getArbitrageTrade: function(priceInfo, diffGO, assetCheckForArbitrage, callbackArbitrageTrade){
      let orderGOArbitrageB = "";
      let arbitrageOrderTypeB = "";
      let diffPriceB = "";
      let diffPerB = "";
      CCBuyable  = assetCheckForArbitrage[0];
      CCSellable = assetCheckForArbitrage[1];
      BFBuyable = assetCheckForArbitrage[2];
      BFSellable = assetCheckForArbitrage[3];
      QXBuyable = assetCheckForArbitrage[4];
      QXSellable = assetCheckForArbitrage[5];
      //CCとBFのLast Priceどちらが高いか判定
      // diffPrice = Math.abs(priceInfo[0].CCPrice-priceInfo[0].BFPrice)
      // diffPer = diffPrice/priceInfo[0].BFPrice;
      diffArray = [];
      diffContent = {};

      //For test
      /*1-7.
      CCBuyable  = "1";
      CCSellable = "1";
      BFBuyable = "1";
      BFSellable = "1";
      QXBuyable = "1";
      QXSellable = "1";
      //*/
      /*8.
      CCBuyable  = "";
      CCSellable = "1";
      BFBuyable = "1";
      BFSellable = "1";
      QXBuyable = "1";
      QXSellable = "1";
      //*/
      /*9.
      CCBuyable  = "1";
      CCSellable = "1";
      BFBuyable = "";
      BFSellable = "1";
      QXBuyable = "1";
      QXSellable = "1";
      //*/
      /*10.
      CCBuyable  = "1";
      CCSellable = "1";
      BFBuyable = "1";
      BFSellable = "1";
      QXBuyable = "";
      QXSellable = "1";
      //*/
      /*11.
      CCBuyable  = "1";
      CCSellable = "1";
      BFBuyable = "1";
      BFSellable = "1";
      QXBuyable = "1";
      QXSellable = "";
      //*/
      /*12.
      CCBuyable  = "1";
      CCSellable = "";
      BFBuyable = "1";
      BFSellable = "1";
      QXBuyable = "1";
      QXSellable = "1";
      //*/
      /*13.
      CCBuyable  = "1";
      CCSellable = "1";
      BFBuyable = "1";
      BFSellable = "";
      QXBuyable = "1";
      QXSellable = "1";
      //*/

      //Diff For BFCC
      //BFminusCC CC buy BF sell
      if(BFSellable==="1"&&CCBuyable==="1"){
        diffPriceBFminusCC = priceInfo[0].BFPriceLower-priceInfo[0].CCPriceUpper;
        diffPerBFminusCC = diffPriceBFminusCC/priceInfo[0].CCPriceUpper;
        if(diffPriceBFminusCC>0){
          diffContent = {};
          diffContent = {"diff":"CCBuyBFSell", "diffPrice":diffPriceBFminusCC, "diffPer":diffPerBFminusCC, "sellable":BFSellable, "buyable":CCBuyable}
          diffArray.push(diffContent);
        }
      }
      //CCminusBF
      if(CCSellable==="1"&&BFBuyable==="1"){
        diffPriceCCminusBF= priceInfo[0].CCPriceLower-priceInfo[0].BFPriceUpper;
        diffPerCCminusBF = diffPriceCCminusBF/priceInfo[0].BFPriceUpper;
        if(diffPriceCCminusBF>0){
          diffContent = {};
          diffContent = {"diff":"BFBuyCCSell", "diffPrice":diffPriceCCminusBF, "diffPer":diffPerCCminusBF, "sellable":CCSellable, "buyable":BFBuyable}
          diffArray.push(diffContent);
        }
      }
      //BFminusQX
      if(BFSellable==="1"&&QXBuyable==="1"){
        diffPriceBFminusQX = priceInfo[0].BFPriceLower-priceInfo[0].QXPriceUpper;
        diffPerBFminusQX = diffPriceBFminusQX/priceInfo[0].QXPriceUpper;
        if(diffPriceBFminusQX>0){
          diffContent = {};
          diffContent = {"diff":"QXBuyBFSell", "diffPrice":diffPriceBFminusQX, "diffPer":diffPerBFminusQX, "sellable":BFSellable, "buyable":QXBuyable}
          diffArray.push(diffContent);
        }
      }
      //Diff for QXBF
      if(QXSellable==="1"&&BFBuyable==="1"){
        diffPriceQXminusBF= priceInfo[0].QXPriceLower-priceInfo[0].BFPriceUpper;
        diffPerQXminusBF = diffPriceQXminusBF/priceInfo[0].BFPriceUpper;
        if(diffPriceQXminusBF>0){
          diffContent = {};
          diffContent = {"diff":"BFBuyQXSell", "diffPrice":diffPriceQXminusBF, "diffPer":diffPerQXminusBF, "sellable":QXSellable, "buyable":BFBuyable}
          diffArray.push(diffContent);
        }
      }
      //Diff For QXCC
      if(QXSellable==="1"&&CCBuyable==="1"){
        diffPriceQXminusCC = priceInfo[0].QXPriceLower-priceInfo[0].CCPriceUpper;
        diffPerQXminusCC = diffPriceQXminusCC/priceInfo[0].CCPriceUpper;
        if(diffPriceQXminusCC>0){
          diffContent = {};
          diffContent = {"diff":"CCBuyQXSell", "diffPrice":diffPriceQXminusCC, "diffPer":diffPerQXminusCC, "sellable":QXSellable, "buyable":CCBuyable}
          diffArray.push(diffContent);
        }
      }
      if(CCSellable==="1"&&QXBuyable==="1"){
        diffPriceCCminusQX= priceInfo[0].CCPriceLower-priceInfo[0].QXPriceUpper;
        diffPerCCminusQX = diffPriceCCminusQX/priceInfo[0].QXPriceUpper;
        if(diffPriceCCminusQX>0){
          diffContent = {};
          diffContent = {"diff":"QXBuyCCSell", "diffPrice":diffPriceCCminusQX, "diffPer":diffPerCCminusQX, "sellable":CCSellable, "buyable":QXBuyable}
          diffArray.push(diffContent);
        }
      }

      diffArray.sort(function(a,b){
        if(a["diffPrice"]<b["diffPrice"])return 1;
        if(a["diffPrice"]>b["diffPrice"])return -1;
        return 0;
      });

      if(diffArray.length !== 0 && diffArray[0].diffPer >= diffGO){
          arbitrageOrderTypeB = diffArray[0].diff;
          diffPriceB = diffArray[0].diffPrice
          diffPerB =  diffArray[0].diffPer
          orderGOArbitrageB = "1";
      }

      diffPriceBFminusCC = priceInfo[0].BFPriceLower-priceInfo[0].CCPriceUpper;
      diffPerBFminusCC = diffPriceBFminusCC/priceInfo[0].CCPriceUpper;
      diffPriceBFminusQX = priceInfo[0].BFPriceLower-priceInfo[0].QXPriceUpper;
      diffPerBFminusQX = diffPriceBFminusQX/priceInfo[0].QXPriceUpper;
      diffPriceCCminusBF= priceInfo[0].CCPriceLower-priceInfo[0].BFPriceUpper;
      diffPerCCminusBF = diffPriceCCminusBF/priceInfo[0].BFPriceUpper;
      diffPriceCCminusQX= priceInfo[0].CCPriceLower-priceInfo[0].QXPriceUpper;
      diffPerCCminusQX = diffPriceCCminusQX/priceInfo[0].QXPriceUpper;
      diffPriceQXminusBF= priceInfo[0].QXPriceLower-priceInfo[0].BFPriceUpper;
      diffPerQXminusBF = diffPriceQXminusBF/priceInfo[0].BFPriceUpper;
      diffPriceQXminusCC = priceInfo[0].QXPriceLower-priceInfo[0].CCPriceUpper;
      diffPerQXminusCC = diffPriceQXminusCC/priceInfo[0].CCPriceUpper;
      diffPerArrayB = {"diffPerBFminusCC":diffPerBFminusCC,"diffPerBFminusQX":diffPerBFminusQX,"diffPerCCminusBF":diffPerCCminusBF,
        "diffPerCCminusQX":diffPerCCminusQX,"diffPerQXminusBF":diffPerQXminusBF,"diffPerQXminusCC":diffPerQXminusCC,}
      if(diffPerBFminusCC>=diffGO||diffPerBFminusQX>=diffGO||diffPerCCminusBF>=diffGO||diffPerCCminusQX>=diffGO||diffPerQXminusBF>=diffGO||diffPerQXminusCC>=diffGO){
        console.log("0.3getChance")
      }

      callbackArbitrageTrade(orderGOArbitrageB, arbitrageOrderTypeB, diffPriceB, diffPerB, diffPerArrayB)
    },
    sendOrderBFandQX: function(size, marketLimitBF, sideBF, orderPriceBF, sideQX, orderPriceQX){
      let bfOrderOK = '';
      let callback5 = function(childOrderID, status){
        console.log(childOrderID, status)
        bfOrderOK = childOrderID;
        bfStatus = status;
      };
      sendOrderBF.sendOrder(marketLimitBF, sideBF, orderPriceBF, size, callback5)
      setTimeout(function(){
        if(typeof bfOrderOK !== 'undefined'){
          console.log("QX発注")
          sendOrderQX.sendOrder(sideQX, orderPriceQX, size);
        }else{
          console.log("BF発注失敗")
        }
      },1500);
      console.log("order実行");
    },
    sendOrderCCandQX: function(size, sideCC, orderPriceCC, sideQX, orderPriceQX){
      console.log("QX発注")
      sendOrderQX.sendOrder(sideQX,orderPriceQX, size);
      console.log("CC発注")
      sendOrderCC.sendOrder(sideCC,orderPriceCC, size);
      console.log("order実行");
    },
};