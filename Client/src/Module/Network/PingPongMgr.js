
let PingPongNode = cc.Node.extend({

    ctor : function () {
        this._super();

        this.bg = ccs.load("res/Modules/Launching/json/PingPongNode.json").node;
        this.addChild(this.bg);

        this.lbTime = this.bg.getChildByName("lb");
        this.lbTime.setString("");

        this.imgLoad = this.bg.getChildByName("load");

        this.imgState = [];
        for(let i = 0; i < PingPongMgr.NETWORK_STATE_TIME_NOTIFY.length; i++) {
            this.imgState.push(this.bg.getChildByName("s" + i));
        }

        this.imgLoad.setVisible(false);
        this.updateNetworkState(this.imgState.length - 1);
    },

    getSize : function () {
        return this.imgLoad.getContentSize();
    },

    updateNetworkState : function (n) {
        for(let i in this.imgState) {
            this.imgState[i].setVisible(i == n);
        }
    },

    showNotifyNetworkSlow : function (v) {
        this.imgLoad.setVisible(v);
        this.imgLoad.runAction(cc.repeatForever(cc.rotateBy(0.15, 5)));
    },

    update : function () {
        this.lbTime.setString(pingPongMgr.getCurrentTimePing());
        this.lbTime.setVisible(true);
    }
});

let PingPongMgr = BaseMgr.extend({
    ctor : function() {
        this._super();

        this.arParent = [];
        this.arNode = [];
    },

    init : function() {

    },

    startPing : function () {
        JSLog.d("PingPongHandler::startPing");
        this.isStopHandler = false;

        this.sendPing();

        this.timePingPong = 0;
        this.timeDelayPingPong = 0;
        this.isDelayPingpong = false;
        this.isPingpong = true;
        this.isNetworkSlow = false;

        this.arStateTime = JSON.parse(JSON.stringify(PingPongMgr.NETWORK_STATE_TIME_NOTIFY));

        this.showNotifyNetworkSlow(false);
        this.updateNetworkState();
        this.retryConnectInBoard();

        timeoutConnectMgr.clearCountDown();
    },

    stopPing: function() {
        JSLog.d("PingPongHandler::stopPing");
        this.isStopHandler = true;

        this.isPingpong = false;
        this.isDelayPingpong = false;
        this.timePingPong = 0;
        this.timeDelayPingPong = 0;
    },

    receivePing : function () {
        JSLog.d("PingPongHandler::receivePing");

        this.currentTimePingPong = TimeUtils.getCurrentTime() - this.mLastTimeSendPing;
        this.mLastTimeSendPing = 0;

        this.timePingPong = 0;
        this.timeDelayPingPong = 0;
        this.timeRetryPingPong = 0;

        this.isRetryPingpong = false;
        this.isDelayPingpong = true;
        this.isPingpong = false;

        this.isNetworkSlow = false;

        this.showNotifyNetworkSlow(false);
        this.updateNetworkState();
    },

    sendPing : function () {
        if(this.mLastTimeSendPing > 0) {
            this.currentTimePingPong = TimeUtils.getCurrentTime() - this.mLastTimeSendPing;
        }
        this.mLastTimeSendPing = TimeUtils.getCurrentTime();

        JSLog.d("PingPongHandler::sendPing");
        this.timeRetryPingPong = 0;
        this.isRetryPingpong = true;

        this.sendPacket(new CmdSendPingpong());
    },

    autoDisconnect : function () {
        JSLog.d("autoDisconnect");

        this.updateNetworkState(0);
        GameClient.getInstance().disconnect();
    },

    update : function (dt) {
        if(this.isStopHandler) return;

        this.updatePingPong();

        // check state ping and check timeout ping
        if(this.isPingpong) {
            if(this.timePingPong < PingPongMgr.PINGPONG_TIMEOUT) {
                this.timePingPong += dt;

                // network state wifi
                for(let i = 0, size = this.arStateTime.length ; i < size ; i++) {
                    if(this.timePingPong > this.arStateTime[i]) {
                        this.updateNetworkState(size - i - 1);
                        this.arStateTime.splice(i,1);
                        break;
                    }
                }

                // network slowly
                if(this.timePingPong > PingPongMgr.NETWORK_SLOW_NOTIFY && !this.isNetworkSlow) {
                    this.isNetworkSlow = true;
                    this.showNotifyNetworkSlow(true);
                }

                // pingpong timeout
                if(this.timePingPong >= PingPongMgr.PINGPONG_TIMEOUT ) {
                    this.autoDisconnect();
                }
            }
        }

        // retry send ping if connect slow
        if(this.isRetryPingpong) {
            if(this.timeRetryPingPong < PingPongMgr.PINGPONG_INTERVAL) {
                this.timeRetryPingPong += dt;
                if(this.timeRetryPingPong >= PingPongMgr.PINGPONG_INTERVAL) {
                    this.sendPing();
                }
            }
        }

        // delay to send ping
        if(this.isDelayPingpong && this.timeDelayPingPong < PingPongMgr.PINGPONG_INTERVAL) {
            this.timeDelayPingPong += dt;

            if(this.timeDelayPingPong >= PingPongMgr.PINGPONG_INTERVAL) {
                this.startPing();
            }
        }
    },

    getCurrentTimePing : function () {
        if(this.currentTimePingPong < 150) return "";
        if(this.currentTimePingPong > 9999) return "";
        return this.currentTimePingPong;
    },

    // update ui
    addPingPong : function (parent, pos) {
        for(let s in this.arParent) {
            if(this.arParent[s] == parent) return;
        }

        this.arParent.push(parent);

        let pp = new PingPongNode();
        pp.setPosition(pos);
        parent.addChild(pp, -1);
        this.arNode.push(pp);
    },

    updatePingPong : function () {
        for(let s in this.arNode) {
            if(cc.sys.isObjectValid(this.arNode[s])) {
                this.arNode[s].update();
            }
        }
    },

    updateNetworkState : function (n) {
        if(n === undefined || n == null)
            n = PingPongMgr.NETWORK_STATE_TIME_NOTIFY.length -1;

        for(let s in this.arNode) {
            if(cc.sys.isObjectValid(this.arNode[s])) {
                this.arNode[s].updateNetworkState(n);
            }
        }
        JSLog.d("PingPongMgr::updateNetworkState " + n);
    },

    showNotifyNetworkSlow : function (slow) {
        JSLog.d("PingPongMgr::showNotifyNetworkSlow " + slow);

        for(let s in this.arNode) {
            if(cc.sys.isObjectValid(this.arNode[s])) {
                this.arNode[s].showNotifyNetworkSlow(slow);
            }
        }
    },

    retryConnectInBoard : function () {

    }
});

PingPongMgr.PINGPONG_TIMEOUT = 15;
PingPongMgr.PINGPONG_INTERVAL = 5;
PingPongMgr.NETWORK_SLOW_NOTIFY = 5;
PingPongMgr.NETWORK_STATE_TIME_NOTIFY = [0.15, 1, 5, 10];

PingPongMgr._inst = null;
PingPongMgr.instance = function() {
    if(!PingPongMgr._inst) {
        PingPongMgr._inst = new PingPongMgr();
    }
    return PingPongMgr._inst;
}
let pingPongMgr = PingPongMgr.instance();