var fr = fr||{};
fr.Avatar = cc.Node.extend({
    ctor: function (defaultAvatar, isUserShader = false) {
        this._super();
        this._size = 160;
        this.url = "";
        this.file = "";
        this.defaultFile = defaultAvatar;
        this.countErr = 0;
        this.isDownloading = false;
        this.isUseShader = isUserShader;
        this.setCascadeOpacityEnabled(true);

        this._defaultAvatar = cc.Sprite.create(defaultAvatar);//, this, 0, 0, 0.5, 0.5);
        this._defaultAvatar.setAnchorPoint(0.5,0.5);
        this._defaultAvatar.setCascadeOpacityEnabled(true);
        this._size = this._defaultAvatar.getContentSize();
        this.addChild(this._defaultAvatar);

        if (isUserShader){
            this._shaderAvatar = new cc.Sprite(defaultAvatar);
            this._defaultAvatar.setAnchorPoint(0.5,0.5);
            this.addChild(this._shaderAvatar);
            UIUtils.applyShaderAvatar(this._shaderAvatar);
            this._shaderAvatar.setVisible(false);
        }

        this._avatar = null;
        return true;
    },

    setImage: function(image) {
        this._defaultAvatar.initWithFile(image);
        this._defaultAvatar.setScale(this._size.width / this._defaultAvatar.width);
        this._defaultAvatar.setVisible(true);
        if(this._avatar)this._avatar.setVisible(false);
        if (this.isUseShader){
            this._defaultAvatar.setVisible(false);
            this._shaderAvatar.setVisible(true);
            this._shaderAvatar.setTexture(image);
            this._shaderAvatar.setScale(this._size.width / this._shaderAvatar.width);
        }
    },

    setImageTexture: function(texture) {
        this._defaultAvatar.initWithTexture(texture);
        this._defaultAvatar.setScale(this._size.width / this._defaultAvatar.width);
        this._defaultAvatar.setVisible(true);
        if(this._avatar)this._avatar.setVisible(false);
        if (this.isUseShader){
            this._defaultAvatar.setVisible(false);
            this._shaderAvatar.setVisible(true);
            this._shaderAvatar.setTexture(texture);
            this._shaderAvatar.setScale(this._size.width / this._shaderAvatar.width);
        }
    },

    setDefaultImage: function() {
        this.setImage(this.defaultFile);
    },

    getShaderAvatar: function() {
        return this._shaderAvatar;
    },

    updateAvatar : function(path, url, sendLog) {
        //xu ly load tu cache
        var file = this.getStorePath(path);
        this.url = url;
        this.file = file;
        this.countErr = 0;

        // cc.log("updateAvatar 1", path, this.url, this.file);
        //load avatar co san tu cache Texture
        var textureCache = cc.textureCache.getTextureForKey(file);
        if(textureCache){
            // if(Config.ENABLE_CHEAT)cc.log("avatar Load cache Texture avatar");
            this.setImageTexture(textureCache);
            return;
        }
        //load avatar tu file da tai ve va dang khong downloading (neu downloading se co san 1 file 0KB => loi)
        if(!this.isDownloading && jsb.fileUtils.isFileExist(file)){
            // cc.log("den day r 1")
            //neu kich thuoc file co san < 500B => file bi lUserInfoGUIoi.
            if(jsb.fileUtils.getFileSize(file) < 500){
                // cc.log("den day r 2")
                if(Config.ENABLE_CHEAT)cc.log("avatar change file too small:", jsb.fileUtils.getFileSize(file), file);
                // jsb.fileUtils.removeFile(file);
                //file bi loi thi convert link fb de tai thu

                // convert one time
                if(this.url.indexOf("https://graph.facebook.com/") < 0){
                    url = this.convertAvatarFacebook(this.url);
                }

                if(url == ""){
                    cc.log("avatar Link url error, change link default avatar.");
                    url = "https://zingplay.static.g6.zing.vn/images/zpp/zpdefault.png";
                    this.countErr = 10;
                }
            }
            //load file va return
            else{
                // cc.log("avatar Load cache file avatar");
                this.setImage(file);
                this.isDownloading = false;
                return;
            }
        }

        // cc.log("den da y r 3");
        if(this._avatar == null)
        {
            this._avatar = fr.AsyncSprite.create(this._size, this.onFinishLoad.bind(this));
            this.addChild(this._avatar);
        }
        this.setDefaultImage();
        this.sendLog = sendLog;
        //Tien hanh tai file
        try {
            if (this.sendLog) {
                logMgr.crashLog(LogMgr.CRASH.AVATAR,"LoadFirst::" + url + "::" + path);
            }
            this._avatar.updatePath(url, file);
            this.isDownloading = true;
            //TH dung convert link ma bi loi (tai anh gif,...) thi se khong tra ve callback
            //check xem download xong file co bi loi khong vi TH nay se khong tra ve callback
            //=> phai giai phong bien isDownloading
            if(url[8] == 'g' && url.indexOf("https://graph.facebook.com/") === 0){
                this.isDownloading = false;
            }
        } catch (e) {
            // cc.log(e);
        }
    },
    onFinishLoad:function(result)
    {
        this.isDownloading = false;
        if(result)
        {
            //check file bi loi
            var sizeAvatar = jsb.fileUtils.getFileSize(this.file);
            //TAI AVATAR THANH CONG
            if(sizeAvatar > 500){
                if (this.sendLog) {
                    logMgr.crashLog(LogMgr.CRASH.AVATAR,"LoadSuccess::" + "::" + this.url);
                }
                this.setImage(this.file)
                return;
            }
            else{
                // cc.log("avatar Load Avatar Failed: too small");
            }
        }
        this.countErr++;
        if(this.countErr > 3){
            return;
        }
        var saveCount = this.countErr;
        //neu qua so lan loi thi link url bi loi (dang de la 1, loi thi tai lai luon)
        if(this.countErr >= 1){
            var convertAvatar = this.url;
            if(this.url.indexOf("https://graph.facebook.com/") < 0){
                convertAvatar = this.convertAvatarFacebook(this.url);
            }

            if(convertAvatar === ""){
                // cc.log("avatar Link url error, change link default avatar.");
                convertAvatar = "https://zingplay.static.g6.zing.vn/images/zpp/zpdefault.png";
                this.countErr = 10;
            }
            else{
                // cc.log("avatar convert image");
            }
            this.url = convertAvatar;
        }
        this.setDefaultImage();
        if (this.sendLog) {
            logMgr.crashLog(LogMgr.CRASH.AVATAR,"LoadReload::" + saveCount + "::" + this.url);
        }
        this._avatar.updatePath(this.url, this.file);
        this.isDownloading = true;
    },

    convertAvatarFacebook: function(url) {
        //set lai url facebook
        if(url[27] == 'f' && url.indexOf("https://platform-lookaside.fbsbx.com") === 0){
            var idfb = parseInt(url.substring(url.indexOf("?asid=") + 6, url.indexOf("&height")));
            if(!isNaN(idfb)){
                var link = "https://graph.facebook.com/" + idfb + "/picture?type=large&redirect=true";
                var accessToken = fr.facebook.getAccessToken();
                if(accessToken && accessToken != ""){
                    link += "&access_token=" + accessToken;
                }
                return link;
            }
        }
        return "";
    },

    getStorePath:function(path)
    {
        return jsb.fileUtils.getWritablePath() + path;
    },

    isCacheAvatar: function () {
        //xu ly load tu cache
        var file = this.getStorePath(path);

        // cc.log("updateAvatar", path);

        //load avatar co san tu cache Texture
        var textureCache = cc.textureCache.getTextureForKey(file);
        if(textureCache){
            return 1;
        }
        return 0;
    },

    loadCacheAvatar: function (path) {
        //xu ly load tu cache
        var file = this.getStorePath(path);

        // cc.log("updateAvatar", path);

        //load avatar co san tu cache Texture
        var textureCache = cc.textureCache.getTextureForKey(file);
        if(textureCache){
            // if(Config.ENABLE_CHEAT)cc.log("avatar Load cache Texture avatar");
            this.setImageTexture(textureCache);
            return true;
        }

        //load avatar tu file da tai ve va dang khong downloading (neu downloading se co san 1 file 0KB => loi)
        if(!this.isDownloading && jsb.fileUtils.isFileExist(file)){

            if(jsb.fileUtils.getFileSize(file) < 500){

            }
            //load file va return
            else{
                // cc.log("avatar Load cache file avatar");
                this.setImage(file);
                this.isDownloading = false;
                return true;
            }
        }


        if(this._avatar == null)
        {
            this._avatar = fr.AsyncSprite.create(this._size, this.onFinishLoad.bind(this));
            this.addChild(this._avatar);
        }
        this.setDefaultImage();

        return false;
    }
});
