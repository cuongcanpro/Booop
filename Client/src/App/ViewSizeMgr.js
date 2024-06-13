
var ViewSizeMgr = cc.Class.extend({

    SCREEN_DEFAULT : cc.size(1200,720),
    SCREEN_SMALL : cc.size(800,480),

    _defaultSize : cc.size(0,0),
    _smallSize : cc.size(0,0),

    _deltaCenter : cc.p(0,0),

    _scaleGUI : 0,
    arraySmallScene: [],

    ctor : function () {
        this.initDelta();
    },

    initDelta : function () {
        // scale
        var sX = this.SCREEN_SMALL.width/this.SCREEN_DEFAULT.width;
        var sY = this.SCREEN_SMALL.height/this.SCREEN_DEFAULT.height;

        this._scaleGUI = sX;

        // position
        var dX = (this.SCREEN_DEFAULT.width - this.SCREEN_SMALL.width) / 2;
        var dY = (this.SCREEN_DEFAULT.height - this.SCREEN_SMALL.height) / 2;
        this._deltaCenter = cc.p(dX,dY);
    },

    init : function () {
        this._defaultSize = this.calculateWinSize(this.SCREEN_DEFAULT);
        this._smallSize = this.calculateWinSize(this.SCREEN_SMALL);

        this.initSmallScene();
    },

    initSmallScene: function () {
        this.arraySmallScene = [
            //LuckyCardScene.className
        ];
    },

    calculateWinSize : function (designSize) {
        var frameSize = cc.view.getFrameSize();
        var rate = this.SCREEN_DEFAULT.width / this.SCREEN_DEFAULT.height;
        if (cc.sys.isNative) {  // android - ios - window
            var ratio = frameSize.width / frameSize.height;
            if(platformMgr.isIOS()) {
                if(ratio > 2) {
                    cc.view.setDesignResolutionSize(designSize.height * 2, designSize.height, cc.ResolutionPolicy.SHOW_ALL);
                }
                else if(ratio > rate) {
                    cc.view.setDesignResolutionSize(designSize.width, designSize.height, cc.ResolutionPolicy.FIXED_HEIGHT);
                }
                else {
                    cc.view.setDesignResolutionSize(designSize.width, designSize.height, cc.ResolutionPolicy.FIXED_WIDTH);
                }
            }
            else {
                if(ratio > rate) {
                    cc.view.setDesignResolutionSize(designSize.width, designSize.height, cc.ResolutionPolicy.FIXED_HEIGHT);
                }
                else {
                    cc.view.setDesignResolutionSize(designSize.width, designSize.height, cc.ResolutionPolicy.FIXED_WIDTH);
                }
            }

        }
        else {  // web
            cc.resPath = "./res";
            cc.loader.resPath = srcPath || "";
            jsb.fileUtils.init();
            jsb.fileUtils.analysticFrom(g_resources);

            cc.view.setDesignResolutionSize(Constant.WIDTH, Constant.HEIGHT, cc.ResolutionPolicy.SHOW_ALL);
        }
        return cc.winSize;
    },

    // update view size when change scene
    updateView : function (sceneName) {
        var frameSize = cc.view.getFrameSize();
        var designSize = this.SCREEN_DEFAULT;
        this.currentScene = sceneName;
        if(this.isSmallView()) {
            designSize = this.SCREEN_SMALL;
        }

        // init view
        cc.view.enableRetina(true);
        cc.view.adjustViewPort(true);

        var rate = this.SCREEN_DEFAULT.width / this.SCREEN_DEFAULT.height;
        if (cc.sys.isNative) {  // android - ios - window
            var ratio = frameSize.width / frameSize.height;
            if(iosMgr.isIOS()) {
                if(ratio > 2) {
                    cc.view.setDesignResolutionSize(designSize.height * 2, designSize.height, cc.ResolutionPolicy.SHOW_ALL);
                }
                else if(ratio > rate) {
                    cc.view.setDesignResolutionSize(designSize.width, designSize.height, cc.ResolutionPolicy.FIXED_HEIGHT);
                }
                else {
                    cc.view.setDesignResolutionSize(designSize.width, designSize.height, cc.ResolutionPolicy.FIXED_WIDTH);
                }
            }
            else {
                if(ratio > rate) {
                    cc.view.setDesignResolutionSize(designSize.width, designSize.height, cc.ResolutionPolicy.FIXED_HEIGHT);
                }
                else {
                    cc.view.setDesignResolutionSize(designSize.width, designSize.height, cc.ResolutionPolicy.FIXED_WIDTH);
                }
            }

        }
        else {  // web
            cc.resPath = "./res";
            cc.loader.resPath = srcPath || "";
            jsb.fileUtils.init();
            jsb.fileUtils.analysticFrom(g_resources);

            cc.view.setDesignResolutionSize(Constant.WIDTH, Constant.HEIGHT, cc.ResolutionPolicy.SHOW_ALL);
        }

        cc.view.resizeWithBrowserSize(true);

        engine.ipad = false;
        engine.ipad = (cc.winSize.width / cc.winSize.height <= 4 / 3) && (cc.winSize.width > 480);

        // log screen size
        // winSize = cc.view.getVisibleSize()
        var frameSize = cc.view.getFrameSize();
        var winSize = cc.winSize;
        cc.log("#FrameSize : " + JSON.stringify(frameSize));
        cc.log("#WinSize : " + JSON.stringify(winSize));

        try {
            if (typeof injection != "undefined" && injection != null && injection.fox != null) {
                injection.fox.onUpdateDesignResolution();
            }
        }
        catch(e) {
            cc.log("#Portal Fox Error")
        }
    },

    // get-set
    getScalePopup : function (isSmall) {
        // cc.log("ScaleGUI: *** " + this._scaleGUI);
        if(isSmall) {
            if(!viewSizeMgr.isSmallView()) {
                return 1 / this._scaleGUI;
            }
            else {
                return 1;
            }
        }
        else {
            if(viewSizeMgr.isSmallView()) {
                return this._scaleGUI;
            }
            else {
                return 1;
            }
        }
    },

    getDeltaCenter : function () {
        return cc.p(0,0);
    },

    getPosCenter : function () {
        return cc.p(cc.winSize.width / 2,cc.winSize.height / 2);
    },

    isSmallView : function () {
        for (var i = 0; i < this.arraySmallScene.length; i++) {
            if (this.arraySmallScene[i] == this.currentScene) {
                return true;
            }
        }
        return false;
    }
});

// region ViewSizeMgr
ViewSizeMgr._inst = null;

/**
 * @returns {ViewSizeMgr}
 */
ViewSizeMgr.instance = function () {
    if(ViewSizeMgr._inst == null) {
        ViewSizeMgr._inst = new ViewSizeMgr();
    }
    return ViewSizeMgr._inst;
}

viewSizeMgr = ViewSizeMgr.instance();
// endregion