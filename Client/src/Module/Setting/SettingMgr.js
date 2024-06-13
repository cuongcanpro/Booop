var SettingMgr = BaseMgr.extend({
    ctor: function () {
        this._super();
        //this.sound = true;
        this.vibrate = true;
        this.acceptFriend = true;
        this.acceptInvite = true;

        this.music = true;
        this.sound = true;
        this.qqRevealing = true;
        this.vibrate = true;

        this.lang = 'en';
    },

    init: function () {
        // // load storage variable
        // if (cc.sys.localStorage.getItem("sound")) {
        //     var sound = cc.sys.localStorage.getItem("sound");
        //     this.sound = (Number(sound) > 2);
        // }

        var vibrate = cc.sys.localStorage.getItem("vibrate");
        if (vibrate !== undefined && vibrate != null) {
            this.vibrate = (Number(vibrate) === 1);
        }

        var invite = cc.sys.localStorage.getItem("invite");
        if (invite !== undefined && invite != null) {
            this.acceptInvite = (Number(invite) === 1);
        }

        var friend = cc.sys.localStorage.getItem("friend");
        if (friend !== undefined && friend != null) {
            this.acceptFriend = (Number(friend) === 1);
        }

        // load storage variable
        var sound = cc.sys.localStorage.getItem("sound");
        if (sound) {
            this.sound = sound > 2;
        } else {
            cc.sys.localStorage.setItem("sound", 3);
        }

        // load storage variable
        var music = cc.sys.localStorage.getItem("music");
        if (music) {
            this.music = music > 2;
        } else {
            cc.sys.localStorage.setItem("music", 3);
        }

        // 1: false; 2: true
        var qqRevealing = cc.sys.localStorage.getItem("qiu_qiu_revealing");
        if (qqRevealing) {
            this.qqRevealing = qqRevealing > 1;
        } else {
            cc.sys.localStorage.setItem("qiu_qiu_revealing", 2);
        }

        var vibrate = cc.sys.localStorage.getItem("setting_vibrate");
        if (vibrate) {
            this.vibrate = vibrate > 1;
        } else {
            cc.sys.localStorage.setItem("setting_vibrate", 2);
        }

        LocalizedString.add('Setting/Localized_id');

        let lang =  cc.sys.localStorage.getItem("setting_lang");
        if (lang) {
            this.lang = lang;
        } else {
            this.lang = 'id';
        }

        setTimeout(()=>{
            this.setLanguage(this.lang);
        }, 1);
    },

    onReceived: function (cmd, pk) {
        return false;
    },

    openSettingUI: function () {
        sceneMgr.openGUI(SettingUI.className, SettingUI.TAG, SettingUI.TAG, true);
    },

    openDeleteAccount: function () {
        sceneMgr.openGUI(DeleteAccountUI.className, DeleteAccountUI.TAG, DeleteAccountUI.TAG, true);
    },

    setLanguage: function (isoCode) {
        LocalizedString.setLanguage(isoCode);

        this.lang = isoCode;

        cc.sys.localStorage.setItem("setting_lang", this.lang);
    },

    onOffSound: function () {
        settingMgr.sound = !settingMgr.sound;
        cc.sys.localStorage.setItem("sound", settingMgr.sound ? 3 : 1);
    },

    onOffMusic: function () {
        settingMgr.music = !settingMgr.music;
        cc.sys.localStorage.setItem("music", settingMgr.music ? 3 : 1);

        if (sceneMgr.getMainLayer() instanceof QiuQiuBoardScene) {
            if (settingMgr.music) {
                gameSound.playQiuQiuMusic()
            } else {
                gameSound.stopQiuQiuMusic()
            }
        }

        if (sceneMgr.getMainLayer() instanceof GapleScene) {
            if (settingMgr.music) {
                gameSound.playGapleMusic()
            } else {
                gameSound.stopGapleMusic()
            }
        }

        if (sceneMgr.getMainLayer() instanceof LobbyScene) {
            if (settingMgr.music) {
                gameSound.playLobbyMusic()
            } else {
                gameSound.stopLobbyMusic()
            }
        }
    },

    onOffQiuQiuRevealing: function () {
        settingMgr.qqRevealing = !settingMgr.qqRevealing;
        cc.sys.localStorage.setItem("qiu_qiu_revealing", settingMgr.qqRevealing ? 3 : 1);
    },

    onOffVibrate: function () {
        settingMgr.vibrate = !settingMgr.vibrate;
        cc.sys.localStorage.setItem("setting_vibrate", settingMgr.vibrate ? 3 : 1);
    },

    getCurrentLanguageIsoCode: function () {
        return this.lang;
    }
})

SettingMgr.instance = null;
SettingMgr.getInstance = function () {
    if (!SettingMgr.instance) {
        SettingMgr.instance = new SettingMgr();
    }
    return SettingMgr.instance;
};
var settingMgr = SettingMgr.getInstance();