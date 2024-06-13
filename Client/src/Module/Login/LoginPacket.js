
// region OutPacket
CmdSendLogin= CmdSendCommon.extend({
    ctor:function()
    {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(LoginMgr.CMD.CMD_LOGIN);

    },
    putData:function(sessionKey, deviceID){
        this.packHeader();
        cc.log("Session Key ====== " + sessionKey);
        this.putString(sessionKey);
        this.putInt(3);
        this.putString(deviceID);
        this.updateSize();
    }
});

CmdSendMobile = CmdSendCommon.extend({
    ctor:function()
    {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(LoginMgr.CMD.CMD_MOBILE);
        this.putData();

    },
    putData:function(){
        JSLog.i("SendMobile " +
            "\n Device Model: " + fr.platformWrapper.getDeviceModel() +
            "\n OS Version: " + fr.platformWrapper.getOSVersion() +
            "\n Platform: " + platformMgr.getPlatform().ID +
            "\n DeviceID: " + gameMgr.getDeviceID() +
            "\n AppVersion: " + gameMgr.getAppVersion() +
            "\n NetworkOperator: " + fr.platformWrapper.getNetworkOperator() +
            "\n CountryCode: " + gameMgr.getCountryCode() +
            "\n JSVersion: " + gameMgr.getJSVersion() +
            "\n InstallDate: " + gameMgr.getInstallDate() +
            "\n PackageName: " + gameMgr.getPackageName());
        this.packHeader();
        this.putString(gameMgr.getDeviceID());
        this.putString(fr.platformWrapper.getDeviceModel());
        this.putString(fr.platformWrapper.getOSVersion());
        this.putByte(platformMgr.getPlatform().ID);
        this.putString(gameMgr.getAppVersion());
        this.putStrings(fr.platformWrapper.getNetworkOperator());
        this.putString(gameMgr.getJSVersion());
        this.putString(gameMgr.getPackageName());
        this.putString(gameMgr.getInstallDate());
        this.updateSize();
    }
});

CmdSendGetConfig = CmdSendCommon.extend({
    ctor:function()
    {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(LoginMgr.CMD.CMD_GET_CONFIG);
        this.putData();
    },
    putData:function(){
        this.packHeader();
        this.updateSize();
    }
});
// endregion

// region InPacket
CmdReceivedConfig = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.jsonConfig = this.getString();
    }
});

CmdReceivedConfigCommon = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.jsonConfig = this.getString();
    }
});

CmdReceiveConnectFail = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.ip = this.getString();
        this.port = this.getInt();
    }
});
// endregion

