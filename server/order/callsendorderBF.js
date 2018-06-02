let sendOrderBF = require('./sendOrderBF.js');
let assetBF = require('../asset/assetBitFlyer.js');
let fs = require('fs');
let orderConfig = JSON.parse(fs.readFileSync('../../config/orderConfig.json'));

module.exports = {
    orderBF: function(marketLimitBF, sideBF, orderPriceBF, size){
      let bfOrderOK = '';
      let callback5 = function(childOrderID, status){
        console.log(childOrderID, status)
        bfOrderOK = childOrderID;
        bfStatus = status;
      };

      sendOrderBF.sendOrder(marketLimitBF, sideBF, orderPriceBF, size, callback5)
      setTimeout(function(){
        console.log(bfStatus)
        if(typeof bfOrderOK === 'undefined' || bfStatus == "-204"){
          console.log("2回目")
          sendOrderBF.sendOrder(marketLimitBF, sideBF, orderPriceBF, size, callback5)
          setTimeout(function(){
            if(typeof bfOrderOK === 'undefined' || bfStatus == "-204"){
              console.log("3回目")
              sendOrderBF.sendOrder(marketLimitBF, sideBF, orderPriceBF, size, callback5)
            }
          },1000);
        }
      },1000);
    }
}
