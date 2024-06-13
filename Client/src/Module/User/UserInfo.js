/**
 * @class
 * @extends cc.Class
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
 * @property {number} qqStyle a number between 0 and 1
 * @property {number} gapleTotalMatches
 * @property {number} gapleWinRate
 * @property {number} gapleTime number of gaple time
 */
const UserInfo = cc.Class.extend({
    ctor: function () {
        this.userId = 0;
        this.userName = "";
        this.displayName = "";
        this.avatarURL = "";

        this.gold = 0;
        this.diamond = 0;

        this.level = 0;
        this.levelPercent = 0;

        this.qqTotalMatches = 0;
        this.qqWinRate = 0;
        this.qqStyle = 0;

        this.gapleTotalMatches = 0;
        this.gapleWinRate = 0;
        this.gapleTime = 0;

        this.autoBuyIn = true;
    },

    /**
     * @param {number} userId
     */
    setUserId: function(userId) {
        this.userId = userId;
    },

    /**
     * @return {number}
     */
    getUserId: function() {
        return this.userId;
    },

    /**
     * @param {string} userName
     */
    setUserName: function(userName) {
        this.userName = userName;
    },

    /**
     * @return {string}
     */
    getUserName: function() {
        if (this.userName === "")
            return this.displayName;
        return this.userName;
    },

    /**
     * @param {string} displayName
     */
    setDisplayName: function(displayName) {
        this.displayName = displayName;
    },

    /**
     * @return {string}
     */
    getDisplayName: function() {
        return StringUtility.convertUTF8String(this.displayName);
    },

    /**
     * @param {string} avatarURL
     */
    setAvatarURL: function(avatarURL) {
        this.avatarURL = avatarURL;
    },

    /**
     * @return {string}
     */
    getAvatarURL: function() {
        return this.avatarURL;
    },

    /**
     * @param {number} gold
     */
    setGold: function(gold) {
        this.gold = gold;
    },

    /**
     * @return {number}
     */
    getGold: function () {
        return this.gold;
    },

    /**
     * @param {number} diamond
     */
    setDiamond: function(diamond) {
        this.diamond = diamond;
    },

    /**
     * @return {number}
     */
    getDiamond: function () {
        return this.diamond;
    },

    /**
     * @param {number} level
     */
    setLevel: function(level) {
        this.level = level;
    },

    /**
     * @return {number}
     */
    getLevel: function () {
        return this.level;
    },

    /**
     * @param {number} levelPercent
     */
    setLevelPercent: function(levelPercent) {
        this.levelPercent = levelPercent;
    },

    /**
     * @return {number}
     */
    getLevelPercent: function () {
        return this.levelPercent;
    },

    /**
     * @param {number} qqTotalMatches
     */
    setQQTotalMatches: function(qqTotalMatches) {
        this.qqTotalMatches = qqTotalMatches;
    },

    /**
     * @return {number}
     */
    getQQTotalMatches: function() {
        return this.qqTotalMatches;
    },

    /**
     * @param {number} qqWinRate
     */
    setQQWinRate: function(qqWinRate) {
        this.qqWinRate = qqWinRate;
    },

    /**
     * @return {number}
     */
    getQQWinRate: function() {
        return this.qqWinRate;
    },

    /**
     * @param {number} qqStyle
     */
    setQQStyle: function(qqStyle) {
        this.qqStyle = qqStyle;
    },

    /**
     * @return {number}
     */
    getQQStyle: function() {
        return this.qqStyle;
    },

    /**
     * @param {number} gapleTotalMatches
     */
    setGapleTotalMatches: function(gapleTotalMatches) {
        this.gapleTotalMatches = gapleTotalMatches;
    },

    /**
     * @return {number}
     */
    getGapleTotalMatches: function() {
        return this.gapleTotalMatches;
    },

    /**
     * @param {number} gapleWinRate
     */
    setGapleWinRate: function(gapleWinRate) {
        this.gapleWinRate = gapleWinRate;
    },

    /**
     * @return {number}
     */
    getGapleWinRate: function() {
        return this.gapleWinRate;
    },

    /**
     * @param {number} gapleTime
     */
    setGapleTime: function(gapleTime) {
        this.gapleTime = gapleTime;
    },

    /**
     * @return {number}
     */
    getGapleTime: function() {
        return this.gapleTime;
    },

    /**
     * @param {boolean} autoBuyIn
     */
    setAutoBuyIn: function(autoBuyIn) {
        this.autoBuyIn = autoBuyIn;
    },

    /**
     * @return {boolean}
     */
    isAutoBuyIn: function() {
        return this.autoBuyIn;
    }
});
