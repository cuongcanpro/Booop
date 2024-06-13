
let GameClientListener = cc.Class.extend({
    ctor: function () {

    },

    onFinishConnect: function (isSuccess) {
        JSLog.i("_________onFinishConnect:" + isSuccess);
        logMgr.crashLog(LogMgr.CRASH.NETWORK, "onFinishConnect - " + isSuccess);

        if (isSuccess) {
            logMgr.addStepSocket("handshake");
            GameClient.getInstance().sendPacket(new CmdSendHandshake());
            GameClient.getInstance().setState(ConnectState.CONNECTING);

            retryConnectMgr.clearRetry();

        } else {
            logMgr.addStepSocket("failed");
            GameClient.getInstance().disconnect();
        }
    },

    onDisconnected: function () {
        logMgr.crashLog(LogMgr.CRASH.NETWORK, "onDisconnected");
        JSLog.i("GameClientListener::onDisconnected");
        GameClient.getInstance().onDisconnect();
    },

    onReceived: function (cmd, pk) {
        let packet = new engine.InPacket();
        packet.init(pk);
        let controllerID = packet.getControllerId();

        // region Log
        try {
            if (cmd !== 50 && cmd !== 15409) {
                JSLog.i(" ON RECEIVED PACKET "
                    + "   CMD: " + cmd
                    + "   TIME: " + TimeUtils.getCurrentHMS()
                    + "   CONTROLLER ID: " + controllerID
                    + "   ERRO.R:  " + packet.getError());
                logMgr.crashLog(LogMgr.CRASH.CMD,cmd + " - " + TimeUtils.getCurrentHMS());
            }
        }
        catch(e) {
        }
        // endregion

        if (controllerID == 0) {
            this.onReceiveSystem(cmd, packet);
        }
        else {
            BaseMgr.onReceived(cmd, pk);
        }
        packet.clean();
    },

    onReceiveSystem: function(cmd, packet) {

        switch (cmd) {
            case CMD.HAND_SHAKE:
            {
                loginMgr.receiveLogin = false;
                setTimeout(function () {
                    cc.log("Receive Login " + loginMgr.receiveLogin);
                    if (loginMgr.receiveLogin == false) {
                        // send error to Server
                        logMgr.logDebug("Login", "NotReceiveLogin", "Error");
                        PaymentUtils.saveData(1, "login");
                    }
                }, 5000);
                logMgr.addStepSocket("login");
                loginMgr.sendLogin();
                break;
            }
            case CMD.CMD_PINGPONG:
            {
                pingPongMgr.receivePing();
                break;
            }
            case LoginMgr.CMD.CMD_ANOTHER_COM:
            {
                if (packet.getError() == 3)
                {
                    loginMgr.onAnotherCom();
                }
                break;
            }
        }
    },
});