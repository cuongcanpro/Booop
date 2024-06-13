let LogPacket = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(LogMgr.CMD_SEND_LOG);
    },

    putData: function (str) {
        this.packHeader();
        this.putString(str);
        this.updateSize();
    }
});

let LogMgr = BaseMgr.extend({
    ctor : function() {
        this.log = '';
    },

    init : function () {
        dispatcherMgr.addListener(GameMgr.EVENT.PAUSE_GAME, this, this.onPauseGame);
    },

    onPauseGame : function () {
        this.journeySendLog();
    },

    // region Crashlytics
    crashKey : function (key, value) {
        if(platformMgr.isWindow()) {
            JSLog.d("crashKey::" + key + "::" + value);
        }

        fr.crashLytics.setString(key, value);
    },

    crashLog : function (group, msg) {
        if(platformMgr.isWindow()) {
            JSLog.d("crashLog::" + group + "::" + msg);
        }

        fr.crashLytics.log(group + "::" + msg);
    },
    // endregion

    // region Tracker
    logDebug : function (group, type, msg) {
        fr.tracker.logDebug(group, type, msg)
    },

    logABTesting : function (uId,uName,campaignName, groupName) {
        fr.tracker.logABTesting(uId,uName,campaignName, groupName)
    },

    logStep : function (group, step) {
        fr.tracker.logStep(group, step, true, "");
    },
    // endregion

    // region Tracking Journey
    journeyLog : function (step) {
        try {
            if(!this.arJourneyStep) {
                this.arJourneyStep = [];
                this.arJourneyTime = [];
                this.isNewUser = gameMgr.isDayInstall();
            }

            this.arJourneyStep.push(step);
            this.arJourneyTime.push(gameMgr.getTotalTimeInGame());
            JSLog.d("#journeyAddLog " + step + " - " + gameMgr.getTotalTimeInGame());
        }
        catch(e) {

        }
    },

    journeySendLog : function () {
        try {
            let deviceId = gameMgr.getDeviceID();
            let uId = userMgr.getUserId();
            let gold = userMgr.getGold();
            let open = this.countJourneyLog();
            let type = this.isNewUser ? "NEW_USER" : "OLD_USER";
            let data = {deviceId, uId, gold, open, type, steps : this.arJourneyStep, times: this.arJourneyTime};
            fr.tracker.logDebug("NUJ",type,JSON.stringify(data));
        }
        catch(e) {

        }
    },

    countJourneyLog : function () {
        let nOpen = 0;
        try {
            nOpen = StorageUtil.getInt(LogMgr.NUJ_OPEN_KEY,0);
            nOpen += 1;

            StorageUtil.setInt(LogMgr.NUJ_OPEN_KEY,nOpen);
        }
        catch(e) {
            nOpen = 1;
        }

        return nOpen;
    },

    // endregion

    // region Tracking Socket Stuck
    startTrackingSocket : function () {
        try {
            JSLog.d("LogMgr::startTrackingSocket");

            this.stopTrackingSocket();

            this.isTrackingSocket = true;
            this.arStepSocket = [];
            this.trackingSession = TimeUtils.getCurrentTime();
            if(!this.gameSession)
                this.gameSession = TimeUtils.getCurrentTime();

            this.fTimeoutTracking = setTimeout(logMgr.stuckSocket.bind(logMgr), 5000);

            logMgr.addStepSocket("connect");
        }
        catch(e) {

        }
    },

    stopTrackingSocket : function () {
        try {
            JSLog.d("LogMgr::stopTrackingSocket");

            this.isTrackingSocket = false;
            this.arStepSocket = [];
            this.trackingSession = 0;

            this.clearTimeout(this.fTimeoutTracking);
            this.fTimeoutTracking = null;
        }
        catch(e) {

        }
    },

    addStepSocket : function (step) {
        try {
            JSLog.d("LogMgr::addStepSocket " + step);
            if(this.isTrackingSocket) {
                this.arStepSocket.push(step);
            }
        }
        catch(e) {

        }
    },

    finishSocket : function () {
        try {
            var sLog = gameMgr.getDeviceID();
            sLog += "#" + this.gameSession;
            sLog += "#" + this.trackingSession;
            sLog += "#" + userMgr.getUserId();
            sLog += "#" + userMgr.getUserName();
            logMgr.logDebug("SOCKET","SUCCESS", sLog);

            this.stopTrackingSocket();
        }
        catch(e) {

        }
    },

    stuckSocket : function () {
        try {
            if(this.isTrackingSocket) {
                JSLog.d("LogMgr::sendStuckLoading");

                var sLog = gameMgr.getDeviceID();
                sLog += "#" + this.gameSession;
                sLog += "#" + this.trackingSession;
                sLog += "#" + this.arStepSocket.join("-");

                logMgr.logDebug("SOCKET","STUCK",sLog);
                JSLog.sendTelegramTopic(JSLog.TOPIC.LOADING, "StuckStep:" + sLog);

                this.stopTrackingSocket();
            }
        }
        catch(e) {
            JSLog.i("sendStuckLoading error " + e);
        }
    },
    // endregion

    // region Socket Log
    getCurrentLog: function () {
        return this.log;
    },

    pushLogStep: function (step) {
        if (this.log === '') {
            this.log += step;
        } else {
            this.log += '|' + step;
        }

        this.sendLog(this.log);
        this.crashLog("STEP", this.log);
        JSLog.d("pushLogStep: " + this.log);
    },

    popLogStep: function () {
        let idx = this.log.lastIndexOf('|');
        this.log = this.log.substring(0, idx);

        JSLog.d("popLogStep: " + this.log);
    },

    resetLog: function (step) {
        this.log = step;

        JSLog.d("resetLog: " + this.log);
    },

    sendLog: function (str) {
        JSLog.d("Send Log " + str);
        let pk = new LogPacket();
        pk.putData(str);

        this.sendPacket(pk);

        pk.clean();
    }

    // keepTrack: function (stepName, target, fnName) {
    //     let oldFn = target[fnName];
    //     target[fnName] = (function () {
    //         logMgr.pushLogStep(stepName);
    //         oldFn.apply(target, arguments);
    //         logMgr.popLogStep();
    //     });
    // }
    // endregion
});

LogMgr.CRASH = {
    GUI                 : "GUI",
    NETWORK             : "NETWORK",
    BUTTON              : "BUTTON",
    CMD                 : "CMD",
    AVATAR              : "AVATAR",
    SCENE               : "SCENE",
    ARMATURE            : "ARMATURE",
    DOWNLOAD_ASSET      : "DOWNLOAD_ASSET",
    BOARD               : "BOARD",
    CLIENT              : "GAME_CLIENT"
};

LogMgr.NUJ = {
    LOADING : "LD",
    LOGIN : "LG",
    CONNECT_SERVER : "SK",
    LOGIN_SUCCESS : "LS",
    USER_SUCCESS : "US",
    LOBBY : "LB",
    SHOW_START_GOLD : "SS",
    CLOSE_START_GOLD : "CS",
    SHOW_LOGIN_7_DAYS : "S7",
    CLOSE_LOGIN_7_DAYS : "C7",
    GET_LOGIN_7_DAYS : "G7",
    SHOP : "SH",
    TABLE : "TB",
    TOURNAMENT : "TO",
    VIP : "VI",
    JOIN_GAPLE : "GJ",
    PLAY_GAPLE : "GP",
    START_GAPLE : "GS",
    END_GAPLE : "GE",
    QUIT_GAPLE : "GQ",
    REG_QUIT_GAPLE : "GR",
    JOIN_QQ : "QJ",
    PLAY_QQ : "QP",
    START_QQ : "QS",
    QUIT_QQ : "QQ",
    END_QQ : "QE",
    REG_QUIT_QQ : "QR",
}

LogMgr.NUJ_OPEN_KEY = "_key_nuj_open_log_";
LogMgr.NUJ_USER_KEY = "_key_nuj_user_";

LogMgr.CMD_SEND_LOG = 1030;

// region LogMgr Instance
LogMgr._inst = null;
LogMgr.instance = function() {
    if(!LogMgr._inst) {
        LogMgr._inst = new LogMgr();
    }
    return LogMgr._inst;
}
var logMgr = LogMgr.instance();
// endregion