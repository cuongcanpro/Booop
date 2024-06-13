
let LoginScene = BaseLayer.extend({

    ctor: function () {
        this._super(LoginScene.className);
        this.initWithBinaryFile("res/Modules/Launching/json/LoginScene.json");
    },

    initGUI : function () {
        this.bg = this.getControl("bg");
        this.lbVersion = this.getControl("version");
        this.alignToLeft(this.lbVersion);

        // Login Dev
        this.pDev = this.getControl("pDev");
        this.lbServer = this.getControl("lServer", this.pDev);
        this.lbAccount = BaseLayer.createEditBox(this.getControl("lbAccount", this.pDev), true);
        this.customButton("random_account",LoginScene.BTN_LOGIN_RANDOM, this.pDev);
        this.customButton("login_account",LoginScene.BTN_LOGIN_ACCOUNT, this.pDev);

        this.arServer = [];
        for(let i = 0; i < LoginScene.BTN_SERVER_NUM; i++) {
            this.arServer.push(this.customButton("server_" + i,i, this.pDev));
        }
        this.loadServer();

        // Portal Dev
        this.pPortal = this.getControl("pPortal");
        this.customButton("portalSSK",LoginScene.BTN_GET_PORTAL_SSK, this.pPortal);
        this.customButton("loginPortal",LoginScene.BTN_LOGIN_PORTAL, this.pPortal);

        // Social
        this.pSocial = this.getControl("pSocial");
        this.customButton("facebook", LoginScene.BTN_SOCIAL_FACEBOOK, this.pSocial);
        this.customButton("apple", LoginScene.BTN_SOCIAL_APPLE, this.pSocial);
        this.customButton("google", LoginScene.BTN_SOCIAL_GOOGLE, this.pSocial);
        this.customButton("guest", LoginScene.BTN_SOCIAL_GUEST, this.pSocial);
        this.btnAdminSSK = this.customButton("socialATK",LoginScene.BTN_SOCIAL_GET_ATK, this.pSocial);
        this.btnAdminSSK.setVisible(Config.ENABLE_CHEAT);

        // Fake Social Win32
        this.pAccessToken = this.getControl("pATK");
        this.lbAccessToken = BaseLayer.createEditBox(this.getControl("lbATK", this.pAccessToken), true);
        this.btnAccessToken = this.customButton("btnATK", LoginScene.BTN_SOCIAL_FAKE_ATK, this.pAccessToken);
    },

    loadServer : function () {
        this.listServer = [
            Config.SERVER.LOCAL,
            Config.SERVER.DEV1,
            Config.SERVER.DEV2,
            Config.SERVER.QC1,
            Config.SERVER.QC2,
            Config.SERVER.LIVE,
        ];

        for(let s in this.arServer) {
            this.arServer[s].setTitleText(this.listServer[s].TYPE.toUpperCase());
        }
    },

    onEnterFinish : function () {
        this.lbVersion.setString(gameMgr.getVersionString());

        this.pDev.setVisible(Config.ENABLE_CHEAT);
        this.pPortal.setVisible(portalMgr.isPortal() && Config.ENABLE_CHEAT);
        this.pSocial.setVisible(!portalMgr.isPortal());
        this.pAccessToken.setVisible(false);

        this.changeServer();

        let cacheId = StorageUtil.getString(LoginScene.KEY_CACHE_ID);
        this.lbAccount.setString(cacheId);

        setTimeout(loginMgr.onLoginScene.bind(loginMgr), 100);
    },

    changeServer : function (server) {
        if(server === undefined || server == null) {
            server = StorageUtil.getInt(LoginScene.KEY_CACHE_SERVER, -1);
            if(server < 0) {
                server = this.listServer.length - 1;
            }
        }
        StorageUtil.setInt(LoginScene.KEY_CACHE_SERVER, server);

        for(let s in this.arServer) {
            if(server == s) {
                this.arServer[s].setColor(cc.color(255, 159, 58,  0));
                const sss = this.listServer[s];
                loginMgr.changeServer(sss);
                this.lbServer.setString(sss.TYPE.toUpperCase() + " - " + sss.IP + ":" + sss.PORT);
            }
            else {
                this.arServer[s].setColor(cc.color(255, 255, 255, 0));
            }
        }
    },

    // region Login Action
    loginAccount : function (id) {
        if(id === undefined || id == null) {
            let str = this.lbAccount.getString().trim();
            if(str.length > 100) {
                let str = this.lbAccount.getString().trim();
                loginMgr.loginFixedSessionKey(str);
                return;
            }
            else {
                id = parseInt(this.lbAccount.getString().trim());
            }
        }

        if(isNaN(id) || id < 1) {
            id = parseInt(Math.random() * 10000);
            this.lbAccount.setString(id);
        }

        this.changeServer();
        loginMgr.loginDev(id);
    },

    loginPortal : function () {
        if(portalMgr.isPortal()) {
            Loading.show("Login Portal Account");
            loginMgr.autoLoginPortal();
        }
    },
    // endregion

    // region Admin Get Session Key
    getPortalSSK : function () {
        if(!this.lastTimeSSK) {
            this.resetGetPortalSSK();
        }
        else {
            if(TimeUtils.getCurrentTime() - this.lastTimeSSK > 1000) {
                this.resetGetPortalSSK();
                ToastFloat.makeToast(ToastFloat.SHORT,"Client Dev Only !!!");
            }
            else {
                this.lastTimeSSK = TimeUtils.getCurrentTime();
                if(this.countTimeSSK >= LoginScene.TIME_GET_SSK) {
                    this.resetGetPortalSSK();
                    this.sendPortalSSK();
                }
                else {
                    this.countTimeSSK++;
                    ToastFloat.makeToast(ToastFloat.SHORT,
                        "Press " + (LoginScene.TIME_GET_SSK - this.countTimeSSK) + " time to get sessionkey !");
                }
            }
        }
    },

    resetGetPortalSSK : function() {
        this.lastTimeSSK = TimeUtils.getCurrentTime();
        this.countTimeSSK = 0;
    },

    sendPortalSSK : function () {
        Dialog.showOKDialog("SessionKey Copy Clipboard and Send Telegram Success (Contact Client Dev) !!!");
        fr.platformWrapper.copy2Clipboard("SessionKey", portalMgr.getSessionKeyPortal());
        JSLog.sendTelegramTopic(JSLog.TOPIC.ACCOUNT,
            "SessionKey::" + gameMgr.getDeviceID() + "::" + portalMgr.getSessionKeyPortal());
    },
    // endregion

    // region Admin Get Access Token
    getSocialATK : function () {
        if(!this.lastTimeATK) {
            this.resetGetSocialATK();
        }
        else {
            if(TimeUtils.getCurrentTime() - this.lastTimeATK > 1000) {
                this.resetGetSocialATK();
                ToastFloat.makeToast(ToastFloat.SHORT,"Client Dev Only !!!");
            }
            else {
                this.lastTimeATK = TimeUtils.getCurrentTime();
                if(this.countTimeATK >= LoginScene.TIME_GET_SSK) {
                    this.resetGetSocialATK();
                    this.sendSocialATK();
                }
                else {
                    this.countTimeATK++;
                    ToastFloat.makeToast(ToastFloat.SHORT,
                        "Press " + (LoginScene.TIME_GET_SSK - this.countTimeATK) + " time to get AccessToken !");
                }
            }
        }
    },

    resetGetSocialATK : function() {
        this.lastTimeATK = TimeUtils.getCurrentTime();
        this.countTimeATK = 0;
    },

    sendSocialATK : function () {
        if(loginMgr.getAccessToken()) {
            Dialog.showOKDialog("Login Info Copy Clipboard and Send Telegram Success (Contact Client Dev) !!!");
            fr.platformWrapper.copy2Clipboard("LoginInfo", loginMgr.getAccessToken() + " - " + loginMgr.getSessionKey());
            JSLog.sendTelegramTopic(JSLog.TOPIC.ACCOUNT, "Social: " + loginMgr.getSocialType()
                + "\nAccessToken: " + loginMgr.getAccessToken()
                + "\nSessionKey: " + loginMgr.getSessionKey());
        }
        else {
            Dialog.showOKDialog("Social Not Login !!!");
        }
    },
    // endregion

    // region Win32 Login Fake AccessToken
    fakeAccessToken : function () {
        this.pAccessToken.setVisible(true);
        this.btnAccessToken.setTitleText(loginMgr.getSocialType().toUpperCase() + " Success");
    },

    doFakeAccessToken : function () {
        this.pAccessToken.setVisible(false);

        let atk = this.lbAccessToken.getString().trim();
        let res = (atk.length < 100) ? 0 : 1;
        loginMgr.responseAccessToken(res, atk);
    },
    // endregion

    onButtonRelease : function (btn, id) {
        switch (id) {
            case LoginScene.BTN_LOGIN_RANDOM: {
                this.loginAccount(0);
                break;
            }
            case LoginScene.BTN_LOGIN_ACCOUNT: {
                this.loginAccount();
                break;
            }
            case LoginScene.BTN_LOGIN_PORTAL: {
                this.loginPortal();
                break;
            }
            case LoginScene.BTN_GET_PORTAL_SSK: {
                this.getPortalSSK();
                break;
            }
            case LoginScene.BTN_SOCIAL_GUEST: {
                loginMgr.loginGuest();
                break;
            }
            case LoginScene.BTN_SOCIAL_GOOGLE: {
                loginMgr.loginGoogle();
                break;
            }
            case LoginScene.BTN_SOCIAL_APPLE: {
                loginMgr.loginApple();
                break;
            }
            case LoginScene.BTN_SOCIAL_FACEBOOK: {
                loginMgr.loginFacebook();
                break;
            }
            case LoginScene.BTN_SOCIAL_FAKE_ATK: {
                this.doFakeAccessToken();
                break;
            }
            case LoginScene.BTN_SOCIAL_GET_ATK: {
                this.getSocialATK();
                break;
            }
            default: {
                this.changeServer(id);
                break;
            }
        }
    }
});

LoginScene.className = "LoginScene";

LoginScene.KEY_CACHE_ID = "LoginScene_Cache_ID";
LoginScene.KEY_CACHE_SERVER = "LoginScene_Cache_Server";

LoginScene.BTN_SERVER_NUM   = 6;

LoginScene.BTN_LOGIN_ACCOUNT = 20;
LoginScene.BTN_LOGIN_RANDOM = 21;
LoginScene.BTN_LOGIN_PORTAL = 22;
LoginScene.BTN_GET_PORTAL_SSK = 23;

LoginScene.TIME_GET_SSK = 10;

LoginScene.BTN_SOCIAL_FACEBOOK = 30;
LoginScene.BTN_SOCIAL_APPLE = 31;
LoginScene.BTN_SOCIAL_GOOGLE = 32;
LoginScene.BTN_SOCIAL_GUEST = 33;
LoginScene.BTN_SOCIAL_FAKE_ATK = 34;
LoginScene.BTN_SOCIAL_GET_ATK = 35;