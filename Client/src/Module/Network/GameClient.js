
let ConnectState = {
    DISCONNECTED : 0,
    CONNECTING : 1,
    CONNECTED : 2
};

let GameClient = cc.Class.extend({

    ctor: function () {
        this._tcpClient = fr.GsnClient.create();
        this._clientListener = new GameClientListener();
        this._tcpClient.setFinishConnectListener(this._clientListener.onFinishConnect.bind(this._clientListener));
        this._tcpClient.setDisconnectListener(this._clientListener.onDisconnected.bind(this._clientListener));
        this._tcpClient.setReceiveDataListener(this._clientListener.onReceived.bind(this._clientListener));

        this.disableNotify = false;

        this.setState(ConnectState.DISCONNECTED);
        this.setConnected(false);
    },

    // region Getter Setter
    setState : function (st) {
        this.connectState = st;
    },

    getState : function () {
        return this.connectState;
    },

    checkState : function (st) {
        return this.connectState == st;
    },

    setConnected : function (v) {
        this.connectServer = v;
    },

    isConnected : function () {
        return this.connectServer;
    },

    getNetwork: function () {
        return this._tcpClient;
    },
    // endregion

    // region Connect & Packet
    connect: function () {
        Loading.show();

        let server = loginMgr.getServer();
        if(!server) {
            server = Config.SERVER.LIVE;
        }

        logMgr.crashLog(LogMgr.CRASH.NETWORK, "connect server " + JSON.stringify(server));
        this._tcpClient.connect(server.IP, server.PORT);
        this.setState(ConnectState.CONNECTING);
        this.setConnected(true);

        logMgr.startTrackingSocket();
        timeoutConnectMgr.startCountDown();
    },

    disconnect: function (disableNotify) {
        logMgr.crashKey(LogMgr.CRASH.NETWORK,"disconnect");
        JSLog.i("GameClient::disconnect");

        this.disableNotify = disableNotify;

        pingPongMgr.stopPing();

        this._tcpClient.disconnect();
        this.setConnected(false);

        setTimeout(this.onDisconnect.bind(this), 200);
    },

    sendPacket: function (pk) {
        if (Config.ENABLE_CHEAT && pk._cmdId && pk._cmdId !== 50){
            JSLog.i("GameClient::Send: ",pk._cmdId);
        }

        if (this.getNetwork() && this.isConnected())
            this.getNetwork().send(pk);
    },
    // endregion

    // region Event
    onDisconnect : function () {
        if(this.checkState(ConnectState.DISCONNECTED)) return;
        this.setState(ConnectState.DISCONNECTED);

        JSLog.d("GameClient::onDisconnect " + inGameMgr.checkInBoard());
        if(retryConnectMgr.isNeedRetry()) {
            retryConnectMgr.retryConnect();
        }
        else {
            if(!this.disableNotify) {
                Loading.clear();

                Dialog.showOkCancelDialog(LocalizedString.to("CONFIRM_CONNECT"), null, function (btnID) {
                    loginMgr.retryLogin(btnID == Dialog.BTN_OK);
                });
            }
        }
    },

    onConnectFailed : function () {
        Loading.clear();

        Dialog.showOkCancelDialog(LocalizedString.to("CONFIRM_CONNECT"), null, function (btnID) {
            if(retryConnectMgr.isNeedRetry()) {
                retryConnectMgr.startRetry();
            }
            else {
                loginMgr.retryLogin(btnID == Dialog.BTN_OK);
            }
        });
    }
    // endregion
});

// region Singleton
GameClient.instance = null;
GameClient.getInstance = function () {
    if (!GameClient.instance) {
        GameClient.instance = new GameClient();
    }
    return GameClient.instance;
};
// endregion
