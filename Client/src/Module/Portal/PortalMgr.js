var PortalMgr = BaseMgr.extend({

    _deepLink : { isInit : false },

    ctor: function () {
        this._super();
    },

    init: function () {

    },

    onReceived: function (cmd, pk) {

    },

    isPortal : function () {
        try {
            return (cc.director.isUsePortal && cc.director.isUsePortal());
        } catch (e) {

        }
        return false;
    },

    endGame: function () {
        if (this.isPortal()) {
            try {
                fr.NativeService.endGame();
            } catch (e) {
                cc.director.end();
            }
        }
    },

    getSessionKeyPortal : function () {
        if (!cc.sys.isNative) {
            return loginMgr.getSessionKey();
        }

        try {
            return fr.NativePortal.getInstance().getSessionKey();
        } catch (e) {

        }
        return "";
    },

    getSocialType : function () {
        try {
            return fr.NativePortal.getInstance().getSocialType();
        } catch (e) {

        }
        return "";
    },

    // region Deeplink
    parseDeepLink: function () {
        if(this._deepLink && this._deepLink.isInit) return;

        try {
            var deeplinkObj = injection.deeplink.getData();
            this._deepLink = JSON.parse(deeplinkObj);
        }
        catch(e) {
            cc.log("#PortalMgr::parseData error " + e);
            this._deepLink = {};
        }
        this._deepLink.isInit = true;
        cc.log("#PortalMgr::DeepLink " + JSON.stringify(this._deepLink));
    },

    getDeepLinkType : function () {
        try {
            return this._deepLink.type;
        }
        catch(e) {
            cc.log("#PortalMgr::getType error " + e);
        }

        return "";
    },

    getDeepLinkData : function () {
        try {
            var data = JSON.parse(this._deepLink.data);
            return data;
        }
        catch(e) {
            cc.log("#PortalMgr::getData error " + e);
        }

        return null;
    },

    clearDeepLink : function () {
        this._deepLink = {isInit : true};
    },
    // endregion

    // sent event portal tet 2021
    checkEvent : function () {

    },

    setFoxButtonPosition: function (x, y) {
        if (typeof(injection) != 'undefined'
            && injection.fox != null
            && injection.fox.setFoxPosition != null
            && typeof(injection.fox.setFoxPosition) == 'function') {
            injection.fox.setFoxPosition(x, y);
        }
    }
});

PortalMgr.instance = null;
PortalMgr.getInstance = function () {
    if (!PortalMgr.instance) {
        PortalMgr.instance = new PortalMgr();
    }
    return PortalMgr.instance;
};
var portalMgr = PortalMgr.getInstance();