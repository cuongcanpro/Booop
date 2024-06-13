
let RetryConnectMgr = BaseMgr.extend({
    ctor : function() {
        this._super();
    },
    
    init : function() {
        this.clearRetry();
    },

    isNeedRetry : function () {
        return inGameMgr.checkInBoard();
    },

    isRetryingConnect : function () {
        return (this.isNeedRetry() && this.isRetrying);
    },

    clearRetry : function () {
        this.connectCount = 0;
        this.timeDelay = -1;
    },

    startRetry : function () {
        this.connectCount = 0;
        this.timeDelay = RetryConnectMgr.TIME_DELAY_RETRY;
    },

    retryConnect : function () {
        if(this.connectCount <= 0) {
            this.startRetry();
        }
        else {
            this.connectCount++;
            if(this.connectCount >= RetryConnectMgr.MAX_TRY) {
                GameClient.getInstance().onConnectFailed();
            }
            else {
                this.timeDelay = RetryConnectMgr.TIME_DELAY_RETRY;
            }
        }
    },

    doRetry : function () {
        this.connectCount++;
        this.timeDelay = -1;
        this.isRetrying = true;
        GameClient.getInstance().connect();
    },

    update : function (dt) {
        if(this.timeDelay >= 0) {
            this.timeDelay -= dt;
            if(this.timeDelay <= 0) {
                this.doRetry();
            }
        }
    }
});

RetryConnectMgr.MAX_TRY = 5;
RetryConnectMgr.TIME_DELAY_RETRY = 2;

// region RetryConnectMgr Instance
RetryConnectMgr._inst = null;
RetryConnectMgr.instance = function() {
    if(!RetryConnectMgr._inst) {
        RetryConnectMgr._inst = new RetryConnectMgr();
    }
    return RetryConnectMgr._inst;
}
let retryConnectMgr = RetryConnectMgr.instance();
// endregion