/**
 * Created by Hunter on 11/8/2018.
 */

var WebViewUI = BaseLayer.extend({

    ctor: function () {
        this.curURL = "";

        this._super("WebViewUI");
        this.initWithBinaryFile("WebViewUI.json");
    },

    initGUI: function () {
        var winSize = cc.director.getWinSize();

        this.btnClose = this.customButton("close",0);
        this.btnReload = this.customButton("reload",1);

        this.title = this.getControl("title");
        this.title.setString("ZingPlay");

        this.bar = this.getControl("bar");
        this.bar.setScaleX(winSize.width/this.bar.getContentSize().width);

        this.btnClose.setPositionY(this.bar.getPositionY() - this.bar.getContentSize().height*this._scale/2);
        this.btnReload.setPositionY(this.btnClose.getPositionY());
        this.title.setPositionY(this.btnClose.getPositionY());

        this.pWebView = this.getControl("web");
        this.pWebView.url = this.getControl("url",this.pWebView);
        this.pWebView.url.setVisible(Config.ENABLE_CHEAT);
        this.pWebView.loading = this.getControl("loading",this.pWebView);

        this.pWebView.setContentSize(winSize.width,winSize.height - this.bar.getContentSize().height*this._scale);
        this.pWebView.url.setPositionX(winSize.width/2);
        this.pWebView.loading.setPositionX(winSize.width/2);
    },

    customizeGUI: function(){
        cc.eventManager.addListener(this._listener,this);
    },

    openURL : function (_url) {
        this.curURL = _url;
        this.pWebView.url.setString(_url);
        if(!this.webView) {
            if (cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS) {
                cc.log("##Webview::" + _url);
                var webView = new ccui.WebView(_url);
                webView.setContentSize(this.pWebView.getContentSize());
                webView.setScalesPageToFit(true);
                webView.setPosition(0, 0);
                webView.setAnchorPoint(0, 0);
                this.webView = sceneMgr.addWebview(webView);
                this._layout.addChild(this.webView);
            }
        }
        else {
            this.webView.loadURL(_url);
        }

        this.loading();
        this.setBackEnable(true);
    },

    onBack: function(){
        this.closeUI();
    },

    closeUI : function () {
        if(this.webView && cc.sys.isObjectValid(this.webView)) {
            this.webView.removeFromParent();
            this.webView = null;
        }

        this.onClose();
    },

    reloadURL : function () {
        if(this.webView) {
            this.pWebView.url.setString(this.curURL);
            this.webView.loadURL(this.curURL);
        }

        this.loading();
    },

    loading : function () {
        this.pWebView.loading.stopAllActions();
        this.pWebView.loading.runAction(cc.repeatForever(cc.rotateBy(0.05,5)));
    },

    onButtonRelease: function (btn, id) {
        switch (id) {
            case 0 : // close
            {
                this.closeUI();
                break;
            }
            case 1 :
            {
                this.reloadURL();
            }
        }
    },
});

WebViewUI.show = function (url) {
    sceneMgr.openGUI(WebViewUI.className,WebViewUI.Z_ODER,WebViewUI.Z_ODER).openURL(url);
};

WebViewUI.close = function () {
    var _layer = sceneMgr.getGUIByClassName(WebViewUI.className);
    if (_layer) _layer.closeUI();
};

WebViewUI.Z_ODER = 939393939;
WebViewUI.className = "WebViewUI";