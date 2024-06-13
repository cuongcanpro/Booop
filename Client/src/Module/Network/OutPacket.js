// PACKET
engine.OutPacket.extend = cc.Class.extend;

CmdSendCommon = engine.OutPacket.extend({
    _jData: "{}",
    ctor:function(id)
    {
        this._super();

        if(id) {
            this.setCmdId(id);
        }
    },

    setCmdId: function(id){
        this._super(id);
        this._cmdId = id;
    },

    putBytes: function(arr){
        this.putShort(arr.length);
        for (var i = 0; i < arr.length; i++) {
            this.putByte(arr[i]);
        }
    },

    putInts: function(arr){
        this.putShort(arr.length);
        for (var i = 0; i < arr.length; i++) {
            this.putInt(arr[i]);
        }
    },

    putStrings: function (arr) {
        this.putShort(arr.length);
        for (let i = 0; i < arr.length; i++) {
            this.putString(arr[i]);
        }
    },

    putIntArray: function (arr) {
        this.putShort(arr.length);
        for (var i = 0; i < arr.length; i++) {
            this.putInt(arr[i]);
        }
        return this;
    },

    putLongArray: function(arr) {
        this.putShort(arr.length);
        for (var i = 0; i < arr.length; i++) {
            this.putLong(arr[i]);
        }
        return this;
    }
});

CmdSendHandshake = CmdSendCommon.extend({
    ctor:function()
    {
        this._super();
        this.initData(100);
        this.setControllerId(0);
        this.setCmdId(CMD.HAND_SHAKE);

        this.putData();
    },
    putData:function(){
        this.packHeader();
        this.updateSize();
    }
});

CmdSendPingpong = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(0);
        this.setCmdId(CMD.CMD_PINGPONG);
        this.putData();
    },

    putData: function () {
        this.packHeader();

        this.updateSize();
    },
});

CmdCheatCountryCode = CmdSendCommon.extend({
    ctor:function() {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_CHEAT_COUNTRY_CODE);
    },

    putData: function(country) {
        this.packHeader();
        this.putString(country);
        this.updateSize();
    }
});

var CmdSendCheatIap = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_CHEAT_IAP);
    },

    putData: function (receiptData, sign, type, isOffer, offerID, extraParam, eventName) {
        cc.log("CmdSendCheatIap",receiptData, sign, type, isOffer, offerID, eventName, extraParam);
        this.packHeader();
        this.putString(receiptData);
        this.putString(sign);
        this.putInt(type);
        this.putByte(isOffer);
        this.putInt(offerID);
        if(eventName) this.putString(eventName);
        else this.putString("") // event name
        this.putString(extraParam);
        this.updateSize();
    },
});

var CmdSendKeepConnectionSkGame = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(CMD.KEEP_CONNECTION_SK_GAME);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    },
})

var CmdSendUserComebackAfterAFK = CmdSendCommon.extend({
    ctor: function() {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_COMEBACK_AFTER_AFK);
        this.putData();
    },

    putData: function() {
        this.packHeader();
        this.updateSize();
    }
});

CmdSendAuthenConnect = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_AUTHEN_CONNECT);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});

var CmdSendCheatPaymentServer = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(CMD.CHEAT_PAYMENT_SERVER);
    },

    putData: function (bool) {
        cc.log("CHEAT PAYMENT SERVER:" , bool);
        this.packHeader();
        this.putByte(bool);
        this.updateSize();
    },
});

CmdSendInfoBotBoard = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_INFO_BOT);
        this.putData();
    },
    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});

CmdSendCheatCardBot = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_CHEAT_NUM_BOT);
    },
    putData: function (numBot) {
        this.packHeader();
        this.putInt(numBot);
        this.updateSize();
    }
});
CmdCheatResourceItem = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_CHEAT_RESOURCE_ITEM);
    },

    putData: function (resId, values) {
        this.packHeader();
        this.putInts(resId);
        this.putInts(values);
        this.updateSize();
    }
});