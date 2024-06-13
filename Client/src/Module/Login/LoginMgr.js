
let LoginMgr = BaseMgr.extend({
    ctor : function() {
        this._super();

        this.isRetryLogin = false;
    },

    init : function() {
        this.setSocialType(LoginMgr.SOCIAL.NONE);

        LocalizedString.add('res/Modules/Launching/Localized_id');
        LocalizedString.add('res/Modules/Dialog/Localized_id');

        dispatcherMgr.addListener(UserMgr.EVENT.GET_USER_INFO, this, this.onLoginSuccess.bind(this));
    },

    openLaunching : function () {
        logMgr.journeyLog(LogMgr.NUJ.LOADING);
        sceneMgr.openScene(LaunchingScene.className);
    },

    openLogin : function () {
        // sceneMgr.openScene(TestLayer.className);
        // return;

        logMgr.journeyLog(LogMgr.NUJ.LOGIN);
        if(portalMgr.isPortal()) {
            if(Config.ENABLE_CHEAT) {
                sceneMgr.openScene(LoginScene.className);

                if(this.isRetryLogin) {
                    loginMgr.autoLoginPortal();
                }
                return;
            }

            if(!sceneMgr.isMainLayer(LaunchingScene.className)) {
                loginMgr.openLaunching();
            }
            loginMgr.autoLoginPortal();
        }
        else {
            if(!sceneMgr.isMainLayer(LoginScene.className)) {
                sceneMgr.openScene(LoginScene.className);
            }
            else {
                this.doRetryLogin();
            }
        }
    },

    onReceived: function (cmd, pk) {
        let packet = new engine.InPacket();
        packet.init(pk);
        switch (cmd) {
            case LoginMgr.CMD.CMD_LOGIN: {
                JSLog.i("--> Receive Login " + packet.getError());
                loginMgr.receiveLogin = true;
                if (packet.getError() == 0) {
                    JSLog.i("_____________________LOGIN SUCCESSFUL_____________________");
                    logMgr.addStepSocket("mobile");
                    // loginMgr.sendMobile();
                    // pingPongMgr.startPing();
                    this.sendPacketCMD(InGameMgr.CMD.FIND_MATCH);
                }
                else {
                    JSLog.i("_____________________LOGIN FAIL____________________");
                    logMgr.addStepSocket("login_failed");
                    Loading.clear();
                    loginMgr.disconnectServer();
                    Dialog.showOkCancelDialog(LocalizedString.to("LOGIN_FAILED") + " <" + packet.getError() + ">",null,function(btnID){
                        if(btnID == Dialog.BTN_OK) {
                            loginMgr.connectServer();
                        }
                    });
                }
                return true;
            }
            case LoginMgr.CMD.CMD_LOGIN_FAIL: {
                Loading.clear();
                loginMgr.disconnectServer();
                Dialog.showOkCancelDialog(LocalizedString.to("LOGIN_FAILED") + " <" + packet.getError() + ">",null,function(btnID){
                    if(btnID == Dialog.BTN_OK) {
                        loginMgr.connectServer();
                    }
                });
                return true;
            }
            case LoginMgr.CMD.CMD_MOBILE: {
                logMgr.addStepSocket("config");
                loginMgr.sendGetConfig();
                break;
            }
            case LoginMgr.CMD.CMD_GET_CONFIG:
            {
                logMgr.addStepSocket("info");
                let config = new CmdReceivedConfig(pk);
                config.clean();
                loginMgr.onGameConfig(config);
                userMgr.sendGetUserInfo();
                break;
            }
            case LoginMgr.CMD.CMD_COMMON_CONFIG:
            {
                let config = new CmdReceivedConfigCommon(pk);
                config.clean();
                loginMgr.onGameCommonConfig(config);
                break;
            }
        }
    },

    getLoginScene : function () {
        let layer = sceneMgr.getMainLayer();
        if(layer instanceof LoginScene) {
            return layer;
        }
        return null;
    },

    // region Login Success
    onLoginScene : function () {
        if(portalMgr.isPortal()) return;

        JSLog.d("LoginMgr::checkAutoLogin " + this.isAutoLoginSocial());
        if(loginMgr.isAutoLoginSocial()) {
            loginMgr.loadCacheLogin();
            loginMgr.connectServer();
        }
        else {
            this.doRetryLogin();
        }

        loginMgr.clearRetryLogin();
    },

    onLoginSuccess : function () {
        loginMgr.clearRetryLogin();

        // Log Tracker
        fr.platformWrapper.trackLoginGSN(userMgr.getUserId(),
            loginMgr.getSocialType(),
            loginMgr.getOpenId(),
            userMgr.getUserName());

        // Save Cache
        this.saveCacheLogin();
    },

    saveCacheLogin : function () {
        if(loginMgr.isSocial(LoginMgr.SOCIAL.NONE)) return;

        StorageUtil.setString(LoginMgr.CACHE.SESSION_KEY, this.getSessionKey(true));
        StorageUtil.setString(LoginMgr.CACHE.SOCIAL, this.getSocialType());
        StorageUtil.setString(LoginMgr.CACHE.OPEN_ID, this.getOpenId());
        StorageUtil.setInt(LoginMgr.CACHE.AUTO_LOGIN, 1);

        JSLog.d("LoginMgr::saveCacheLogin success " + this.getSocialType());
    },

    loadCacheLogin : function () {
        this.setSessionKey(StorageUtil.getString(LoginMgr.CACHE.SESSION_KEY));
        this.setSocialType(StorageUtil.getString(LoginMgr.CACHE.SOCIAL));
        this.setOpenId(StorageUtil.getString(LoginMgr.CACHE.OPEN_ID));

        JSLog.d("LoginMgr::loadCacheLogin success");
    },

    clearCacheLogin : function () {

        StorageUtil.setString(LoginMgr.CACHE.SESSION_KEY, "");
        StorageUtil.setString(LoginMgr.CACHE.SOCIAL, "");
        StorageUtil.setString(LoginMgr.CACHE.OPEN_ID, "");
        StorageUtil.setInt(LoginMgr.CACHE.AUTO_LOGIN, 0);

        JSLog.d("LoginMgr::clearCacheLogin success");
    },

    isAutoLoginSocial : function () {
        return (StorageUtil.getInt(LoginMgr.CACHE.AUTO_LOGIN) == 1);
    },
    // endregion

    // region Login Social
    loginDev : function (id) {
        JSLog.i(">>Login dev account " + id);

        loginMgr.setSocialType(LoginMgr.SOCIAL.NONE);
        loginMgr.setSessionKey(id);
        loginMgr.setOpenId("");
        loginMgr.connectServer();

        StorageUtil.setString(LoginScene.KEY_CACHE_ID, id);
        Loading.show("Login Dev Account " + id);
    },

    loginFixedSessionKey : function (ssk) {
        JSLog.i(">>Login SessionKey Fixed " + ssk);

        loginMgr.setSocialType(LoginMgr.SOCIAL.NONE);
        loginMgr.setSessionKey(ssk);
        loginMgr.setOpenId("");
        loginMgr.connectServer();

        StorageUtil.setString(LoginScene.KEY_CACHE_ID, ssk);
        Loading.show("Login SessioKey Fixed");
    },

    loginFacebook : function () {
        this.setSocialType(LoginMgr.SOCIAL.FACEBOOK);

        if(platformMgr.isWindow()) {
            if(loginMgr.getLoginScene()) {
                loginMgr.getLoginScene().fakeAccessToken();
            }
        }
        else {
            Loading.show();
            fr.facebook.login(loginMgr.responseAccessToken.bind(this));
        }
    },

    loginGoogle : function () {
        this.setSocialType(LoginMgr.SOCIAL.GOOGLE);
        if(platformMgr.isWindow()) {
            if(loginMgr.getLoginScene()) {
                loginMgr.getLoginScene().fakeAccessToken();
            }
        }
        else {
            Loading.show();
            fr.google.login(loginMgr.responseAccessToken.bind(this));
        }
    },

    loginApple : function () {
        this.setSocialType(LoginMgr.SOCIAL.APPLE);
        if(platformMgr.isWindow()) {
            if(loginMgr.getLoginScene()) {
                loginMgr.getLoginScene().fakeAccessToken();
            }
        }
        else {
            Loading.show();
            fr.appleid.login(function (res, token) {
                loginMgr.responseAccessToken(res, token);
            });
        }
    },

    loginGuest : function () {
        Loading.show();
        this.setSocialType(LoginMgr.SOCIAL.GUEST);

        loginMgr.requestSessionKey(loginMgr.getGuestAccessToken());
    },

    getGuestAccessToken : function () {
        let id = GuestUtil.getStringCrypt(GuestUtil.KEY_ID, '');
        if (_.isEmpty(id))
        {
            id = fr.platformWrapper.getAAID().replace(/-/g, '');
            if (_.isEmpty(id) || id.indexOf("0000") >= 0)
            {
                id = fr.platformWrapper.getDeviceID();

                if(!id) {
                    id = gameMgr.getDeviceID();
                }
            }
            GuestUtil.setStringCrypt(GuestUtil.KEY_ID, id);
        }
        cc.log("ID ===== " + id);
        return id;
    },

    responseAccessToken : function (res, token) {
        if(res) {
            this.setAccessToken(token);
            this.requestSessionKey();
        }
        else {
            this.showLoginError("e-atk");
        }
    },

    requestSessionKey : function () {
        Loading.show();

        StorageUtil.setString(LoginMgr.CACHE.SOCIAL, this.getSocialType());
        StorageUtil.setString(LoginMgr.CACHE.ACCESS_TOKEN, this.getAccessToken());

        let clientInfo = this.getSocialType();
        let mac = this.getSocialType()
                + this.getAccessToken()
                + clientInfo
                + gameMgr.getDeviceID()
                + Constant.GAME_ID
                + Constant.GAME_SECRET;
        let url = Constant.LOGIN_SERVICE
            + "?service_name=getSessionKey"
            + "&gameId=" + Constant.GAME_ID
            + "&social=" + this.getSocialType()
            + "&deviceId=" + gameMgr.getDeviceID()
            + "&clientInfo=" + clientInfo
            + "&appName=" + gameMgr.getPackageName()
            + "&mac=" + md5(mac)
            + "&accessToken=" + this.getAccessToken();
        fr.Network.xmlHttpRequestGet(url, loginMgr.responseSessionKey.bind(loginMgr));
    },

    responseSessionKey : function (res, data) {
        JSLog.d("responseSessionKey " + res + ": " + data);
        if(!res) {
            this.showLoginError("e-ss");
        }
        else {
            try {
                let result = JSON.parse(data);
                if(result.error == 0) {
                    this.autoLoginSocial(result.sessionKey, result.openId);
                }
                else {
                    this.showLoginError("e-ss" + result.error);
                }

            }
            catch(e) {
                this.showLoginError("e-ssp");
            }
        }
    },

    showLoginError : function (err_code) {
        Loading.clear();
        Dialog.showOKDialog(LocalizedString.to("LOGIN_ERROR") + " (" + err_code + ")");
    },

    autoLoginSocial : function (sessionKey, openId) {
        JSLog.i("LoginMgr::autoLoginSocial " + openId + " - " + sessionKey);

        this.setSessionKey(sessionKey);
        this.setOpenId(openId);

        this.connectServer();
    },
    // endregion

    // region Login Action
    logout : function () {
        this.clearCacheLogin();
        this.disconnectServer(true);
        this.backToLoginScene();
    },

    retryLogin : function (retry) {
        this.isRetryLogin = retry;
        JSLog.i("LoginMgr::retryLogin " + this.isRetryLogin);

        if(this.isRetryLogin) {
            loginMgr.openLogin();
        }
        else {
            loginMgr.backToLoginScene();
        }
    },

    doRetryLogin : function () {
        JSLog.i("LoginMgr::doRetryLogin " + this.isRetryLogin);
        if(this.isRetryLogin) {
            loginMgr.clearRetryLogin();
            loginMgr.connectServer();
        }
    },

    clearRetryLogin : function () {
        this.isRetryLogin = false;
    },

    backToLoginScene: function () {
        StorageUtil.remove(LoginMgr.CACHE.AUTO_LOGIN);

        if (portalMgr.isPortal()) {
            portalMgr.endGame();
        }
        else {
            loginMgr.openLogin();
        }
    },

    autoLoginPortal: function () {
        JSLog.i("LoginMgr::autoLoginPortal " + portalMgr.getSessionKeyPortal());

        this.setSessionKey(portalMgr.getSessionKeyPortal());
        this.setSocialType(portalMgr.getSocialType());
        this.setOpenId("");

        this.connectServer();
    },
    // endregion

    // region User Info Data
    setAccessToken: function (atk) {
        JSLog.d("LoginMgr::setAccessToken " + atk);
        this.accessToken = atk;
    },

    getAccessToken: function () {
        return this.accessToken;
    },

    setSessionKey: function (session_key) {
        JSLog.d("LoginMgr::setSessionKey " + session_key);

        this.sessionKey = decodeURIComponent(session_key);
        if (this.sessionKey.substr(0,3) === "+++"){
            this.sessionKey = this.sessionKey.substring(3, this.sessionKey.length);
        }

        logMgr.crashKey("SessionKey", this.sessionKey);
    },

    getSessionKey: function (raw) {
        if(raw) return this.sessionKey;

        let prefix = "+++";

        if(!isNaN(this.sessionKey)) {
            prefix = "";
        }

        return prefix + this.sessionKey;
    },

    setSocialType : function (type) {
        this.socialType = type;
        JSLog.d("LoginMgr::setSocialType " + type + " -> " + this.getSocialType());
    },

    getSocialType : function () {
        return this.socialType;
    },

    isSocial : function (name) {
        JSLog.d("LoginMgr::isSocial " + this.getSocialType() + " vs " + name);
        return this.getSocialType() === name;
    },

    setOpenId: function (openId) {
        this.openId = openId;
    },

    getOpenId: function () {
        return this.openId;
    },
    // endregion

    // region Server Socket
    changeServer : function (server) {
        try {
            this.server = server;

            JSLog.i("LoginMgr::changeServer " + JSON.stringify(server));
            StorageUtil.setString("_cache_game_server_id_", JSON.stringify(this.server));
        }
        catch(e) {

        }
    },

    getServer : function () {
        try {
            this.server = JSON.parse(StorageUtil.getString("_cache_game_server_id_"));
        }
        catch(e) {
            if(Config.ENABLE_CHEAT) {
                this.server = Config.SERVER.DEV1;
            }
            else {
                this.server = Config.SERVER.LIVE;
            }
        }

        return this.server;
    },

    disconnectServer : function (v) {
        JSLog.d("LoginMgr::disconnectServer");
        GameClient.getInstance().disconnect(v);
    },

    connectServer : function () {
        JSLog.i(">>>Connecting Server " + JSON.stringify(loginMgr.getServer()));
        logMgr.journeyLog(LogMgr.NUJ.CONNECT_SERVER);
        GameClient.getInstance().connect();
    },
    // endregion

    // region Login Packet
    sendMobile : function () {
        logMgr.journeyLog(LogMgr.NUJ.LOGIN_SUCCESS);

        JSLog.i("loginMgr::sendMobile ");

        var mobile = new CmdSendMobile();
        this.sendPacket(mobile);
        mobile.clean();
    },

    sendLogin : function () {
        JSLog.i("loginMgr::sendLogin " + gameMgr.getDeviceID() + " - " + loginMgr.getSessionKey());

        var loginpk = new CmdSendLogin();
        loginpk.putData(loginMgr.getSessionKey(), gameMgr.getDeviceID());
        this.sendPacket(loginpk);
        loginpk.clean();
    },

    sendGetConfig : function () {
        this.sendPacketCMD(LoginMgr.CMD.CMD_GET_CONFIG);
    },

    onAnotherCom : function () {
        try {
            loginMgr.disconnectServer();

            Dialog.showOkCancelDialog(LocalizedString.to("DISCONNECT_LOGIN"), null, function (btnID) {
                loginMgr.retryLogin(btnID == Dialog.BTN_OK);
            });
        } catch (e) {
            cc.log(e);
        }
    },

    onGameConfig : function (data) {
        JSLog.i(">>GameConfig: " + JSON.stringify(data));
    },

    onGameCommonConfig : function (data) {
        JSLog.i(">>GameCommonConfig: " + JSON.stringify(data));
    }
    // endregion
});

LoginMgr.SOCIAL = {
    FACEBOOK : "facebook",
    GOOGLE : "google",
    APPLE : "apple",
    GUEST : "guest",
    NONE : ""
}

LoginMgr.CACHE = {
    SOCIAL : "_domino_social_name_",
    SESSION_KEY : "_domino_session_key_",
    ACCESS_TOKEN : "_domino_access_token_",
    OPEN_ID : "_domino_open_id_",
    AUTO_LOGIN : "_domino_auto_login_"
}

// region Guest Utils
let GuestUtil = function () {};
GuestUtil.KEY_ID = "abcxyz123";
GuestUtil.KEY_CACHE = "zingplaysocial";
GuestUtil.isInvalid = function (val) {
    return _.isNull(val) || _.isNaN(val) || _.isEmpty(val);
}
GuestUtil.getStringCrypt = function (key, defaultValue) {
    let val = StorageUtil.getString(key);
    if (GuestUtil.isInvalid(val)) {
        return defaultValue;
    }
    else {
        return CryptoJS.AES.decrypt(val, GuestUtil.KEY_CACHE).toString(CryptoJS.enc.Utf8);
    }
}
GuestUtil.setStringCrypt = function (key, value) {
    let val = CryptoJS.AES.encrypt(value, GuestUtil.KEY_CACHE);
    StorageUtil.setString(key, val.toString());
}
// endregion

// region LoginMgr Instance
LoginMgr._inst = null;
LoginMgr.instance = function() {
    if(!LoginMgr._inst) {
        LoginMgr._inst = new LoginMgr();
    }
    return LoginMgr._inst;
}
let loginMgr = LoginMgr.instance();
// endregion

// region CMD Packet
LoginMgr.CMD = {};
LoginMgr.CMD.CMD_LOGIN  = 1;
LoginMgr.CMD.CMD_LOGIN_FAIL  = 2;
LoginMgr.CMD.CMD_ANOTHER_COM  = 37;

LoginMgr.CMD.CMD_MOBILE  = 1011;
LoginMgr.CMD.CMD_GET_CONFIG  = 1004;
LoginMgr.CMD.CMD_COMMON_CONFIG  = 8001;
// endregion