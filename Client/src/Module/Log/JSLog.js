
let JSLog = function () {}

// Always display
JSLog.i = function (...msg) {
    cc.log(msg.join(" "));
}

// Only show when debug
JSLog.d = function (...msg) {
    if(Config.ENABLE_CHEAT) {
        cc.log("JSLog::d::" + msg.join(" "));
    }
}

// Show error
JSLog.e = function (...msg) {
    cc.error(msg.join(" "));
}

// Show warning - only debug
JSLog.w = function (...msg) {
    cc.warn(msg.join(" "));
}

// Realtime Log Telegram
JSLog.TELEGRAM_API = "https://api.telegram.org/@bot/sendMessage?chat_id=@id&";
JSLog.ZPS_BOT_TOKEN = "bot6314655384:AAE_3U60tfrUuTLsBxNk9AjPgpltSt3XQ6g";
JSLog.DOMINO_GROUP_CLIENT_LOG = "-1002044180758"
JSLog.TELEGRAM_STR_SLICE = -1900;
JSLog.TELEGRAM_PARAMS = "text=@text&message_thread_id=@topic";
JSLog.TOPIC = {
    ERROR_LOG: 2,
    COMMON_LOG : 10,
    TUTORIAL : 40,
    ACCOUNT: 13,
    PAYMENT: 20,
    BOARD: 4,
    JS_ERROR: 4615,
    LOADING: 12957
}
JSLog.sendTelegram = function (...msg) {
    try {
        JSLog.sendTelegramTopic(JSLog.TOPIC.COMMON_LOG, ...msg);
    }
    catch(e) {

    }
}
JSLog.sendTelegramTopic = function (topic,...msg) {
    try {
        let data = msg.join(" ");
        data = data.slice(JSLog.TELEGRAM_STR_SLICE);
        data = encodeURIComponent(data);
        let params = JSLog.TELEGRAM_PARAMS;
        params = StringUtility.replaceAll(params, "@text",data);
        params = StringUtility.replaceAll(params, "@topic",topic);
        JSLog.sendAPITelegram(params);
    }
    catch(e) {

    }
}
JSLog.sendAPITelegram = function (params) {
    try {
        let url = JSLog.TELEGRAM_API;
        url = StringUtility.replaceAll(url, "@bot", JSLog.ZPS_BOT_TOKEN);
        url = StringUtility.replaceAll(url, "@id", JSLog.DOMINO_GROUP_CLIENT_LOG);

        let xhr = cc.loader.getXMLHttpRequest();
        xhr.onreadystatechange = function () {
            // JSLog.d(">>sendTelegram Success " + xhr.readyState + " - " + xhr.status + ": " + xhr.responseText);
        };
        xhr.ontimeout = function () {
            // JSLog.d(">>sendTelegram Timeout");
        };
        xhr.onerror = function () {
            // JSLog.d(">>sendTelegram Error");
        };
        xhr.open("GET", url + params, true);
        xhr.send();
    }
    catch(e) {

    }
};
// endregion