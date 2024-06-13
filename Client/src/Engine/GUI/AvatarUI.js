/**
 * Created by TrungTB on 10-May-19.
 */
var AvatarUI = cc.Node.extend({

    ctor: function (defaultImg, maskAvatar, isUseShader = false) {
        defaultImg = defaultImg || "res/common/defaultAvatar.png";
        maskAvatar = maskAvatar || "res/common/maskAvatar.png";

        this._super();
        this._userInfo = {};
        this._imgDefault = defaultImg;

        this.image = new fr.Avatar(defaultImg, isUseShader);
        if (isUseShader){
            this.addChild(this.image);
        }else{
            this.clipping = new cc.ClippingNode();
            this.clipping.setAlphaThreshold(0.5);
            this.clipping.setCascadeOpacityEnabled(true)
            this.addChild(this.clipping);
            this.clipping.addChild(this.image);
        }

        this.setAnchorPoint(0.5, 0.5);
        this.setCascadeOpacityEnabled(true);
        this.setMaskSprite(maskAvatar);
        //this.setMaskCircle(50);
        // this.badge = new AvatarPlayer(this);
    },

    // init for use shader
    getShaderAvatarSize: function (){
        let shaderAva = this.image.getShaderAvatar();
        if (shaderAva) return shaderAva.getContentSize();
        return null;
    },

    //set avatar image custom, default
    setImagePath: function (path) {
        var file = jsb.fileUtils.getWritablePath() + path;
        if(jsb.fileUtils.isFileExist(file) && jsb.fileUtils.getFileSize(file) > 0 && imageValidator.isImage(jsb.fileUtils.getDataFromFile(file))){
            this.image.setImage(file);
        }
        else{
            this.image.setImage(this._imgDefault);
        }
    },

    setImagePath2: function (path) {
        var file = jsb.fileUtils.fullPathForFilename(path);
        if(jsb.fileUtils.isFileExist(file) && jsb.fileUtils.getFileSize(file) > 0 && imageValidator.isImage(jsb.fileUtils.getDataFromFile(file))){
            this.image.setImage(file);
        }
        else{
            this.image.setImage(this._imgDefault);
        }
    },

    //mask clipping avatar from image
    setMaskSprite: function(maskAvatar){
        if(maskAvatar && maskAvatar != ""){
            var stencil = new cc.Sprite(maskAvatar);
            this.clipping.setStencil(stencil);
            this.setContentSize(stencil.getContentSize());
            this.clipping.setPosition(this.width / 2, this.height / 2);
        }
    },

    setMaskDisableAvatar: function () {
        if (this.getChildByName("maskDisabled")) return;
        let maskDisabled = new cc.Sprite("Board/CommonInGame/maskAvatar.png")
        maskDisabled.setOpacity(100)
        maskDisabled.setPosition(this.width / 2, this.height / 2)
        maskDisabled.setName("maskDisabled")
        this.addChild(maskDisabled)
    },

    setMaskEnableAvatar: function () {
        this.removeChildByName("maskDisabled", true)
    },

    //mask clipping avatar from size
    setMaskCircle: function(size){
        if(size){
            var stencil = new cc.DrawNode();
            stencil.drawDot(cc.p(0, 0), size);
            this.clipping.setStencil(stencil);
        }
    },

    //set scale avatar with width of background avatar
    setScaleWidth: function(widthFrame){
        var scale = widthFrame / this.getImageSize().width;
        this.setScale(scale);
    },

    getImageSize: function(){
        return this.clipping.getStencil().getContentSize();
    },

    asyncExecuteWithUrl: function(path, url, sendLog){
        this.image.updateAvatar(path, url, sendLog);
    },

    loadAvatarImage: function(url){
        this.image.updateAvatar('', url, undefined);
    },

    setInfoAvatar: function(info){
        this._userInfo = info;
    },

    loadCacheAvatar:function (key) {
        var PATH_AVATAR = Config.PATH_AVATAR;
        var path = jsb.fileUtils.getWritablePath() + PATH_AVATAR;
        this.image.loadCacheAvatar(path + key);
    }
});

var AvatarPlayer = AvatarUI.extend({
    ctor: function (defaultImg, maskAvatar, bgAvatar, isInBoard = false) {
        this._super(defaultImg, maskAvatar);
        this.isInBoard = isInBoard;
        this.isFlipInterface = false;

        this.pEffect = cc.Node.create();
        this.pEffect.setAnchorPoint(0.5, 0.5);
        this.pEffect.setContentSize(this.getContentSize());
        this.addChild(this.pEffect);

        this.vipNode = null;
        this.badgeNode = null;
        this.itemNode = null;
        this.frameNode = null;

        this.showFrameID = -1;
        this.showVipType = -1;
        this.showBadgeID = -1;

        this.bgAvatarDefault = null;
        this.setBgAvatarDefault((bgAvatar && bgAvatar != "") ? bgAvatar : null);
    },

    setInfoAvatar: function(info){
        if(Config.ENABLE_CHEAT) cc.log("avatar player", JSON.stringify(info));
        this._super(info);
        this.updateInterface();
    },

    setBgAvatarDefault: function (bgAvatarDefault) {
        this.bgAvatarDefault = bgAvatarDefault;
        if(bgAvatarDefault){
            this.pEffect.retain();
            this.pEffect.removeFromParent();
            this.pEffect.setPosition(bgAvatarDefault.width / 2, bgAvatarDefault.height / 2);
            bgAvatarDefault.addChild(this.pEffect, AvatarPlayer.ZORDER_EFFECT);
        }
    },

    //function for interface avatar
    getFlipInterface: function(){
        return this.isFlipInterface;
    },

    setFlipInterface: function(isFlip){
        this.isFlipInterface = isFlip;
    },

    checkHasChangeInterface: function () {
        var info = this._userInfo;
        if(((info.usingAvatarID === undefined && this.showFrameID !== -1) || info.usingAvatarID != this.showFrameID)
            || ((info.typeVip === undefined && this.showVipType !== -1) || info.typeVip != this.showVipType)
            || (info.isShowVip !== this.isShowVip)){
            return true;
        }
        return false;
    },

    clearInterface: function(){
        this.pEffect.removeAllChildren();
        if(this.vipNode) {
            this.vipNode.removeFromParent();
            this.vipNode = undefined;
        }
        if(this.badgeNode) {
            this.badgeNode.removeFromParent();
            this.badgeNode = undefined;
        }
        if(this.frameNode) {
            this.frameNode.removeFromParent();
            this.frameNode = undefined;
        }
        if(this.itemNode) {
            this.itemNode.removeFromParent();
            this.itemNode = undefined;
        }
    },

    updateInterface: function(){
        if(this.bgAvatarDefault ==  null){
            this.setBgAvatarDefault(this.getParent());
        }

        //check change frame and vip
        if(this.checkHasChangeInterface()){
            this.pEffect.removeAllChildren();

            //frame
            this.setFrameInterface();
            //item
            this.setItemInterface();
        }
    },

    setItemInterface: function(){

    },

    setFrameInterface: function(idFrame){

    },

    //#other
    effectVip: function(vip) {
        //TODO: Effect VIP
    },
    //#other
    effectBadge: function() {
        if(this.badgeNode == null)return;
    },
    //#other
    effectItem: function() {
        if(this.itemNode == null)return;
    },
    //#other
    effectFrame: function() {
        if(this.frameNode == null)return;
    },

    /**
     * With angle of clock, pos from center of avatar
     */
    getPosInterface: function(angle) {
        var size = this.getImageSize();
        var x = size.width / 2, y = size.height / 2;
        if(angle != undefined){
            var anglePI = (angle / 180) * Math.PI;
            x = x + x * Math.sin(anglePI) * (this.isFlipInterface ? -1 : 1);
            y = y + y * Math.cos(anglePI);
        }
        return this.bgAvatarDefault.convertToNodeSpace(this.convertToWorldSpace(cc.p(x, y)));
    },
});
//1 zOrder default de co the chen res, effect vao giua item hien thi.
AvatarPlayer.DEFAULT_ZORDER_AVATAR= 1;
AvatarPlayer.DEFAULT_ZORDER_ITEM = 20;
AvatarPlayer.ZORDER_EFFECT = 50;

AvatarPlayer.VIP_POSITION_ANGLE = -45;
AvatarPlayer.BADGE_POSITION_ANGLE = 135;
AvatarPlayer.DEFAULT_FRAME_SIZE = 225;
AvatarPlayer.REAL_FRAME_SIZE = 160;

var ImageValidator = cc.Class.extend({
    isImage: function (data) {
        return this.isPNG(data) || this.isJPG(data);
    },

    isPNG: function (data) {
        var result = this.checkValidSignature(data, ImageValidator.PNG_SIGNATURE);
        if(result){
            // cc.log("image format is PNG");
        }

        return result;
    },

    isJPG: function (data) {
        var result = this.checkValidSignature(data, ImageValidator.JPG_SIGNATURE);
        if(result){
            // cc.log("image format is JPG");
        }
        return result;
    },



    checkValidSignature: function (data, signature) {
        if(data.length < signature.length) return false;
        for(var i = 0; i < signature.length; i ++){
            if(data[i] !== signature[i]){
                return false;
            }
        }

        return true
    }
})

ImageValidator.PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
ImageValidator.JPG_SIGNATURE = [0xFF, 0xD8];



ImageValidator._instance = null;
ImageValidator.getInstance = function () {
    if(!ImageValidator._instance){
        ImageValidator._instance = new ImageValidator();
    }

    return ImageValidator._instance;
}

var imageValidator = ImageValidator.getInstance();