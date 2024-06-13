/**
 * Created by HOANGNGUYEN on 7/20/2015.
 */

var engine = engine || {};

var BaseLayer  = cc.Layer.extend({

    ctor: function(id){
        cc.Layer.prototype.ctor.call(this);

        this._hasInit = false;

        this._id = id;
        this._layout = null;
        this._bg = null;
        this._layoutPath = "";
        this._scale = -1;
        this._scaleRealX = -1;
        this._scaleRealY = -1;

        this._layerGUI = null;
        this._aaPopup = "";

        this._showHideAnimate = false;
        this._bgShowHideAnimate = null;
        this._currentScaleBg = 1;

        this._enableBack = false;

        if(this._scale  < 0)
        {
            this._scale = cc.director.getWinSize().width/Constant.WIDTH;
            this._scale = (this._scale > 1) ? 1 : this._scale;
        }

        this._scaleRealX = cc.director.getWinSize().width/Constant.WIDTH;
        this._scaleRealY = cc.director.getWinSize().height/Constant.HEIGHT;

        this._layerColor = new cc.LayerColor(cc.BLACK);
        this._layerColor.defaultAlpha = 150;
        this._layerColor.setVisible(false);
        this.addChild(this._layerColor, -1);

        this._layerGUI = new cc.Layer();
        this._layerGUI.setLocalZOrder(999);
        this._layerGUI.setVisible(true);
        this.addChild(this._layerGUI);

        this._keyboardEvent = cc.EventListener.create({
            event:cc.EventListener.KEYBOARD,
            onKeyReleased:function(keyCode, event){
                if(keyCode == cc.KEY.back || keyCode == 27){
                    event.getCurrentTarget().backKeyPress();
                }
            }
        });
        cc.eventManager.addListener(this._keyboardEvent, this);

        if (Config.ENABLE_CHEAT) {
            cc.eventManager.addListener({
                event: cc.EventListener.KEYBOARD,
                onKeyPressed: function (keyCode, event) {
                    this.onKeyPressed(keyCode, event);
                }.bind(this),
                onKeyReleased: function (keyCode, event) {
                    this.onKeyReleased(keyCode, event);
                }.bind(this)
            }, this);
        }
    },

    onEnter: function(){
        if(viewSizeMgr.isSmallView()) {
            if(!this._isSmall) {
                this._isNeedChangeSize = true;
            }
        }
        else {
            if(this._isSmall) {
                this._isNeedChangeSize = true;
            }
        }
        cc.Layer.prototype.onEnter.call(this);
        this.isShow = true;
        if(!this._listener)this._listener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function(touch,event){return true;},
            onTouchMoved: function(touch,event){},
            onTouchEnded: function(touch,event){}
        });

        this.setContentSize(cc.winSize);
        this.setAnchorPoint(0.5,0.5);

        if(!this._hasInit)
        {
            this._hasInit = true;
            this.customizeGUI();
        }

        this.onEnterFinish();

        if (this.onLanguageChanged && !this._isFirstCallOnLanguageChanged) {
            this.onLanguageChanged(LocalizedString.getCurrentLanguageIsoCode());
            this._isFirstCallOnLanguageChanged = true;
        }

        this.doEffect();
    },

    onExit : function () {
        cc.Layer.prototype.onExit.call(this);
        this.isShow = false;
        if(this._aaPopup && this._cachePopup)
        {
            this.retain();
        }
    },

    doEffect: function()
    {

    },

    initWithBinaryFile: function(json){
        JSLog.d(">>FullPathFile " + json + " -> " + jsb.fileUtils.fullPathForFilename(json));

        if (Config.ENABLE_CHEAT) cc.log("LOAD JSON : " + json);

        var start = new Date().getTime();
        this._layoutPath = json;
        var jsonLayout = ccs.load(json);
        this._layout = jsonLayout.node;
        this._layout.setContentSize(cc.director.getWinSize());
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        var end = new Date().getTime();
        cc.log("## Time Load " + json + " : " + (end - start));

        this.initGUI();
        var end2 = new Date().getTime();
        cc.log("## Time Init " + json + " : " + (end2 - end));
    },

    initWithBinaryFileAndOtherSize: function (json, designSize) {
        cc.log("LOAD JSON : " + json);
        var start = new Date().getTime();
        var jsonLayout = ccs.load(json);
        this._layout = jsonLayout.node;
        designSize = designSize || this._layout.getContentSize();

        var scale = 1;
        var size = cc.director.getWinSize();
        if (size.height === Constant.HEIGHT) {
            this._layout.setContentSize(cc.size(designSize.height * size.width / size.height, designSize.height));
            scale = size.height / designSize.height;
        } else {
            this._layout.setContentSize(cc.size(designSize.width, designSize.width * size.height / size.width));
            scale = size.width / designSize.width;
        }
        this._layout.setScale(scale);
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        var end = new Date().getTime();
        cc.log("## Time Load " + json + " : " + (end - start));

        this.initGUI();
        var end2 = new Date().getTime();
        cc.log("## Time Init " + json + " : " + (end2 - end));
        if (json.indexOf("res/Event/") >= 0) {
            this._isSmall = true;
        }
    },

    setAsPopup : function (value,isCache) {
        this._aaPopup = value;
        this._cachePopup = isCache;

        if(value && this._layerGUI)
        {
            this._layerGUI.removeFromParent();
            this._layerGUI = null;
        }
    },

    customButton : function (name, tag, parent, action, delayClick) {
        if(action === undefined)
            action = true;
        if(delayClick === undefined)
            delayClick = 0;

        var btn = this.getControl(name, parent);
        if(!btn) return null;
        btn.setPressedActionEnabled(action);
        btn.setTag(tag);
        btn.addTouchEventListener(this.onTouchEventHandler,this);
        btn.delayClick = delayClick * 1000;
        if(delayClick > 0)btn.timeLastClick = 0;
        return btn;
    },

    setLabelText : function (text, control) {
        if(typeof  text === 'undefined') return;
        if(typeof  control === 'undefined') return;
        if(control == null) return;
        if(typeof  control.getString() === 'undefined') return;

        var str = control.getString();
        var l1 = str.length;
        var l2 = text.length;

        if(control.subText !== undefined)
        {
            l1 = control.subText;

            if(l2 <= l1)
            {
                control.setString(text);
            }
            else
            {
                control.setString(text.substring(0,l1-2) + "...");
            }
        }
        else if(control.wrapText !== undefined)
        {
            var s1 = control.width;
            var num = text.length;
            var str = "";
            var result = "";
            for(var i = 0 ; i < num ; i++)
            {
                str += text.charAt(i);
                result += text.charAt(i);
                control.setString(str);
                if(text.charAt(i) == " ")
                {
                    if(control.width > s1)
                    {
                        result += "\n";
                        str = "";
                    }
                }
            }
            control.setString(result);
        }
        else
        {
            control.setString(text);
        }
    },

    getControl : function (cName,parent) {
        var p = null;
        var sParent = "";
        if(typeof  parent === 'undefined')
        {
            p = this._layout;
            sParent = "layout";
        }
        else if(typeof parent === 'string')
        {
            p = ccui.Helper.seekWidgetByName(this._layout, parent);
            sParent = parent;
        }
        else
        {
            p = parent;
            sParent = "object";
        }

        if(p == null)
        {
            cc.log("###################### getControl error parent " + cName + "/" + sParent );
            return null;
        }
        var control = ccui.Helper.seekWidgetByName(p,cName);
        if (control == null) control = p.getChildByName(cName);
        if(control == null)
        {
            cc.log("###################### getControl error control " + cName + "/" + sParent );
            return null;
        }
        this.analyzeCustomControl(control);
        control.defaultPosition = control.getPosition();
        control.defaultPos = control.getPosition();
        return control;
    },

    processScaleControl : function (control,direct) {
        if(direct === undefined)
        {
            control.setScale(this._scale);
        }
        else if(direct == 1)
        {
            control.setScaleX(this._scale);
        }
        else
        {
            control.setScaleY(this._scale);
        }
    },

    analyzeCustomControl : function (control) {
        cc.log("Custom Data " + control.customData);
        if(control.customData === undefined)
        {
            if(control.getTag() < 0) // scale theo ty le nho nhat
            {
                this.processScaleControl(control);
            }
            return;
        }

        var s = control.customData;

        if(s.indexOf("scale") > -1) // scale theo ty le nho nhat
        {
            if(s.indexOf("scaleX") > -1)
            {
                this.processScaleControl(control,1);
            }
            else if(s.indexOf("scaleY") > -1)
            {
                this.processScaleControl(control,0);
            }
            else
            {
                this.processScaleControl(control);
            }
        }

        if(s.indexOf("subText") > -1) // set text gioi han string
        {
            control["subText"] = control.getString().length;
        }

        if(s.indexOf("wrapText") > -1) // set text cat strign xuong dong
        {
            control["wrapText"] = control.getString().length;
        }
    },

    setFog: function(bool,alpha){
        if(alpha === undefined) alpha = 200;
        this._layerColor.setVisible(true);
        this._layerColor.defaultAlpha = alpha;
        this._layerColor.runAction(cc.fadeTo(0.25, alpha));
    },

    initFog: function(opacity) {
        if (opacity == null) opacity = 200;

        this._fog = new ccui.Layout();
        this._fog.setContentSize(this._layout.getContentSize());
        this._fog.setBackGroundColor(cc.BLACK);
        this._fog.setBackGroundColorOpacity(opacity);
        this._fog.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
        this._fog.setTouchEnabled(true);
        this._fog.setSwallowTouches(true);
        this.addChild(this._fog, -999);
    },

    showFog: function(time) {
        if (time == null) time = 0.25;

        this._fog.stopAllActions();
        this._fog.setOpacity(0);
        this._fog.runAction(cc.sequence(
            cc.show(),
            cc.fadeIn(time)
        ));
    },

    hideFog: function(time) {
        if (time == null) time = 0.25;

        this._fog.stopAllActions();
        this._fog.setOpacity(255);
        this._fog.runAction(cc.sequence(
            cc.fadeOut(time),
            cc.hide()
        ));
    },

    setShowHideAnimate : function (parent,customScale, enableFog) {
        this._showHideAnimate = true;

        if (!enableFog === undefined) {
            enableFog = true
        }

        if(parent === undefined)
        {
            this._bgShowHideAnimate = this._layout;
        }
        else
        {
            this._bgShowHideAnimate = parent;
        }

        if(customScale === undefined)
        {
            customScale = false;
        }
        if(this._isNeedChangeSize) {
            this._bgShowHideAnimate.setPosition(viewSizeMgr.getPosCenter());
            this._currentScaleBg = viewSizeMgr.getScalePopup(this._isSmall);
        }
        else {
            this._currentScaleBg = customScale?this._scale : 1;
        }

        this._bgShowHideAnimate.setScale(0.75*this._currentScaleBg);
        this._bgShowHideAnimate.setOpacity(0);
        this._bgShowHideAnimate.stopAllActions();
        this._bgShowHideAnimate.runAction(cc.sequence(
            cc.spawn(new cc.EaseBackOut(cc.scaleTo(0.25,this._currentScaleBg)),cc.fadeIn(0.25)),
            cc.callFunc(this.finishAnimate,this)));

        if(this._layerColor && enableFog)
        {
            this._layerColor.setVisible(true);
            this._layerColor.stopAllActions();
            this._layerColor.runAction(cc.fadeTo(0.25,this._layerColor.defaultAlpha));
        }

        this.stopAllActions();
    },

    onClose : function () {
        if (this._listenerFog) {
            cc.eventManager.removeListener(this._listenerFog);
            this._listenerFog = undefined;
        }

        // todo: implement this method for disappear animation
        if(this._layerColor && this._layerColor.isVisible())
            this._layerColor.runAction(cc.fadeTo(0.15,0));

        if(this._fog && this._fog.isVisible())
            this._fog.runAction(cc.fadeTo(0.15,0));

        if(this._showHideAnimate)
        {
            this._bgShowHideAnimate.setScale(this._currentScaleBg);
            this._bgShowHideAnimate.runAction(cc.spawn(cc.scaleTo(0.15,0.75),cc.fadeOut(0.15)));
            this.runAction(cc.sequence(cc.delayTime(0.15),cc.callFunc(this.onCloseDone.bind(this))));
        }
        else
        {
            this.onCloseDone();
        }
    },

    onCloseDone : function () {
        this.removeFromParent();
    },

    setBackEnable : function (enable) {
        this._enableBack = enable;
    },

    getBackEnable : function () {
        return this._enableBack;
    },

    backKeyPress : function () {
        if(!this._enableBack) return;

        this.onBack();
    },

    resetDefaultPosition : function (control) {
        if(control === undefined) return;
        if(control.defaultPosition === undefined) control.defaultPosition = control.getPosition();
        else control.setPosition(control.defaultPosition);
        if(control.defaultPos) control.setPosition(control.defaultPos);
        else control.defaultPos = control.defaultPosition;
    },

    // position pin left or right
    alignToLeft : function (control) {
        if(!gameMgr.isWideScreen()) return;

        let curPos = control.getPosition();
        let frameSize = cc.view.getFrameSize();
        let scale = frameSize.width / Constant.WIDTH;
        let deltaX = (frameSize.width - frameSize.height * 2) / scale;
        control.setPositionX(curPos.x + deltaX);
        control._defaultPos = control.getPosition();
        control.defaultPos = control.getPosition();
    },

    alignToRight : function (control) {
        if(!gameMgr.isWideScreen()) return;

        let curPos = control.getPosition();
        let frameSize = cc.view.getFrameSize();
        let scale = frameSize.width / Constant.WIDTH;
        let deltaX = (frameSize.width - frameSize.height * 2) / scale;
        control.setPositionX(curPos.x - deltaX);
        control._defaultPos = control.getPosition();
    },

    /************ touch event handler *************/
    onTouchEventHandler: function(sender,type){
        switch (type){
            case ccui.Widget.TOUCH_BEGAN:
                this.onButtonTouched(sender,sender.getTag());
                logMgr.crashLog(LogMgr.CRASH.BUTTON, this._layoutPath + ": " + sender.getName());
                break;
            case ccui.Widget.TOUCH_ENDED:
                var delayClick = sender.delayClick;
                if(delayClick > 0){
                    var now = Date.now();
                    if(now - sender.timeLastClick < delayClick) {
                        break;
                    }
                    else {
                        sender.timeLastClick = now;
                    }
                }
                this.onButtonRelease(sender, sender.getTag());
                this.playSoundButton(sender.getTag());
                break;
            case ccui.Widget.TOUCH_CANCELED:
                this.onButtonCanceled(sender, sender.getTag());
                break;
        }
    },
    ////////////////////////////////////////////

    /******* functions need override  *******/
    customizeGUI: function(){
        /*    override meeeeeeeeee  */
    },

    onEnterFinish : function () {

    },

    onButtonRelease: function(button,id){
        /*    override meeeeeeeeee  */
    },

    onButtonTouched: function(button,id){
        /*    override meeeeeeeeee  */
    },

    onButtonCanceled: function(button,id){
        /*    override meeeeeeeeee  */
    },

    onUpdateGUI: function(data){

    },

    initGUI : function () {

    },

    finishAnimate : function () {
    },

    onBack : function () {

    },

    playSoundButton: function(id){
        if (settingMgr.sound)
        {
           jsb.AudioEngine.play2d(lobby_sounds.click, false);
        }
    },

    onKeyPressed: function (keyCode, event) {

    },

    onKeyReleased: function (keyCode, event) {

    },

    onLanguageChanged: function (isoCode) {

    }
});

/*
 * CREATE CONTROL
 */
BaseLayer.createLabelText = function (txt,color, fontSize) {
    if(!fontSize)fontSize = 24;
    var ret = new ccui.Text();
    ret.setAnchorPoint(cc.p(0.5, 0.5));
    ret.setFontName(SceneMgr.FONT_NORMAL);
    ret.setFontSize(fontSize);
    ret.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);
    ret.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_TOP);
    if(txt !== undefined) ret.setString(txt);
    if(color !== undefined) ret.setColor(color);
    return ret;
};

BaseLayer.createEditBox = function (tf,isAdd) {
    // EditBox not support font file
    var ret = new cc.EditBox(tf.getContentSize(), new cc.Scale9Sprite());
    ret.setFontSize(tf.getFontSize());
    ret.setFontColor(tf._color);
    ret.setPlaceHolder(tf.getPlaceHolder());
    ret.setPlaceholderFontSize(tf.getFontSize());
    ret.setPosition(tf.getPosition());
    ret.setAnchorPoint(tf.getAnchorPoint());
    ret.setReturnType(cc.KEYBOARD_RETURNTYPE_DONE);
    tf.setVisible(false);

    if(isAdd) {
        tf.getParent().addChild(ret);
    }
    return ret;
};

