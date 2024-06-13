let LaunchingScene = BaseLayer.extend({
    ctor: function () {
        this._super();
        this.initWithBinaryFile("Launching/json/LaunchingScene.json");
    },

    initGUI: function () {
        this.bgProgress = this.getControl("bgProgress", this._layout);
        this.progress = this.getControl("progress", this._layout);

        this.version = this._layout.getChildByName('version');
        this.alignToLeft(this.version);
    },

    update: function (dt) {
        if(!this.isLoading) return;

        if(!this.isExtend) {
            if(this.nPercent > LaunchingScene.PERCENT_WAIT) {
                this.nDelta -= dt;
            }
            else {
                this.nDelta += dt;
            }
            if(this.nDelta > 1) this.nDelta = 1;
            if(this.nDelta < 0.1) this.nDelta = 0.1;

            if(this.nPercent > 99) this.nPercent = 99;
        }

        // update loading
        this.curDt = dt;
        this.nPercent += this.nDelta;
        this.progress.setPercent(this.nPercent);

        if(this.nPercent >= 100) {
            this.isLoading = false;
            loginMgr.openLogin();
        }
    },

    finishLoading : function () {
        let left = 100 - this.nPercent;
        let timeExt = LaunchingScene.TIME_EXTEND;

        this.isExtend = true;
        this.nDelta = left * this.curDt/ timeExt;
    },

    onEnterFinish: function () {
        this.scheduleUpdate();

        this.isLoading = true;
        this.nDelta = 0;
        this.nPercent = 0;
        this.curDt = 0;
        this.isExtend = false;
        this.version.setString(gameMgr.getVersionString());
    }
})

LaunchingScene.PERCENT_WAIT = 50;
LaunchingScene.TIME_EXTEND = 0.25;

LaunchingScene.className = "LaunchingScene";