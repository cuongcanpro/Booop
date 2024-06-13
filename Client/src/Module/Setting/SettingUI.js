let SettingUI = BaseLayer.extend({
    ctor: function () {
        this._super();

        this.initWithBinaryFile("Setting/json/SettingScene.json");
    },

    initGUI: function () {
        this.root = this.getControl('root');
        let bg = this.root.getChildByName('bg');
        this.customButton('btnClose', SettingUI.BTN_CLOSE, bg);
        this.btnLang = this.customButton('btnLang', SettingUI.BTN_LANG, bg);
        this.txtLang = this.btnLang.getChildByName('txt');

        this.txtLogout = this.customButton('btnLogout', SettingUI.BTN_LOGOUT, bg).getChildByName('txt');

        this.btnFB = this.customButton('btnFb', SettingUI.BTN_FANPAGE, bg);
        this.txtFb = this.btnFB.getChildByName('txt');

        this.btnDeleteAccount = this.customButton('btnDeleteAccount', SettingUI.BTN_DELETE_ACCOUNT, bg);
        this.txtDeleteAccount = this.btnFB.getChildByName('txt');

        this.txtHelp = this.customButton('btnHelp', SettingUI.BTN_SUPPORT, bg).getChildByName('txt');

        this.sound = bg.getChildByName('sound');
        this.sound.cb = this.sound.getChildByName('cb');
        this.sound.cb.addTouchEventListener((sender, type)=>{
            switch (type) {
                case ccui.CheckBox.EVENT_SELECTED:
                case ccui.CheckBox.EVENT_UNSELECTED:
                    settingMgr.onOffSound();
                    break;
            }
        });

        this.music = bg.getChildByName('music');
        this.music.cb = this.music.getChildByName('cb');
        this.music.cb.addTouchEventListener((sender, type)=>{
            switch (type) {
                case ccui.CheckBox.EVENT_SELECTED:
                case ccui.CheckBox.EVENT_UNSELECTED:
                    settingMgr.onOffMusic();
                    break;
            }
        });

        this.autoBuyIn = bg.getChildByName('autoBuyIn');
        this.autoBuyIn.cb = this.autoBuyIn.getChildByName('cb');
        this.autoBuyIn.cb.addTouchEventListener((sender, type)=>{

        });

        this.revealing = bg.getChildByName('revealing');
        this.revealing.cb = this.revealing.getChildByName('cb');
        this.revealing.cb.addTouchEventListener((sender, type)=>{
            switch (type) {
                case ccui.CheckBox.EVENT_SELECTED:
                case ccui.CheckBox.EVENT_UNSELECTED:
                    settingMgr.onOffQiuQiuRevealing();
                    break;
            }
        });

        this.vibrate = bg.getChildByName('vibrate');
        this.vibrate.cb = this.vibrate.getChildByName('cb');
        this.vibrate.cb.addTouchEventListener((sender, type)=>{
            switch (type) {
                case ccui.CheckBox.EVENT_SELECTED:
                case ccui.CheckBox.EVENT_UNSELECTED:
                    settingMgr.onOffVibrate();
                    break;
            }
        });

        this.version = bg.getChildByName('txtVersion');

        this.initFog();
    },

    onEnterFinish: function () {
        this.btnFB.setVisible(!platformMgr.isReview());
        this.btnDeleteAccount.setVisible(platformMgr.isReview());

        this.sound.cb.setSelected(settingMgr.sound);
        this.music.cb.setSelected(settingMgr.music);
        this.revealing.cb.setSelected(settingMgr.qqRevealing);
        this.vibrate.cb.setSelected(settingMgr.vibrate);

        this.showFog();
        this.setShowHideAnimate(this.root, undefined, false);

        this.version.setString(gameMgr.getVersionString());
    },

    onButtonRelease: function (button, id) {
        switch (id) {
            case SettingUI.BTN_CLOSE: {
                this.onClose();
                break;
            }
            case SettingUI.BTN_SOUND: {
                break;
            }
            case SettingUI.BTN_VIBRATE: {
                break;
            }
            case SettingUI.BTN_FRIEND: {
                break;
            }
            case SettingUI.BTN_INVITE: {
                break;
            }
            case SettingUI.BTN_LOGOUT: {
                this.onLogout();
                break;
            }
            case SettingUI.BTN_SUPPORT: {
                fr.platformWrapper.openURL(Constant.SUPPORT_PAGE);
                this.onClose();
                break;
            }
            case SettingUI.BTN_FANPAGE: {
                fr.platformWrapper.openFacebook(Constant.FAN_PAGE);
                break;
            }
            case SettingUI.BTN_LANG: {
                settingMgr.setLanguage(settingMgr.lang === 'en' ? 'id' : 'en');
                break;
            }
            case SettingUI.BTN_DELETE_ACCOUNT: {
                this.onClose();
                settingMgr.openDeleteAccount();
                break;
            }
        }
    },

    onLanguageChanged: function (isoCode) {
        let langImgPath = undefined;
        if (isoCode === 'en') {
            langImgPath = 'Setting/rc/iconEng.png';
            this.txtLang.setFontSize(28);
            this.txtFb.setFontSize(28);
            this.txtHelp.setFontSize(28);
            this.txtLogout.setFontSize(28);
            this.txtDeleteAccount.setFontSize(28);
        }

        if (isoCode === 'id') {
            langImgPath = 'Setting/rc/iconIndo.png';
            this.txtLang.setFontSize(22);
            this.txtFb.setFontSize(22);
            this.txtHelp.setFontSize(22);
            this.txtLogout.setFontSize(22);
            this.txtDeleteAccount.setFontSize(22);
        }

        if (langImgPath) {
            this.btnLang.loadTextures(langImgPath, langImgPath, langImgPath);
        }

        this.txtLang.setString(ISO6391.getNativeName(isoCode));
    },

    onLogout: function () {
        let message = portalMgr.isPortal() ? LocalizedString.to("LOGOUT_GAME_TO_PORTAL") : LocalizedString.to("GAME_ASKLOGOUT_");
        Dialog.showOkCancelDialog(message, this, function (btnID) {
            if (btnID === Dialog.BTN_OK) {
                loginMgr.logout();
            }
        });
    }
});

SettingUI.className = "SettingUI";
SettingUI.TAG = 1000;

SettingUI.BTN_CLOSE = 1;
SettingUI.BTN_SOUND = 2;
SettingUI.BTN_VIBRATE = 3;
SettingUI.BTN_INVITE = 4;
SettingUI.BTN_FRIEND = 5;
SettingUI.BTN_LOGOUT = 6;
SettingUI.BTN_SUPPORT = 7;
SettingUI.BTN_FANPAGE = 8;
SettingUI.BTN_LANG = 9;
SettingUI.BTN_DELETE_ACCOUNT = 10;
