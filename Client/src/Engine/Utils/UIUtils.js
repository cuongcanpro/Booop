UI_PREFIX = {
    BUTTON:         "btn",
    CHECKBOX:       "cb",
    CONTROL_SWITCH: "cs",
    RICH_TEXT:      "rt",
    WEB_VIEW:       "wv",
    TABLE_VIEW:     "tv",
    EDIT_BOX:       "eb",
    HTML_TEXT:      "html"
};

let UIUtils = {
    _controlSwitchDefault: ["bg_switch", "bg_switch_on", "bg_switch_off", "icon_switch", "res/fonts/UTM_Avo_p13_bold.ttf", 40],
    _htmlTextDefault: ['UTM_AVO_P13', 14, 'NONE', 200, 0],

    isButton: function(name){
        return cc.isString(name) && name.startsWith(UI_PREFIX.BUTTON);
    },

    /**
     * sync children by deep
     * @private
     */
    _syncChildrenInNode: function(node, ctx, deep, maxDeep){
        if(deep >= maxDeep) return;

        let allChildren = node.getChildren();
        if(allChildren === null || allChildren.length == 0) return;

        let childName;
        for(let i = 0; i < allChildren.length; i++) {
            childName = allChildren[i].getName();
            // JSLog.d("print chill name ::: ", childName);
            // JSLog.d('sync child: %s', childName);

            if(childName in ctx && ctx[childName] === null)
            {
                ctx[childName] = allChildren[i];
                this.handleUIByType(ctx, ctx[childName]);
                this.configDefaultUI(ctx[childName]);
                // ctx[childName].defaultPosition = allChildren[i].getPosition();
            }
            this._syncChildrenInNode(allChildren[i], ctx, deep + 1, maxDeep);
        }
    },

    handleUIByType: function (ctx, node){
        let name = node.getName();
        if(UIUtils.isButton(name)){
            node.setPressedActionEnabled(true);
            node.addTouchEventListener(ctx.onTouchEventHandler,ctx);
            node.delayClick = 0;
            node.timeLastClick = 0;
        }
    },

    configDefaultUI: function (obj){
        if (!obj) return;

        try {
            if (obj.getPosition){
                obj.defaultPosition = obj.getPosition();
            }

            if (obj.getScale && (obj.getScaleX() == obj.getScaleY())){
                obj.defaultScale = obj.getScale();
            }

            if (obj.setCascadeOpacityEnabled)
            {
                obj.setCascadeOpacityEnabled(true);
            }
        } catch (e) {
            JSLog.e("Error sync children cocos::: " + e);
        }
    },

    doLayout: function(node, size){
        node.setContentSize(size);
        ccui.helper.doLayout(node);
    },

    _getSprite: function(node){
        if(node == null){
            JSLog.e("grayShader node == null");
            return node;
        }
        let sprite = node;

        if(node instanceof cc.Sprite || node instanceof cc.LabelBMFont){
            sprite = node;
        }
        else if(node instanceof ccui.Button || node instanceof ccui.ImageView){
            if(node.isScale9Enabled()){
                // JSLog.e("grayShader isScale9Enabled == true");
            }

            sprite = node.getVirtualRenderer().getSprite();
        }
        else if(node instanceof ccui.Scale9Sprite){
            sprite = node.getSprite();
        }

        return sprite;
    },

    getSprite: function(node){
        return this._getSprite(node);
    },

    // shader avatar
    applyShaderAvatar: function(img){
        let sprite = this.getSprite(img);

        let program = cc.GLProgram.createWithFilenames("res/Shader/default2dmasked.vsh", "res/Shader/default2dmasked.fsh");
        let glProgramState = cc.GLProgramState.getOrCreateWithGLProgram(program);

        let texture = cc.textureCache.getTextureForKey("res/Lobby/Lobby/avatar_default.png");
        if (!texture){
            texture = cc.textureCache.addImage("res/Lobby/Lobby/avatar_default.png");
        }
        texture.setTexParameters(gl.LINEAR, gl.LINEAR, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE);

        glProgramState.setUniformTexture("u_mask", texture);
        sprite.setGLProgramState(glProgramState);
    },

    // endregion
};

let AnimUtils = {
    /*
        effec ánh sáng lướt qua
        path: hình ảnh mask
        control: đối tượng add mask
     */
    effectMask: function (control, path, timeRun, delay, loop, alphaRate, deltaX = 0, deltaY = 0, imgLight = DailyTaskManager.PATH_MAIN_GUI + "mask.png", opacityLight = 200) {
        var tagMask = 103;
        if (control.getChildByTag(tagMask)) control.removeChildByTag(tagMask);
        var mask = new cc.Sprite(path);
        if (!imgLight) return;
        var light = new cc.Sprite(imgLight);
        light.setBlendFunc(cc.DST_COLOR, cc.ONE);

        var scaleL = mask.getContentSize().height * 1.5 / light.getContentSize().height;
        var scaleW = mask.getContentSize().width * 1 / light.getContentSize().width;
        light.setScale(scaleL > scaleW ? scaleL : scaleW);

        if (!alphaRate) alphaRate = 0.5;
        this.clipping = new cc.ClippingNode();
        this.clipping.setAlphaThreshold(alphaRate);
        this.clipping.addChild(light);
        light.setOpacity(opacityLight);
        this.clipping.setCascadeOpacityEnabled(true);
        this.clipping.setStencil(mask);
        control.addChild(this.clipping);
        this.clipping.setTag(tagMask);
        this.clipping.setPositionX(control.getContentSize().width / 2 - deltaX);
        this.clipping.setPositionY(control.getContentSize().height / 2 - deltaY);
        // this.clipping.setScaleX(this.clipping.getScaleX() * (control.width / mask.width));
        // this.clipping.setScaleY(this.clipping.getScaleY() * (control.height / mask.height));

        var lightWidth = light.getContentSize().width * (scaleL > scaleW ? scaleL : scaleW);
        var maskWitdh = mask.getContentSize().width;
        var distance = lightWidth + 2 * maskWitdh;
        if (!timeRun) timeRun = 2;
        var actionMove = cc.moveBy(timeRun, distance, 0);
        var x = -mask.getContentSize().width * 2;
        if (!delay) delay = 0;
        var timeDelay = timeRun * (distance + x) / distance;

        light.setPositionX(x);

        if (loop === undefined || loop === null) loop = true;
        if (loop) {
            light.runAction(cc.sequence(cc.delayTime(delay),
                actionMove,
                cc.callFunc(function () {
                    this.setPosition(x, 0);
                }.bind(light)),
                cc.delayTime(timeDelay)
            ).repeatForever());
        } else {
            light.runAction(cc.sequence(cc.delayTime(delay),
                actionMove,
                cc.callFunc(function () {
                    this.setPosition(x, 0);
                }.bind(light)),
                cc.delayTime(timeDelay),
                cc.fadeOut(0.01)
            ));
        }
    },
}