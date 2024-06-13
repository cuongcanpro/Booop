var PaymentUI = {
    actionOK: "OK",
    actionCancel: "Cancel",
    
    UIPaymentSelectPartner: null,
    UITransProcessing: null,
    UIPaymentMessageBox: null,
    UIPaymentInputPhoneNumber: null,
    UIPaymentInputOTP: null,
    // UIPaymentInputUserData: null,
    UIPaymentSelectBank: null,
    
    /**
     * @type {UIPaymentInputGiftCard}
     */
    UIPaymentInputGiftCard: null,

    // latam UI
    UIPaymentInputCreditCard: null,
    UIPaymentInputCreditCardCVV: null,
    UIPaymentInputUserInfo: null,
    UIPaymentSelectCreditCard: null,
    
    UIWebview: null,

    /**
     * Display a UI containing a list of payment method icons for user selection.
     * @param {Array} listChannel list channel code
     * @param {SelectPMChannelCallback} callback function()
     */
    showPaymentChannelSelection: function(listChannel, callback){
        // show UI
        if (!this.UIPaymentSelectPartner) this.UIPaymentSelectPartner = new UIPaymentSelectPartner();
        this.UIPaymentSelectPartner.showGui(PaymentLib.getLocalize(), listChannel, callback)
    },

    /**
     * 
     * @param {array} listBank list bank code
     * @param {SelectBankCallback} callback callback function
     */
    showBankSelection: function(listBank, callback){
        if (!this.UIPaymentSelectBank) this.UIPaymentSelectBank = new UIPaymentSelectBank();
        this.UIPaymentSelectBank.showGui(PaymentLib.getLocalize(), listBank, callback)
    },

    /**
     * Displays a UI for the user to enter gift card information.
     * @param {array} requiredCardInfo - list input mandatory to be entered by the user
     * @param {inputCardCallback} callback 
     */
    showGiftCardForm: function(requiredCardInfo, callback){
        if (!this.UIPaymentInputGiftCard) this.UIPaymentInputGiftCard = new UIPaymentInputGiftCard();
        this.UIPaymentInputGiftCard.showGui(PaymentLib.getLocalize(), requiredCardInfo, callback);
    },

    showInputPhoneNumber: function(defaultPhoneNumber, callback){
        if (!this.UIPaymentInputPhoneNumber) this.UIPaymentInputPhoneNumber = new UIPaymentInputPhoneNumber();
        this.UIPaymentInputPhoneNumber.showGui(defaultPhoneNumber, callback);
    },

    showInputOTP: function(callback){
        if (!this.UIPaymentInputOTP) this.UIPaymentInputOTP = new UIPaymentInputOTP();
        this.UIPaymentInputOTP.showGui(PaymentLib.getLocalize(), callback);
    },

    showInputUserInfo: function(requiredInfo, defaultValue, callback){
        if (!this.UIPaymentInputUserInfo) this.UIPaymentInputUserInfo = new UIPaymentInputUserInfo();
        this.UIPaymentInputUserInfo.showGui(PaymentLib.getLocalize(), requiredInfo, defaultValue, callback);
    },

    showCreditCardSelection: function(listCard, callback){
        if (!this.UIPaymentSelectCreditCard) this.UIPaymentSelectCreditCard = new UIPaymentSelectCreditCard();
        this.UIPaymentSelectCreditCard.showGui(PaymentLib.getLocalize(), listCard, callback);
    },

    showInputCreditCard: function(cardType, callback){
        if (!this.UIPaymentInputCreditCard) this.UIPaymentInputCreditCard = new UIPaymentInputCreditCard();
        this.UIPaymentInputCreditCard.showGui(PaymentLib.getLocalize(), cardType, callback)
    },

    showInputCreditCardCVV: function(cardType, markedCardNo, alterCallback, submitCallback){
        if (!this.UIPaymentInputCreditCardCVV) this.UIPaymentInputCreditCardCVV = new UIPaymentInputCreditCardCVV();
        this.UIPaymentInputCreditCardCVV.showGui(PaymentLib.getLocalize(), cardType, markedCardNo, alterCallback, submitCallback);
    },

    hideGiftCardForm: function(){ if (this.UIPaymentInputGiftCard) this.UIPaymentInputGiftCard.hideGui(); },

    hideInputCreditCard: function(){ if (this.UIPaymentInputCreditCard) this.UIPaymentInputCreditCard.hideGui(); },

    hideInputCreditCardCVV: function(){ if (this.UIPaymentInputCreditCardCVV) this.UIPaymentInputCreditCardCVV.hideGui(); },
    
    //#region resulting function

    openWebView: function(redirect_url, response){
        if (ccui.WebView){
            if (!this.UIWebview) this.UIWebview = new UIWebview()
            this.UIWebview.showGui(PaymentLib.getLocalize(), redirect_url)
        } else PaymentUI.showMessageBox("SUCCESS", "Success, redirect.");
    },

    openZaloPayApp: function(deeplink, response){
        PaymentUI.showMessageBox("SUCCESS", deeplink);
    },

    showSMSInstruction: function(shortCode, SMSBody, response){
        if (!this.UIPaymentMessageBox) this.UIPaymentMessageBox =  new UIPaymentMessageBox();
            this.UIPaymentMessageBox.showGui(PaymentLib.getLocalize(), "Gởi tin nhắn với nội dung: "+SMSBody+" đến "+shortCode);
    },

    /**
     * 
     * @param {string} msgType INFO, SUCCESS, ERROR, WARNING
     * @param {string} msg message
     */
    showMessageBox: function(msgType, msg, callback){
        msg = String(msg) || ""
        if (!this.UIPaymentMessageBox) this.UIPaymentMessageBox =  new UIPaymentMessageBox();
        this.UIPaymentMessageBox.showGui(PaymentLib.getLocalize(), msg, callback);
    },

    showProcessingUI: function(){
        this.UITransProcessing = this.UITransProcessing || new UITransProcessing()
        this.UITransProcessing.showGui(PaymentLib.getLocalize())
    },

    hideProcessingUI: function(){
        this.UITransProcessing = this.UITransProcessing || new UITransProcessing()
        this.UITransProcessing.hideGui()
    }

    //#endregion resulting function

}

var BaseUI = cc.Layer.extend({
    screenConfig: null,
    fog: null,
    _currId: "",

    ctor: function () {
        this._super();

        return true;
    },

    syncAllChild: function (res) {
        this._currId = res;
        var path = "res/";
        this.screenConfig = ccs.load(path + res);
        this._rootNode = this.screenConfig.node;
        //var size = this._rootNode.getContentSize();
        //var designSize = fr.ClientConfig.getInstance().getDesignResolutionSize();
        //if (size.width >= designSize.width && size.height >= designSize.height) {
        //    //xu ly da man hinh
        var visibleSize = cc.director.getVisibleSize();
        this._rootNode.setContentSize(visibleSize);
        ccui.Helper.doLayout(this._rootNode);
        //}

        this._rootNode.setAnchorPoint(cc.p(0.5, 0.5));
        this._rootNode.setPosition(cc.p(this._rootNode.width / 2, this._rootNode.height / 2));
        this.addChild(this._rootNode, 0);

        var allChildren = this._rootNode.getChildren();
        this.syncAllChildHelper(allChildren);
    },

    syncAllChildHelper: function (allChildren) {
        if (allChildren.length == 0) return;
        var nameChild;
        for (var i = 0; i < allChildren.length; i++) {
            nameChild = allChildren[i].getName();
            if (nameChild == undefined) continue;
            var arr = nameChild.split("_");
            if (arr.length > 2) {
                this[nameChild] = allChildren[i];
                continue;
            }
            nameChild = arr[0] + arr[1];
            if (nameChild in this) {
                this[nameChild] = allChildren[i];
                if (arr[0] == "btn") {
                    this[nameChild].setPressedActionEnabled(true);
                    this[nameChild].addTouchEventListener(this.onTouchEvent, this);
                }
                this.syncAllChildHelper(this[nameChild].getChildren());
            }
        }
    },

    doZoomIn:function(node, delay, callback){
        node.stopAllActions();
        node.setScale(0);
        node.setOpacity(0);
        var fadeIn = cc.fadeIn(0.4);
        var zoomIn = cc.scaleTo(0.4, 1, 1);
        var zoomIn_ease = zoomIn.easing(cc.easeBackOut(0.2));
        var _delay;
        if(delay == undefined || delay == null) _delay = cc.delayTime(0);
        else _delay = cc.delayTime(delay);
        var seq;
        var spawn = cc.spawn(zoomIn_ease, fadeIn);
        if(callback == null) seq = cc.sequence(_delay, spawn);
        else seq = cc.sequence(_delay, spawn, callback);
        node.runAction(seq);
    },

    createFog: function (alpha, enableTouch) {
        this.fog = new ccui.Layout();
        this.fog.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
        this.fog.setBackGroundColor(cc.color.BLACK);
        this.fog.setContentSize(cc.size(cc.winSize.width, cc.winSize.height));
        this.fog.setPosition(cc.p(0, 0));
        this.fog.retain();
        if (alpha == null) this.fog.setOpacity(255 / 100 * 50);
        else this.fog.setOpacity(255 / 100 * alpha);
        if (enableTouch == null) this.fog.setTouchEnabled(true);
        else this.fog.setTouchEnabled(enableTouch);
    },

    showDisable: function (alpha, enableTouch) {
        if (this.fog != null && this.fog.parent != null) {
            this.removeChild(this.fog);
            this.fog = null;
        }
        this.createFog(alpha, enableTouch);
        this.addChild(this.fog, -1);
    },

    hideDisable: function () {
        if (this.fog == null) return;
        this.removeChild(this.fog);
        this.fog.release();
        this.fog = null;
    },

    creatEditBox : function(size, normal9SpriteBg){
        var _box = new cc.EditBox(size, normal9SpriteBg);
        _box.setPlaceholderFontColor(cc.color(26, 26, 26));
        _box.setPlaceholderFontSize(40);
        _box.setFontColor(cc.color(26, 26, 26));
        _box.setFontSize(40);
        _box.setMaxLength(100);
        _box.setInputMode(cc.EDITBOX_INPUT_MODE_ANY);
        _box.setReturnType(cc.KEYBOARD_RETURNTYPE_DONE);
        _box.setInputFlag(cc.EDITBOX_INPUT_FLAG_SENSITIVE);
        return _box;
    },

    createMultiEditBox: function(){
        for (var i=0; i<arguments.length; i++){
            var name = arguments[i];
            var editName = "edit"+name;
            if (this[editName]) this[editName].visible = false;
            var imgInput = this["imageInput"+name];
            if (!imgInput) continue;

            var edt = this.creatEditBox(cc.size(imgInput.width, imgInput.height), new cc.Scale9Sprite("sys_popup_bar.png", imgInput.getCapInsets()));
            edt.setAnchorPoint(cc.p(imgInput.anchorX, imgInput.anchorY))
            edt.x = imgInput.x;
            edt.y = imgInput.y;
            edt.setDelegate(this);
            this.imageBgr.addChild(edt);
            this[editName] = edt;
            imgInput.visible = false;
        }
    },

    onTouchEvent:function(sender, type){
        switch (type){
            case ccui.Widget.TOUCH_BEGAN:
                this.onTouchBeganEvent(sender);
                break;
            case ccui.Widget.TOUCH_ENDED:
                this.onTouchEndEvent(sender);
                break;
            case ccui.Widget.TOUCH_CANCELED:
                this.onTouchCancelledEvent(sender);
                break;
            case ccui.Widget.TOUCH_MOVED:
                this.onTouchMovedEvent(sender);
                break;
        }
    },

    onTouchBeganEvent:function(sender){
    },

    onTouchEndEvent:function(sender){
    },

    onTouchCancelledEvent:function(sender){
    },

    onTouchMovedEvent:function(sender){
    },

    registerTapBackFunc: function () {
        //cc.eventManager.addListener({
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function (keycode, event) {
                switch (keycode){
                    case cc.KEY.back:
                    case cc.KEY.backspace:
                        this.onTouchTapBack();
                        break;
                }
            }.bind(this)
        }, this);
    },

    onTouchTapBack: function(){
    },
});

var UIPaymentSelectPartner = BaseUI.extend({
    imageBgr: null,
    labelTitle:null,
    btnClose: null,
    imageNode: null,
    fCallback: null,

    btnWidth: 200,
    btnHeight: 100,
    btnPaddingWidth: 50,
    btnPaddingHeight: 30,

    listPMChannelButton: null,

    ctor:function(){
        this._super();
        this.syncAllChild("pm_global/pmui_selectnetwork.json");
        this.retain();
        this.listPMChannelButton = {};
    },

    showGui:function(localize, listPaymentChannel, callback){
        this._isShowing = true;
        this.showDisable();
        if(this.parent != null) this.parent.removeChild(this);
        var _parent = cc.director.getRunningScene();
        _parent.addChild(this, PaymentLib.CONSTANT.ZORDER_BASE_UI);

        this.fCallback = callback;
        
        this.labelTitle.setString(this.getTitle(localize));
        for (var btnName in this.listPMChannelButton) {
            this.listPMChannelButton[btnName].setVisible(false);
        }

        this.generateListButton(listPaymentChannel);

        this.doZoomIn(this._rootNode, 0);
    },

    generateListButton: function(listPaymentChannel){
        var totalChannel = listPaymentChannel.length;

        var containerRatio = this.imageBgr.width*0.5/(this.imageBgr.height*0.8);
        var totalCol = Math.ceil(Math.sqrt(totalChannel*containerRatio));
        var totalRow = Math.ceil(totalChannel / totalCol);

        for (var index = 0; index < totalChannel; index++) {
            var channelCode = listPaymentChannel[index];
            var btnName = this.getChannelName(channelCode);
            if (!this.listPMChannelButton[btnName]){
                this.listPMChannelButton[btnName] = this.createChannelButton(channelCode)
            }
            this.listPMChannelButton[btnName].setVisible(true);
            this.setBtnPosition(this.listPMChannelButton[btnName], totalChannel, totalCol, totalRow, index)
        }

        var containerWidth = totalCol*(this.btnWidth + this.btnPaddingWidth) - this.btnPaddingWidth;
        if (containerWidth > this.imageBgr.width - 100){
            this.imageNode.setScale((this.imageBgr.width - 100)/containerWidth)
        } else {
            this.imageNode.setScale(1);
        }
    },

    setBtnPosition: function(btn, totalBtn, totalCol, totalRow, btnIndex){
        // btn anchor point (0,0)
        btn.setContentSize(cc.size(this.btnWidth, this.btnHeight));

        var parentWidth = this.imageNode.width;
        var parentHeight = this.imageNode.height;
        var idx = btnIndex;

        var btnRow = Math.floor(idx / totalCol);
        var totalColInRow = (btnRow == (totalRow - 1)) ? (totalBtn - btnRow * totalCol) : totalCol;
        if (totalColInRow > totalCol) totalColInRow = totalCol;
        var btnCol = idx%totalCol;

        var containerWidth =  totalColInRow*(this.btnWidth + this.btnPaddingWidth) - this.btnPaddingWidth;
        var containerHeight= totalRow*(this.btnHeight + this.btnPaddingHeight) - this.btnPaddingHeight;

        var _x = btnCol*(this.btnWidth + this.btnPaddingWidth) - containerWidth/2 + parentWidth/2;
        var _y = containerHeight - btnRow*(this.btnHeight + this.btnPaddingHeight) - this.btnHeight - containerHeight/2 + parentHeight/2;

        btn.setPosition(cc.p(_x, _y));
    },

    createChannelButton: function (channelCode) {
        var btn = new ccui.Button();
        btn.loadTextures("sys_popup_table_02.png", "sys_popup_table_02.png", "sys_popup_table_02.png", ccui.Widget.PLIST_TEXTURE);
        btn.setScale9Enabled(true);
        btn.setContentSize(cc.size(200, 100));

        btn.setPressedActionEnabled(true);
        btn.addTouchEventListener(this.onTouchEvent, this);
        btn.setAnchorPoint(cc.p(0, 0))

        imgName = this.getChannelImage(channelCode);
        
        var img = new ccui.ImageView(imgName, ccui.Widget.PLIST_TEXTURE);

        if (img.height > btn.height*0.8){
            img.setScale(btn.height*0.8 / img.height)
        }
        
        img.setPosition(cc.p(btn.width / 2, btn.height / 2));
        btn.addChild(img);

        btn._pm_global_id = channelCode;

        this.imageNode.addChild(btn);
        return btn;
    },

    getChannelImage: function(channelCode){
        imgName = "pm_channel_"+channelCode+".png";
        if (!cc.spriteFrameCache.getSpriteFrame(imgName)) imgName = "pm_channel_default.png";
        return imgName;
    },

    getChannelName: function(channelCode){
        return "pm_channel_"+channelCode;
    },

    getTitle: function(localize){
        return localize.CHOOSE_CARRIER_TEXT;
    },

    hideGui:function(){
        this._isShowing = false;
        this.hideDisable();
        if(this.parent == null) return;
        this.parent.removeChild(this);
    },

    doResizeBg: function (tbNetwork) {

        if (tbNetwork == null) return;

        var dtBtnClose = cc.p(this.imageBgr.width - this.btnClose.x, this.imageBgr.height - this.btnClose.y);
        var dtLabelTitle = cc.p(-1, this.imageBgr.height - this.labelTitle.y);
        var dtPercentImageNode = cc.p(-1, this.imageNode.y / this.imageBgr.height);

        var infoRowCol = tbNetwork.getNumRowAndColBySumNet();
        var col = infoRowCol.col;
        var row = infoRowCol.row;
        //var btnWidth = 250;
        //var btnHeight = 120;
        var btnWidth = 240;
        var btnHeight = 115;
        //this.imageBgr.setContentSize(cc.size(col * btnWidth  + 100, row * btnHeight  + 100));
        this.imageBgr.height = row * btnHeight  + 100;

        this.labelTitle.y = this.imageBgr.height - dtLabelTitle.y;
        this.labelTitle.setPosition(cc.p(this.imageBgr.width * 0.5, this.imageBgr.height - dtLabelTitle.y));
        this.btnClose.setPosition(cc.p(this.imageBgr.width - dtBtnClose.x, this.imageBgr.height - dtBtnClose.y));
        this.imageNode.setPosition(cc.p(this.imageBgr.width * 0.5, this.imageBgr.height * dtPercentImageNode.y));
    },

    onTouchEndEvent:function(sender) {
        switch(sender){
            case this.btnClose:
                this.hideGui();
                break;
            default:
                var channelCode = sender._pm_global_id || "";
                var btnName = this.getChannelName(channelCode);
                if (this.listPMChannelButton[btnName] == sender){
                    if(this.fCallback) this.fCallback("OK", channelCode);
                }
                break;
        }
    },

});

var UIPaymentSelectBank = UIPaymentSelectPartner.extend({
    getChannelImage: function(channelCode){
        imgName = "bank_1006_"+channelCode+".png";
        if (!cc.spriteFrameCache.getSpriteFrame(imgName)) imgName = "pm_channel_default.png";
        return imgName;
    },

    getChannelName: function(channelCode){
        return "bank_1006_"+channelCode;
    },

    getTitle: function(localize){
        return localize.CHOOSE_BANK_TEXT;
    },
});

var UITransProcessing = BaseUI.extend({
    imageLoad:null,
    imageBgr:null,

    btnClose:null,
    labelInfo:null,

    _mcc_mnc:"",
    _vnd:0,
    action:null,
    _countTime:0,

    ctor:function(){
        this._super();
        this.syncAllChild("pm_global/pmui_transprocess.json");
        this.retain();
        this._enableKeyboardListener = false;
        this.action = cc.rotateBy(1, 360).repeatForever();
        this.action.retain();
    },

    showGui:function(localize){
        this.showDisable();
        if(this.parent != null) this.parent.removeChild(this);
        var _parent = cc.director.getRunningScene();
        //_parent.addChild(this, _parent.getChildren().length);
        _parent.addChild(this, PaymentLib.CONSTANT.ZORDER_BASE_UI);

        this.labelInfo.setString(localize.TRANS_PROCESS_TEXT);

        this.imageLoad.runAction(this.action);

        this.unschedule(this.update);
        this._countTime = 0;
        this.schedule(this.update, 0.2);

        this.doZoomIn(this._rootNode, 0);
    },

    hideGui:function(){
        this.imageLoad.stopAllActions();
        this.hideDisable();
        if(this.parent == null) return;
        this.parent.removeChild(this);
    },

    onTouchEndEvent:function(sender) {
        this._super(sender);
        switch(sender){
            case this.btnClose:
                //this.hideGui();
                break;
        }
    },

    update:function(){
        this._countTime++;
        if(this._countTime * 0.2 >= 30) {
            this.hideGui();
            PaymentUI.showMessageBox('ERROR', PaymentLib.getLocalize().ACTION_FAILED)
        }
    },
});

var UIWebview = BaseUI.extend({

    imageBgr:null,
    btnClose:null,
    view:null,
    Panel1:null,
    imageLoad:null,
    action:null,

    _isShowing: false,

    ctor:function(){
        this._super();
        this.syncAllChild("pm_global/pmui_webview.json");

        this.retain();
        if (cc.sys.platform != cc.sys.WIN32) {
            this.view = new ccui.WebView();
            this.view.setContentSize(cc.size(this.Panel1.width, this.Panel1.height));
            this.view.setScalesPageToFit(true);
            this.view.setPosition(cc.p(this.Panel1.x, this.Panel1.y));
            this.view.setOnDidFinishLoading(this.onLoaded.bind(this));
            this.view.visible = false;
            this.imageBgr.addChild(this.view);

            try {
                this.view.setEventListener(ccui.WebView.EventType.LOADING, function (event, url) {

                    if ((url.indexOf("intent://") >= 0)
                        || (url.indexOf("amedigital://") >= 0)
                        || (url.indexOf("hsbcpaymepay://") >= 0)
                        || (url.indexOf("gojek://") >= 0)
                        || (url.indexOf("shopeeid://") >= 0)
                        || (url.indexOf("grab://") >= 0)
                        || (url.indexOf("shopeemy://") >= 0)
                        || (url.indexOf("sms:32083") >= 0)
                        || (url.indexOf("picpay://") >= 0)
                        || (url.indexOf("open.dolfinwallet://") >= 0)
                        || (url.indexOf("momo://") >= 0)
                        || (url.indexOf("tez://") >= 0)
                        || (url.indexOf("phonepe://") >= 0)
                        || (url.indexOf("paytmmp://") >= 0)
                        || (url.indexOf("bhim://") >= 0)
                        || (url.indexOf("upi://") >= 0) ){

                        if (url.indexOf("intent://kbzpay") >= 0){
                            url = url.replace("intent://", "kbzpay://");
                        }

                        if (pm.ENABLE_LOG) cc.log("WebView|Hide because load intent");
                        this.hideGui();
                        //
                        cc.sys.openURL(url);
                    }
                }.bind(this));
            } catch (error) {
                if (pm.ENABLE_LOG) cc.log("WebView|Catch error Listener");
            }
        }
        this.action = cc.rotateBy(1, 360).repeatForever();
        this.action.retain();
    },

    onExit: function () {
        this._super();
        //if (this._isShowing){
        //    this.hideGui();
        //}
    },

    showGui:function(localize, url){
        cc.sys.openURL(url);
        return;
    },

    hideGui:function(){
        this._isShowing = false;
        this.imageLoad.stopAllActions();
        this.hideWebView();
        this.hideDisable();
        if(this.parent == null) return;
        this.parent.removeChild(this);
    },

    hideWebView:function(){
        if(this.view) this.view.visible = false;
    },

    onTouchEndEvent:function(sender) {
        this._super(sender);
        switch(sender){
            case this.btnClose:
                this.hideGui();
                break;
        }
    },

    onLoaded:function(sender, url){
        if(!this._isShowing) return;
        this.view.visible = true;
    },

});

var UIPaymentMessageBox = BaseUI.extend({
    imageBgr:null,
    btnOk:null,
    labelInfo:null,
    labelBtnOk:null,
    fCallback: null,

    ctor:function(){
        this._super();
        this.syncAllChild("pm_global/pmui_messagebox.json");
        this.retain();
        return true;
    },

    showGui:function(localize, message, callback){
        this.showDisable();
        if(this.parent != null) this.parent.removeChild(this);
        var _parent = cc.director.getRunningScene();
        //_parent.addChild(this, _parent.getChildren().length);
        _parent.addChild(this, PaymentLib.CONSTANT.ZORDER_BASE_UI);

        this.labelInfo.setString(message);
        this.labelBtnOk.setString(localize.TITLE_BTN_OK);
        this.fCallback = callback;

        this.doZoomIn(this._rootNode, 0);
    },

    hideGui:function(){
        this.hideDisable();
        if(this.parent == null) return;
        this.parent.removeChild(this);
    },

    onTouchEndEvent:function(sender) {
        switch(sender){
            case this.btnOk:
                this.hideGui();
                if (this.fCallback) this.fCallback();
                break;
        }
    },
});

var UIPaymentInputPhoneNumber = BaseUI.extend({
    imageBgr:null,
    btnOk:null,
    btnCancel:null,

    labelTitle:null,
    imageInput:null,
    labelBtnOk:null,
    labelBtnCancel:null,
    fCallback:null,
    objLocalize:null,

    fCallback: null,

    ctor:function(){
        this._super();
        this.syncAllChild("pm_global/pmui_inputtel.json");
        this.retain();
        //
        this.imageInput.visible = false;
        this.fieldCode = this.creatEditBox(cc.size(469, 64), new cc.Scale9Sprite("sys_popup_bar.png"));
        this.fieldCode.x = this.imageInput.x;
        this.fieldCode.y = this.imageInput.y;

        this.fieldCode.setDelegate(this);
        this.fieldCode.setInputMode(cc.EDITBOX_INPUT_MODE_PHONENUMBER);
        this.imageBgr.addChild(this.fieldCode);
        return true;
    },

    showGui:function(defaultPhoneNumber, callback){
        this.showDisable();
        if(this.parent != null) this.parent.removeChild(this);
        var _parent = cc.director.getRunningScene();
        //_parent.addChild(this, _parent.getChildren().length);
        _parent.addChild(this, PaymentLib.CONSTANT.ZORDER_BASE_UI);

        this.fCallback = callback;

        this.objLocalize = PaymentLib.getLocalize();
        this.labelTitle.setString(this.objLocalize.TITLE_INPUT_PHONENUMBER);
        this.labelBtnCancel.setString(this.objLocalize.TITLE_BTN_CANCEL);
        this.labelBtnOk.setString(this.objLocalize.TITLE_BTN_OK);
        this.fieldCode.setPlaceHolder(this.objLocalize.TAP_TO_INPUT);

        this.fieldCode.setString(defaultPhoneNumber || "");

        this.doZoomIn(this._rootNode, 0);
    },

    hideGui:function(){
        this.hideDisable();
        if(this.parent == null) return;
        this.parent.removeChild(this);
    },

    onTouchEndEvent:function(sender) {
        switch(sender){
            case this.btnCancel:
                this.hideGui();
                break;
            case this.btnOk:
                if(this.fieldCode.getString() == "") {
                    PaymentUI.showMessageBox("warn", this.objLocalize.INPUT_WARNING);
                    return;
                }
                this.hideGui();

                if(this.fCallback != null) this.fCallback("OK", this.fieldCode.getString());
                break;
        }
    },
});

var UIPaymentInputOTP = BaseUI.extend({
    imageBgr:null,
    labelTitle:null,
    imageInput:null,

    btnOk:null,
    labelBtnOk:null,
    btnCancel:null,
    labelBtnCancel:null,

    labelErrorNotify: null,

    objLocalize:null,

    fCallback: null,

    ctor:function(){
        this._super();
        this.syncAllChild("pm_global/pmui_inputotp.json");
        this.retain();
        //
        this.imageInput.visible = false;
        this.fieldCode = this.creatEditBox(cc.size(469, 64), new cc.Scale9Sprite("sys_popup_bar.png"));
        this.fieldCode.x = this.imageInput.x;
        this.fieldCode.y = this.imageInput.y;

        this.fieldCode.setDelegate(this);
        //this.fieldCode.setInputMode(cc.EDITBOX_INPUT_MODE_PHONENUMBER);
        this.imageBgr.addChild(this.fieldCode);
        return true;
    },

    showGui:function(localize, callback){
        this.showDisable();
        if(this.parent != null) this.parent.removeChild(this);
        var _parent = cc.director.getRunningScene();
        //_parent.addChild(this, _parent.getChildren().length);
        _parent.addChild(this, PaymentLib.CONSTANT.ZORDER_BASE_UI);

        this.fCallback = callback;

        this.objLocalize = localize;
        this.labelTitle.setString(this.objLocalize.TITLE_INPUT_OTP);
        this.fieldCode.setPlaceHolder(this.objLocalize.TAP_TO_INPUT);
        this.labelBtnOk.setString(this.objLocalize.CONFIRM_TEXT);
        this.labelBtnCancel.setString(this.objLocalize.TITLE_BTN_CANCEL);

        this.fieldCode.setString("");

        if (this.labelErrorNotify) this.labelErrorNotify.setString("");

        this.doZoomIn(this._rootNode, 0);
    },

    hideGui:function(){
        this.hideDisable();
        if(this.parent == null) return;
        this.parent.removeChild(this);
    },

    setError: function () {
        if (this.labelErrorNotify == null) return;
        if (this.objLocalize) this.labelErrorNotify.setString(this.objLocalize.NOTIFY_RE_ENTER_OTP);
        this.fxNotice();
    },

    noticeAction: null,
    fxNotice: function () {
        if (this.noticeAction == null){
            var rootPos = this.imageBgr.getPosition();
            this.noticeAction = cc.sequence(cc.moveTo(0.05, rootPos.x + 20, rootPos.y), cc.moveTo(0.05, rootPos.x - 20, rootPos.y)).repeat(3);
            this.noticeAction.retain();
        }
        this.imageBgr.stopAllActions();
        this.imageBgr.runAction(this.noticeAction);
    },

    onTouchEndEvent:function(sender) {
        switch(sender){
            case this.btnCancel:
                this.hideGui();
                break;
            case this.btnOk:
                if(this.fieldCode.getString() == "") {
                    PaymentUI.showMessageBox("warn", this.objLocalize.INPUT_WARNING);
                    return;
                }
                this.hideGui();
                if (this.fCallback) this.fCallback("OK", this.fieldCode.getString());
                break;
        }
    },
});

/**
 * @typedef {UIPaymentInputGiftCard}
 */
var UIPaymentInputGiftCard = BaseUI.extend({
    imageBgr:null,
    labelTitle:null,

    imageCardNoInput:null,
    imagePinCodeInput: null,
    inputCardNo: null,
    inputPinCode: null,
    labelCardNo: null,
    labelPinCode: null,

    deafaultLabelCardNo_Y: null,
    isPinCodeVisible: true,

    btnOk:null,
    labelBtnOk:null,
    btnCancel:null,
    labelBtnCancel:null,

    objLocalize:null,

    fCallback: null,

    ctor:function(){
        this._super();
        this.syncAllChild("pm_global/pmui_inputgiftcard.json");
        this.retain();

        this.imageCardNoInput.visible = false;
        this.imagePinCodeInput.visible = false;

        this.inputCardNo = this.creatEditBox(cc.size(469, 64), new cc.Scale9Sprite("sys_popup_bar.png"));
        this.inputCardNo.x = this.imageCardNoInput.x;
        this.inputCardNo.y = this.imageCardNoInput.y;
        this.inputCardNo.setDelegate(this);
        this.imageBgr.addChild(this.inputCardNo);
        this.inputCardNo.setAnchorPoint(cc.p(1, 0.5));
        this.deafaultLabelCardNo_Y = this.labelCardNo.y;

        this.inputPinCode = this.creatEditBox(cc.size(469, 64), new cc.Scale9Sprite("sys_popup_bar.png"));
        this.inputPinCode.setPosition(this.imagePinCodeInput.x, this.imagePinCodeInput.y);
        this.inputPinCode.setDelegate(this);
        this.inputPinCode.setAnchorPoint(cc.p(1, 0.5));
        this.imageBgr.addChild(this.inputPinCode);

        return true;
    },

    showGui:function(localize, listCardFields, callback){
        this.showDisable();
        if(this.parent != null) this.parent.removeChild(this);
        var _parent = cc.director.getRunningScene();
        _parent.addChild(this, PaymentLib.CONSTANT.ZORDER_BASE_UI);

        this.fCallback = callback;
        this.objLocalize = localize;

        this.labelTitle.setString(this.objLocalize.TITLE_INPUT_GIFT_CARD);
        this.inputCardNo.setPlaceHolder(this.objLocalize.TAP_TO_INPUT);
        this.inputPinCode.setPlaceHolder(this.objLocalize.TAP_TO_INPUT);
        this.labelBtnOk.setString(this.objLocalize.CONFIRM_TEXT);
        this.labelBtnCancel.setString(this.objLocalize.TITLE_BTN_CANCEL);

        this.inputCardNo.setString("");
        this.inputPinCode.setString("");

        this.labelCardNo.setString(this.objLocalize.LABEL_CARD_NO);
        this.labelPinCode.setString(this.objLocalize.LABEL_PIN_CODE || "");

        this.isPinCodeVisible = listCardFields.length > 1;
        
        this.updateInputPosition();
        
        this.doZoomIn(this._rootNode, 0);
    },

    updateInputPosition: function(){
        if (this.isPinCodeVisible){
            this.inputCardNo.y = this.imageCardNoInput.y;
            this.labelCardNo.y = this.deafaultLabelCardNo_Y;
        } else {
            this.inputCardNo.y = (this.imageCardNoInput.y + this.imagePinCodeInput.y)/2;
            this.labelCardNo.y = (this.deafaultLabelCardNo_Y + this.labelPinCode.y)/2;
        }
        this.inputPinCode.visible = this.isPinCodeVisible;
        this.labelPinCode.visible = this.isPinCodeVisible;
    },

    hideGui:function(){
        this.hideDisable();
        if(this.parent == null) return;
        this.parent.removeChild(this);
    },

    setError: function () {
        if (this.labelErrorNotify == null) return;
        if (this.objLocalize) this.labelErrorNotify.setString(this.objLocalize.NOTIFY_RE_ENTER_OTP);
        this.fxNotice();
    },

    noticeAction: null,
    fxNotice: function () {
        if (this.noticeAction == null){
            var rootPos = this.imageBgr.getPosition();
            this.noticeAction = cc.sequence(cc.moveTo(0.05, rootPos.x + 20, rootPos.y), cc.moveTo(0.05, rootPos.x - 20, rootPos.y)).repeat(3);
            this.noticeAction.retain();
        }
        this.imageBgr.stopAllActions();
        this.imageBgr.runAction(this.noticeAction);
    },

    onTouchEndEvent:function(sender) {
        switch(sender){
            case this.btnCancel:
                this.hideGui();
                break;
            case this.btnOk:
                var cardData = {card_no: this.inputCardNo.getString(), pin_code: this.inputPinCode.getString()};
                if(cardData.card_no == "" || (this.isPinCodeVisible && cardData.pin_code == "")) {
                    PaymentUI.showMessageBox("warn", this.objLocalize.INPUT_WARNING);
                    return;
                }
                // this.hideGui();
                if (this.fCallback) this.fCallback("OK", cardData);
                break;
        }
    },
});

var UIPaymentSelectCreditCard = UIPaymentSelectPartner.extend({
    getChannelImage: function(channelCode){
        imgName = "latam_cc_"+channelCode+".png";
        if (!cc.spriteFrameCache.getSpriteFrame(imgName)) imgName = "pm_channel_default.png";
        return imgName;
    },

    getChannelName: function(channelCode){
        return "latam_cc_"+channelCode;
    },

    getTitle: function(localize){
        return localize.CHOOSE_CREDITCARD_TEXT;
    },
});

var UIPaymentInputCreditCard = BaseUI.extend({
    imageBgr:null,
    btnOk:null,
    btnCancel:null,

    labelTitle:null,

    imageInputCardNo: null,
    imageInputName: null,
    imageInputCardMonth: null,
    imageInputCardYear: null,
    imageInputCardCVV: null,

    editName: null,
    labelName:null,
    editCardNo:null,
    labelCardNo:null,
    editCardMonth:null,
    labelCardDate:null,
    editCardYear:null,
    labelCardCVV: null,
    editCardCVV:null,

    imageNetwork:null,

    objLocalize:null,

    /**
     * @type {inputCreditCardCallback}
     */
    fCallback:null,

    ctor:function(){
        this._super();
        this.syncAllChild("pm_global/pmui_inputcardinfo.json");
        this.retain();

        this.createMultiEditBox("Name", "CardNo", "CardMonth", "CardYear", "CardCVV");

        return true;
    },

    getCreditCardImage: function(cardType){
        imgName = "latam_cc_"+cardType+".png";
        if (!cc.spriteFrameCache.getSpriteFrame(imgName)) imgName = "pm_channel_default.png";
        return imgName;
    },

    showGui:function(localize, cardType, callback){
        this.showDisable();
        if(this.parent != null) this.parent.removeChild(this);
        var _parent = cc.director.getRunningScene();
        _parent.addChild(this, PaymentLib.CONSTANT.ZORDER_BASE_UI);

        this.objLocalize = localize;

        this.labelTitle.setString(localize.TITLE_INPUT_CARD_INFO);
        this.labelName.setString(localize.LABEL_CREDITCARD_NAME);
        this.labelCardNo.setString(localize.LABEL_CREDITCARD_NUMBER);
        this.labelCardDate.setString(localize.LABEL_CREDITCARD_DATE);

        this.editName.setString('');
        this.editCardNo.setString('');
        this.editCardMonth.setString('');
        this.editCardYear.setString('');
        this.editCardCVV.setString('');

        // if (pmLatam.showTestingCardData){
        //     this.editName.setString('ABC');
        //     this.editCardNo.setString('4111111111111111');
        //     this.editCardMonth.setString('11');
        //     this.editCardYear.setString('2023');
        //     this.editCardCVV.setString('123');
        // }

        // this.imageNetwork.loadTexture(this.getCreditCardImage(cardType), ccui.Widget.PLIST_TEXTURE)

        if (!this.imageNetwork.imageContent){
            this.imageNetwork.imageContent = new ccui.ImageView(this.getCreditCardImage(cardType), ccui.Widget.PLIST_TEXTURE);
            this.imageNetwork.imageContent.setPosition(cc.p(this.imageNetwork.width / 2, this.imageNetwork.height / 2));
            this.imageNetwork.addChild(this.imageNetwork.imageContent);
        } else {
            this.imageNetwork.imageContent.loadTexture(this.getCreditCardImage(cardType), ccui.Widget.PLIST_TEXTURE);
        }

        //TODO localize

        this.fCallback = callback;
        this.doZoomIn(this._rootNode, 0);
    },

    hideGui:function(){
        this.hideDisable();
        if(this.parent == null) return;
        this.parent.removeChild(this);
    },

    onTouchEndEvent:function(sender) {
        switch(sender){
            case this.btnCancel:
                this.hideGui();
                break;
            case this.btnOk:
                var cardName = this.editName.getString();
                var cardNo = this.editCardNo.getString();
                var cardMonth = this.editCardMonth.getString();
                var cardYear = this.editCardYear.getString();
                var cardCVV = this.editCardCVV.getString();

                if( cardName == "" || cardNo == "" || cardMonth == "" || cardYear == "" || cardCVV == "") {
                    PaymentUI.showMessageBox("Error", this.objLocalize.INPUT_WARNING);
                    return;
                } else {
                    var cardInfo = {
                        card_number: cardNo,
                        card_name: cardName,
                        card_due_date: cardMonth + "/" + cardYear,
                        card_cvv: cardCVV,
                    };
                    // this.hideGui();
                    if(this.fCallback != null) this.fCallback("OK", cardInfo);
                    return;
                }
                break;
        }
    },

});

var UIPaymentInputCreditCardCVV = BaseUI.extend({
    imageBgr:null,
    btnOk:null,
    btnAlter:null,
    btnClose: null,

    labelTitle:null,
    labelCardNo:null,
    labelMaskedCardNo: null,
    imageInputCardCVV: null,
    editCardCVV:null,
    
    imageNetwork:null,

    objLocalize:null,
    fCallbackAlter:null,
    fCallbackSubmit: null,

    ctor:function(){
        this._super();
        this.syncAllChild("pm_global/pmui_inputcardcvv.json");
        this.retain();

        this.createMultiEditBox('CardCVV');

        return true;
    },



    showGui:function(localize, cardType, markedCardNo, alterCallback, submitCallback){
        this.showDisable();
        if(this.parent != null) this.parent.removeChild(this);
        var _parent = cc.director.getRunningScene();
        _parent.addChild(this, PaymentLib.CONSTANT.ZORDER_BASE_UI);

       this.objLocalize = localize;

        this.labelTitle.setString(localize.TITLE_INPUT_CARD_INFO);
        this.labelCardNo.setString(localize.LABEL_CREDITCARD_NUMBER);
        this.labelMaskedCardNo.setString(markedCardNo);

        this.editCardCVV.setString('');
        this.editCardCVV.setPlaceHolder('')

        // this.imageNetwork.loadTexture(this.getCreditCardImage(cardType), ccui.Widget.PLIST_TEXTURE)
        if (!this.imageNetwork.imageContent){
            this.imageNetwork.imageContent = new ccui.ImageView(this.getCreditCardImage(cardType), ccui.Widget.PLIST_TEXTURE);
            this.imageNetwork.imageContent.setPosition(cc.p(this.imageNetwork.width / 2, this.imageNetwork.height / 2));
            this.imageNetwork.addChild(this.imageNetwork.imageContent);
        } else {
            this.imageNetwork.imageContent.loadTexture(this.getCreditCardImage(cardType), ccui.Widget.PLIST_TEXTURE);
        }

        this.fCallbackAlter = alterCallback;
        this.fCallbackSubmit = submitCallback;
        this.doZoomIn(this._rootNode, 0);
    },

    hideGui:function(){
        this.hideDisable();
        if(this.parent == null) return;
        this.parent.removeChild(this);
    },

    getCreditCardImage: function(cardType){
        imgName = "latam_cc_"+cardType+".png";
        if (!cc.spriteFrameCache.getSpriteFrame(imgName)) imgName = "pm_channel_default.png";
        return imgName;
    },

    onTouchEndEvent:function(sender) {
        switch(sender){
            case this.btnClose:
                this.hideGui();
                break;
            case this.btnAlter:
                this.hideGui();
                if (typeof this.fCallbackAlter == 'function') this.fCallbackAlter("OK")
                break;
            case this.btnOk:
                var cardCVV = this.editCardCVV.getString();
                if( cardCVV == "") {
                    PaymentUI.showMessageBox('ERROR', this.objLocalize.INPUT_WARNING);
                    return;
                } else {
                    this.hideGui();
                    if(typeof this.fCallbackSubmit == 'function') this.fCallbackSubmit("OK", cardCVV);
                    return;
                }
                break;
        }
    },
});

var UIPaymentInputUserInfo = BaseUI.extend({

    imageBgr:null,
    btnOk:null,
    btnCancel:null,

    labelTitle:null,

    label0: null,
    edit0: null,
    label1: null,
    edit1: null,
    label2:null,
    edit2: null,
    label3: null,
    edit3: null,

    imageInput0: null,
    imageInput1: null,
    imageInput2:null,
    imageInput3:null,

    objLocalize:null,
    fCallback:null,

    fieldLabel: {
        name: "LABEL_USER_NAME", 
        email: "LABEL_USER_EMAIL", 
        phone_number: "LABEL_USER_PHONE_NUMBER", 
        document: "LABEL_USER_DOCUMENT"
    },

    fieldTestData:{
        name: "Ana Santos Araujo", 
        email: "dangkhoanguyentnbr@gmail.com", 
        phone_number: "06536012984", 
        document: "85351346893"
    },

    listFields: null,

    ctor:function(){
        this._super();
        this.syncAllChild("pm_global/pmui_inputuserinfo.json");
        this.createMultiEditBox(0, 1, 2, 3)
        this.retain();
        return true;
    },

    showGui:function(localize, requiredInfo, defaultValue, callback){
        this.listFields = [];
        defaultValue = this.fieldTestData;
        this.showDisable();
        if(this.parent != null) this.parent.removeChild(this);
        var _parent = cc.director.getRunningScene();
        _parent.addChild(this, PaymentLib.CONSTANT.ZORDER_BASE_UI);

        this.objLocalize = localize;

        if (!defaultValue){
            defaultValue = {};
            Object.keys(this.fieldLabel).forEach(function(v){defaultValue[v]=''})
        };
        for (var i = 0; i < requiredInfo.length; i++){
            if (this.fieldLabel[requiredInfo[i]]){
                this.listFields.push(requiredInfo[i]);
            }
        }
        for (var i=0, n=this.listFields.length; i<4; i++){
            if (i<n){
                this['label'+i].setVisible(true);
                this['edit'+i].setVisible(true);
                this['label'+i].setString(localize[this.fieldLabel[this.listFields[i]]])
                if (defaultValue[this.listFields[i]]) this['edit'+i].setString(defaultValue[this.listFields[i]]);
                else this['edit'+i].setString('');

                this['edit'+i].setPlaceHolder('');
            } else {
                this['label'+i].setVisible(false);
                this['edit'+i].setVisible(false);
            }
        }

        this.fCallback = callback;
        this.doZoomIn(this._rootNode, 0);
    },

    hideGui:function(){
        this.hideDisable();
        if(this.parent == null) return;
        this.parent.removeChild(this);
    },

    onTouchEndEvent:function(sender) {
        switch(sender){
            case this.btnCancel:
                this.hideGui();
                break;
            case this.btnOk:
                var result = {};
                for (var i=0, n=this.listFields.length; i<n; i++){
                    result[this.listFields[i]] = this['edit'+i].getString();
                    if( result[this.listFields[i]] == "") {
                        pmLatam.payment.showMessageBox(pmLatam.currLanguage, pmLatam.payment.getLocalize(pmLatam.currLanguage).INPUT_WARNING);
                        return;
                    }
                }
                this.hideGui();
                // cache or not
                if(this.fCallback != null) this.fCallback("OK",result);
                return;

                break;
        }
    },
})


