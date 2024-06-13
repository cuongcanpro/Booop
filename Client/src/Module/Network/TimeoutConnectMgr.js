
let TimeoutConnectMgr = BaseMgr.extend({

    ctor : function () {
        this.timeCountDown = 0;
        this.isWaitConnect = false;
    },

    startCountDown : function () {
        JSLog.i("##TimeoutConnect::startCountDown");
        this.isWaitConnect = true;
        this.timeCountDown = TimeoutConnectMgr.TIMEOUT_CONNECT_SERVER;
    },

    clearCountDown : function () {
        JSLog.i("##TimeoutConnect::clearTimeout");
        this.isWaitConnect = false;
        this.timeCountDown = 0;
    },

    doTimeoutConnect : function () {
        JSLog.i("##TimeoutConnect::doTimeoutConnect");
        if(TimeoutConnectMgr.TIMEOUT_CONNECT_SERVER == 0) return;

        this.clearCountDown();

        Dialog.showOkCancelDialog(LocalizedString.to("CONFIRM_CONNECT"), null, function (btnID) {
            loginMgr.retryLogin(btnID == Dialog.BTN_OK);
        });
    },

    update : function (dt) {
        if(TimeoutConnectMgr.TIMEOUT_CONNECT_SERVER == 0) return;

        if(this.isWaitConnect) {
            if(this.timeCountDown > 0) {
                this.timeCountDown -= dt;
                if(this.timeCountDown <= 0) {
                    this.doTimeoutConnect();
                }
            }
        }
    }

});

TimeoutConnectMgr.TIMEOUT_CONNECT_SERVER = 10000;

TimeoutConnectMgr._inst = null;
TimeoutConnectMgr.getInstance = function () {
    if(!TimeoutConnectMgr._inst) {
        TimeoutConnectMgr._inst = new TimeoutConnectMgr();
    }
    return TimeoutConnectMgr._inst;
};
let timeoutConnectMgr = TimeoutConnectMgr.getInstance();