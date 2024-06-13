// region InPacket

/**
 * @class
 * @extends CmdReceivedCommon
 * @property {number} userId
 * @property {string} userName
 * @property {string} displayName
 * @property {string} avatarURL
 * @property {number} gold
 * @property {number} diamond
 * @property {number} level
 * @property {number} levelPercent
 * @property {number} qqTotalMatches
 * @property {number} qqWinRate
 * @property {number} qqStyle
 * @property {number} gapleTotalMatches
 * @property {number} gapleWinRate
 * @property {number} gapleTime
 * @property {boolean} autoBuyIn
 */
const CmdReceivedUserInfo = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.userId = this.getInt();
        this.displayName = this.getString();
        this.userName = this.getString();
        this.avatarURL = this.getString();

        this.gold = this.getDouble();
        this.diamond = this.getDouble();

        this.level = this.getInt();
        this.levelPercent = this.getInt();

        this.qqTotalMatches = this.getInt();
        this.qqWinRate = this.getInt();
        this.qqStyle = parseFloat(this.getString());

        this.gapleTotalMatches = this.getInt();
        this.gapleWinRate = this.getInt();
        this.gapleTime = this.getInt();

        this.autoBuyIn = this.getInt() !== 0 //0: khong, 1: co
    }
});

/**
 * @class
 * @extends CmdReceivedCommon
 * @property {number} userId
 * @property {number} gold
 * @property {number} diamond
 * @property {number} level
 * @property {number} levelPercent
 * @property {number} qqTotalMatches
 * @property {number} qqWinRate
 * @property {number} qqStyle
 * @property {number} gapleTotalMatches
 * @property {number} gapleWinRate
 * @property {number} gapleTime
 * @property {boolean} autoBuyIn
 * @property {number} nChair
 * @property {number} chip
 */
const CmdReceivedUpdateInfoUser = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.userId = this.getInt();

        this.gold = this.getDouble();
        this.diamond = this.getDouble();

        this.level = this.getInt();
        this.levelPercent = this.getInt();

        this.qqTotalMatches = this.getInt();
        this.qqWinRate = this.getInt();
        this.qqStyle = parseFloat(this.getString());

        this.gapleTotalMatches = this.getInt();
        this.gapleWinRate = this.getInt();
        this.gapleTime = this.getInt();

        this.nChair = this.getByte();
        this.chip = this.getDouble();

        this.autoBuyIn = this.getInt() !== 0 //0: khong, 1: co
    }
});

// endregion

// region OutPacket

/**
 * @class
 * @extends CmdSendCommon
 */
const CmdSendGetUserInfo = CmdSendCommon.extend({
    ctor:function()
    {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(UserMgr.CMD.CMD_GET_USER_INFO);

        this.putData();
    },

    putData:function(){
        this.packHeader();
        this.putInt(parseInt(gameMgr.getAppVersion()));
        this.updateSize();
    }
});

/**
 * @class
 * @extends CmdSendCommon
 */
const CmdSendGetLevelInfo = CmdSendCommon.extend({
    ctor:function()
    {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(UserMgr.CMD.CMD_USER_LEVEL_INFO);

        this.putData();
    },

    putData:function(){
        this.packHeader();
        this.updateSize();
    }
});

/**
 * @class
 * @extends CmdSendCommon
 */
const CmdSendOtherLevelInfo = CmdSendCommon.extend({
    ctor:function(level)
    {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(UserMgr.CMD.CMD_OTHER_LEVEL_INFO);

        this.putData(level);
    },

    putData:function(level){
        this.packHeader();
        this.putInt(level);
        this.updateSize();
    }
});

// endregion