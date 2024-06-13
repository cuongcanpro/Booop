let PaymentLibUtils = {};

PaymentLibUtils.initPaymentLib = function () {
    cc.spriteFrameCache.addSpriteFrames("res/pm_global/pm_global_content_ui.plist", "res/pm_global/pm_global_content_ui.png");
    PaymentLib.init();
}

PaymentLibUtils.startPayment = function () {
    cc.log("Run here ");
    if (!PaymentLib.is_loaded()){
        setTimeout(PaymentLibUtils.startPayment, 1);
        return;
    }

    cc.log("================> " + JSON.stringify(PaymentLib.channelConfigs))

    PaymentLib.displayPaymentChannelSelection(Object.keys(PaymentLib.channelConfigs), function(action, channelCode){
        if (action == "OK"){
            PaymentLib.makePayment("khanhtn2", 123123, 50000, channelCode, "embed_data", {orderDescrition: "Thanh toan XYZ"})
        }
    })

    // Trường hợp không dùng Payment-UI, Product tự lấy UserInfo và gọi function request đến API create-transaction
    // PaymentLib.requestCreateTransaction(
    //     "khanhtn2",
    //     123123,
    //     50000,
    //     channelCode,
    //     "embed_data",
    //     {
    //         orderDescrition: "Thanh toan XYZ",
    //         userData:{
    //             bank_code: "ACB",
    //             // card_no: "zzzzz",
    //             // pin_code: "zzzzz"
    //         }
    //     },
    //     PaymentLib.handleCreateTransaction
    // );
}