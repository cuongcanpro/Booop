/**
 * @class
 * @extends BaseMgr
 * @property {UserInfo} userInfo
 */
const UserMgr = BaseMgr.extend({
    ctor : function() {
        this._super();

        this.userInfo = null;
    },

    init : function() {
        this.userInfo = new UserInfo();
    },

    onReceived : function (cmd, pk) {
        switch (cmd) {
            case UserMgr.CMD.CMD_GET_USER_INFO:
            {
                const info = new CmdReceivedUserInfo(pk);
                info.clean();
                this.onGetUserInfo(info);
                break;
            }
            case UserMgr.CMD.CMD_UPDATE_USER_INFO:
            {
                const infoUpdate = new CmdReceivedUpdateInfoUser(pk);
                infoUpdate.clean();
                this.onUpdateUserInfo(infoUpdate);
                break;
            }
        }
    },

    sendGetUserInfo : function () {
        this.sendPacketCMD(UserMgr.CMD.CMD_GET_USER_INFO);
    },

    /**
     * @param {CmdReceivedUserInfo} cmd
     */
    onGetUserInfo: function(cmd) {
        Loading.clear();

        cc.log("User Info ==== " + JSON.stringify(cmd));
        this.userInfo.setUserId(cmd.userId);
        this.userInfo.setDisplayName(cmd.displayName);
        this.userInfo.setUserName(cmd.userName);
        this.userInfo.setAvatarURL(cmd.avatarURL);
        this.userInfo.setGold(cmd.gold);
        this.userInfo.setDiamond(cmd.diamond);
        this.userInfo.setLevel(cmd.level);
        this.userInfo.setLevelPercent(cmd.levelPercent);
        this.userInfo.setQQTotalMatches(cmd.qqTotalMatches);
        this.userInfo.setQQWinRate(cmd.qqWinRate);
        this.userInfo.setQQStyle(cmd.qqStyle);
        this.userInfo.setGapleTotalMatches(cmd.gapleTotalMatches);
        this.userInfo.setGapleWinRate(cmd.gapleWinRate);
        this.userInfo.setGapleTime(cmd.gapleTime);
        dispatcherMgr.dispatchEvent(UserMgr.EVENT.GET_USER_INFO);

        // Log Tracker
        fr.platformWrapper.trackLoginGSN(userMgr.getUserId(),
            loginMgr.getSocialType(),
            "",
            userMgr.getUserName());

        logMgr.finishSocket();
        logMgr.journeyLog(LogMgr.NUJ.USER_SUCCESS);

        // Log Crash
        logMgr.crashKey("UserInfo", cmd.userId + "_" + loginMgr.getSocialType() + "_" + cmd.userName);

        userMgr.doNotifyUser();
    },

    /**
     * @param {CmdReceivedUpdateInfoUser} cmd
     */
    onUpdateUserInfo: function(cmd) {
        if (cmd.userId === this.getUserId()){
            this.userInfo.setGold(cmd.gold);
            this.userInfo.setDiamond(cmd.diamond);
            this.userInfo.setLevel(cmd.level);
            this.userInfo.setLevelPercent(cmd.levelPercent);
            this.userInfo.setQQTotalMatches(cmd.qqTotalMatches);
            this.userInfo.setQQWinRate(cmd.qqWinRate);
            this.userInfo.setQQStyle(cmd.qqStyle);
            this.userInfo.setGapleTotalMatches(cmd.gapleTotalMatches);
            this.userInfo.setGapleWinRate(cmd.gapleWinRate);
            this.userInfo.setGapleTime(cmd.gapleTime);
            this.userInfo.setAutoBuyIn(cmd.autoBuyIn);
        }

        dispatcherMgr.dispatchEvent(UserMgr.EVENT.UPDATE_USER_INFO, cmd);
    },

    doNotifyUser : function () {
        localNotificationMgr.cancelAllNotification();

        // create notify
        let notiID = 1;
        const lbNoti = "QiuQiu Gaple Domino";
        let today = new Date();
        const constTimes = [8, 19];
        const constTitle = ["100.000+ emas gratis","🎮 Gold gratis"];
        const constContent = ["🎮 Dapatkan Emas sekarang dan mainkan QiuQiu ya !!!","100.000+ Gold menunggumu"];
        let arNextTime = [0,0];

        let tomorrow = new Date(today);
        if(gameMgr.isDayInstall()) {
            tomorrow.setDate(today.getDate() + 1);
            for(let s in constTimes) {
                tomorrow.setHours(constTimes[s], StringUtility.randomInt(5, 55), 0, 0);
                arNextTime[s] = tomorrow.getTime();
            }
        }
        else {
            tomorrow.setDate(today.getDate() + 1);
            tomorrow.setHours(constTimes[0], StringUtility.randomInt(5, 55), 0, 0);
            arNextTime[0] = tomorrow.getTime();
        }

        for(let s in arNextTime) {
            if(arNextTime[s] <= 0) continue;
            JSLog.d(">>LocalNotification ",s,constTitle[s], constContent[s]);
            localNotificationMgr.addNotify(notiID, arNextTime[s], lbNoti, constTitle[s], constContent[s]);
        }
    },

    /**
     * @return {UserInfo}
     */
    getUserInfo : function () {
        return this.userInfo;
    },

    /* region APIs */

    /**
     * @return {number}
     */
    getUserId: function () {
        return this.userInfo.getUserId();
    },

    /**
     * @return {string}
     */
    getAvatarURL: function () {
        return this.userInfo.getAvatarURL();
    },

    /**
     * @return {number}
     */
    getGold: function () {
        return this.userInfo.getGold();
    },

    /**
     * @return {number}
     */
    getDiamond: function () {
        return this.userInfo.getDiamond();
    },

    /**
     * @return {number}
     */
    getLevel: function () {
        return this.userInfo.getLevel();
    },

    /**
     * @return {string}
     */
    getUserName: function () {
        return this.userInfo.getUserName();
    },

    /**
     * @return {string}
     */
    getDisplayName: function () {
        return this.userInfo.getDisplayName();
    },

    /**
     * @return {number}
     */
    getLevelPercent: function () {
        return this.userInfo.getLevelPercent();
    },

    /**
     * @return {number}
     */
    getQQTotalMatches: function() {
        return this.userInfo.getQQTotalMatches();
    },

    /**
     * @return {number}
     */
    getQQWinRate: function() {
        return this.userInfo.getQQWinRate();
    },

    /**
     * @return {number}
     */
    getQQStyle: function() {
        return this.userInfo.getQQStyle();
    },

    /**
     * @return {number}
     */
    getGapleTotalMatches: function() {
        return this.userInfo.getGapleTotalMatches();
    },

    /**
     * @return {number}
     */
    getGapleWinRate: function() {
        return this.userInfo.getGapleWinRate();
    },

    /**
     * @return {number}
     */
    getGapleTime: function() {
        return this.userInfo.getGapleTime();
    }

    /* endregion APIs */
});

// region UserMgr Instance
UserMgr._inst = null;
UserMgr.instance = function() {
    if(!UserMgr._inst) {
        UserMgr._inst = new UserMgr();
    }
    return UserMgr._inst;
}

/**
 * @type {UserMgr}
 */
const userMgr = UserMgr.instance();
// endregion

// region Event Dispatch
UserMgr.EVENT = {};
UserMgr.EVENT.GET_USER_INFO = "userMgrEventGetUserInfo";
UserMgr.EVENT.UPDATE_USER_INFO = "userMgrEventUpdateUserInfo";
// endregionFJ

// region Packet
UserMgr.CMD = {};
UserMgr.CMD.CMD_UPDATE_USER_INFO    = 1007;
UserMgr.CMD.CMD_GET_USER_INFO       = 1001;
UserMgr.CMD.CMD_USER_LEVEL_INFO     = 1101;
UserMgr.CMD.CMD_USER_LEVEL_UP       = 1102;
UserMgr.CMD.CMD_OTHER_LEVEL_INFO    = 1103;
// endregion