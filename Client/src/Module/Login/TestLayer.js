
var TestLayer = BaseLayer.extend({
    ctor: function () {
        this._super(TestLayer.className);
        var that = this;
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyReleased: function (keyCode, event) {
                cheatFlowTest.doFlow(keyCode, that);

                // that._streak = new cc.MotionStreak(1, 3, 32, cc.color.WHITE, "Common/iconEmpty.png");
                // that._streak.setPosition(200, 200);
                // that.addChild(that._streak);
                // that._streak.runAction(cc.moveTo(0.5, 1000, 500).easing(cc.easeSineOut()));


            }
        }, this);
        this.arraySprite = [];
        this.lb = ccui.Text.create("fljd", SceneMgr.FONT_NORMAL, 20);
        this.lb.setTextAreaSize(cc.size(-1, 40));
        this.addChild(this.lb);
        this.lb.setPosition(200, 200);
        var size1 = this.lb.getContentSize();
        var size2 = this.lb.getTextAreaSize();
        var size3 = this.lb.getBoundingBox();
        cc.log("Size " + JSON.stringify(size1) + " " + JSON.stringify(size2) + " " + JSON.stringify(size3));

        this.sprite = cc.Sprite.create("res/Event/LuckyCard/WishStar/IconPopup/bgStar.png");
        this.node = cc.NodeGrid.create();
        this.addChild(this.node);

        this.node.setPosition(cc.winSize.width * 0.5, 200);
        this.node.addChild(this.sprite);
        this.node.runAction(
            cc.repeatForever(
                cc.waves(10, cc.size(15, 10), 5, 20, true, false)
            )
        );
    },

    onEnter: function () {
        this._super();

        this.scheduleUpdate();
    },

    update: function (delta) {
        this.countUpdate++;
        this.countTime = this.countTime + delta;
        // cc.log("Count " + this.countUpdate);
        if (this.countUpdate % 200 == 1) {
            // cc.log("Time Total " + this.countTime);
            //this.unscheduleUpdate();
            // var effect = efk.Effect.create("res/test.efk");
            // if (effect)
            // {
            //     var emitter = efk.EffectEmitter.create(this._manager, "");
            //     emitter.setEffect(effect);
            //     emitter.setPlayOnEnter(true);
            //     // emitter.setRotation3D(cc.math.vec3(0, 90, 0));
            //     emitter.setPosition(cc.p(320, 200));
            //
            //     emitter.setScale(13);
            //     this.addChild(emitter, 0);
            // }

        }
        for (var i = 0; i < this.arraySprite.length; i++) {
            var img = this.arraySprite[i];
            if (img.isConvert == false) {
                let targetRotate = -90 - (img.getPositionX() - cc.winSize.width * 0.5) / cc.winSize.width * 210;
                let curDiff = img.getRotation3D().y - targetRotate;
                if (curDiff * img.lastDiff < 0 || Math.abs(curDiff) < 1) {
                    img.setTexture("res/labai_2.png");
                    img.setScaleX(-1);
                    // img.setLocalZOrder(img.index);
                }
                else {
                    img.lastDiff = img.getRotation3D().y - targetRotate;
                }
            }
        }

    }
})
TestLayer.className = "TestLayer";


var CheatFlowTest = cc.Class.extend({
    ctor: function (idx) {

    },

    doFlow: function (keyCode, that) {
        cc.log("Key " + keyCode + ": ");
        switch (keyCode) {
            case cc.KEY.r:
                cc.log("Reload 1");
                zpsdn && zpsdn.start_binding();
                break;
            case cc.KEY.b:
                that.node.runAction(-1, cc.size(15, 10), 5, 20, true, false);

                return;

                that.arraySprite = [];
                that.removeAllChildren();
                for (var i = 0; i < 10; i++) {
                    // i = 4;
                    that.imgZig = cc.Sprite.create("res/common/defaultAvatar.png");
                    that.imgZig.setLocalZOrder(100 - i);
                    that.addChild(that.imgZig);
                    that.imgZig.setPosition(1000, 500);
                    that.imgZig.setRotation3D({x: 10, y: 0, z: 0});
                    that.imgZig.index = i;
                    var time = 0.65;
                    var targetRotate = -90 - (that.imgZig.getPositionX() - cc.winSize.width * 0.5) / 1200 * 70;
                    var targetPosX = 100 + 100 * i;
                    var tempPosX = (that.imgZig.getPositionX() + targetPosX) * 0.8;

                    that.imgZig.isConvert = false;
                    that.imgZig.lastDiff = 0;
                    that.imgZig.index = i;
                    that.imgZig.runAction(
                        cc.sequence(
                            cc.delayTime(time * 0.2 * i),
                            cc.rotateTo(time, {x: -70, y: -90, z: 6}),
                            cc.rotateTo(time, {x: -0, y: -180, z: 0}),
                            cc.callFunc(function () {

                            }.bind(that))
                        )
                    );
                    var center = cc.p((that.imgZig.getPositionX() + targetPosX) * 0.5 + 300, -100);
                    var arr = [that.imgZig.getPosition(), center, cc.p(targetPosX, 100)];
                    that.imgZig.runAction(
                        cc.sequence(
                            cc.delayTime(time * 0.2 * i),
                            cc.bezierTo(time * 2, arr)
                        )
                    );
                    that.arraySprite.push(that.imgZig);
                }

                break;

            case cc.KEY.c:
                that.lb.setString("flkdsjflksfsdffdsfsdfjf");
                var size1 = that.lb.getContentSize();
                var size2 = that.lb.getTextAreaSize();
                var size3 = that.lb.getBoundingBox();
                cc.log("Size " + JSON.stringify(size1) + " " + JSON.stringify(size2) + " " + JSON.stringify(size3));
                break;
            case cc.KEY.t:
                that.groupCard.addCard(23,2, cc.p(100, 100));
                break;
            case cc.KEY.g:
                that.arraySprite = [];
                that.removeAllChildren();
                for (var i = 0; i < 10; i++) {
                    // i = 4;
                    that.imgZig = cc.Sprite.create("res/labai_52.png");
                    that.imgZig.setLocalZOrder(100 - i);
                    that.addChild(that.imgZig);
                    that.imgZig.setPosition(cc.winSize.width * 0.1, cc.winSize.height * 0.5);
                    that.imgZig.setRotation3D({x: 0, y: 0, z: 0});
                    that.imgZig.index = i;
                    var time = 5.2;
                    var targetPosX = 100 + 100 * i;
                    that.imgZig.setScale(0.5);
                    that.imgZig.isConvert = false;
                    that.imgZig.lastDiff = 0;
                    that.imgZig.index = i;
                    that.imgZig.runAction(
                        cc.sequence(
                            cc.delayTime(time * 0.1 * i),
                            cc.spawn(
                                //cc.rotateTo(time * 0.2, {x: -10, y: 0, z: 0}),
                                cc.rotateTo(time * 0.5, {x: 0, y: -90, z: 0})
                            ),
                            cc.rotateTo(time * 0.5, {x: 0, y: -180, z: 0})
                        )
                    );
                    var center = cc.p((that.imgZig.getPositionX() + targetPosX) * 0.5, 2000);
                    if (targetPosX > that.imgZig.getPositionX())
                        center.x = center.x + 300;
                    else
                        center.x = center.x - 300;
                    center.x = targetPosX;
                    var arr = [that.imgZig.getPosition(), center, cc.p(targetPosX, 100)];
                    that.imgZig.runAction(
                        cc.sequence(
                            cc.delayTime(time * 0.1 * i),
                            cc.bezierTo(time * 1, arr).easing(cc.easeBackOut())
                        )
                    );
                    that.arraySprite.push(that.imgZig);
                }
                break;
            case cc.KEY.h:
                that.arraySprite = [];
                that.removeAllChildren();
                for (var i = 0; i < 20; i++) {
                    // i = 4;
                    that.imgZig = cc.Sprite.create("res/labai_52.png");
                    that.imgZig.setLocalZOrder(100 - i);
                    that.addChild(that.imgZig);
                    that.imgZig.setPosition(cc.winSize.width * 0.5, cc.winSize.height * 0.5);
                    that.imgZig.setRotation3D({x: -20, y: 0, z: 0});
                    that.imgZig.setScale(0.5);
                    that.imgZig.index = i;
                    var time = 3.5;
                    var targetPosX = 100;
                    var targetRotate = 80;
                    if (i % 2 == 1) {
                        targetPosX = cc.winSize.width - 100;
                        targetRotate = -80;
                    }
                    that.imgZig.isConvert = true;
                    that.imgZig.lastDiff = 0;
                    that.imgZig.index = i;
                    that.imgZig.runAction(
                        cc.sequence(
                            cc.delayTime(time * 0.1 * i),
                            cc.rotateTo(time * 0.5, {x: -10, y: targetRotate, z: 0}),
                            cc.callFunc(
                                function () {
                                    this.setLocalZOrder(this.index)
                                }.bind(that.imgZig)
                            ),
                            cc.rotateTo(time * 0.5, {x: 0, y: 0, z: 20})
                        )
                    );
                    var center = cc.p((that.imgZig.getPositionX() + targetPosX) * 0.5, 600);
                    var arr = [that.imgZig.getPosition(), center, cc.p(targetPosX, 350)];
                    that.imgZig.runAction(
                        cc.sequence(
                            cc.delayTime(time * 0.1 * i),
                            cc.bezierTo(time, arr).easing(cc.easeExponentialOut())
                        )
                    );
                    that.imgZig.runAction(
                        cc.sequence(
                            cc.delayTime(time * 0.1 * i),
                            cc.scaleTo(time, 1)
                        )
                    )
                    // that.arraySprite.push(that.imgZig);
                }
                break;

        }
    }
})


// region Singleton
CheatFlowTest.instance = null;
CheatFlowTest.getInstance = function () {
    if (!CheatFlowTest.instance) {
        CheatFlowTest.instance = new CheatFlowTest();
    }
    return CheatFlowTest.instance;
};
var cheatFlowTest = CheatFlowTest.getInstance();
// endregion


let CardImage = cc.Sprite.extend({
    ctor: function (id) {
        this._super();
        this.setIdCard(id);
        this.defaultPos = cc.p(0, 0);
    },

    getResource: function () {
        if (this.id == 52) {
            return "res/labai_52.png";
        }
        else {
            return "res/labai_2.png";
        }
    },

    setIdCard: function (id) {
        this.id = id;
        this.setTexture(this.getResource());
    },

    moveToDefault: function (time) {
        this.stopAllActions();
        if (!time) {
            this.setPosition(this.defaultPos);
        }
        else {
            this.runAction(cc.moveTo(time, this.defaultPos));
        }
    }
})
