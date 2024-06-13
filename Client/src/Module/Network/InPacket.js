engine.InPacket.extend = cc.Class.extend;

const CmdReceivedCommon = engine.InPacket.extend({

    ctor: function (pkg) {
        this._super();
        this.init(pkg);
    },

    readData: function () {

    },

    /**
     * @return {string[]}
     */
    getStrings: function(){
        const arr = [];
        const size = this.getShort();
        for(let i = 0; i < size; i++){
            arr.push(this.getString());
        }
        return arr;
    },

    /**
     * @return {number[]}
     */
    getLongs: function () {
        const arr = [];
        const size = this.getShort();
        for (let i = 0; i < size; i++) {
            arr.push(parseInt(this.getDouble()));
        }
        return arr;
    },

    /**
     * @return {number[]}
     */
    getDoubles: function(){
        const arr = [];
        const size = this.getShort();
        for(let i = 0; i < size; i++){
            arr.push(this.getDouble());
        }
        return arr;
    },

    /**
     * @return {number[]}
     */
    getRealLongs: function () {
        const arr = [];
        const size = this.getShort();
        for (let i = 0; i < size; i++) {
            arr.push(parseInt(this.getLong()));
        }
        return arr;
    },

    /**
     * @return {number[]}
     */
    getInts: function () {
        const arr = [];
        const size = this.getShort();
        for (let i = 0; i < size; i++) {
            arr.push(this.getInt());
        }
        return arr;
    },

    /**
     * @return {boolean[]}
     */
    getBools: function () {
        const arr = [];
        const size = this.getShort();
        for (let i = 0; i < size; i++) {
            arr.push(this.getBool());
        }
        return arr;
    },

    /**
     * @return {number[]}
     */
    getBytes: function () {
        const arr = [];
        const size = this.getShort();
        for (let i = 0; i < size; i++) {
            arr.push(this.getByte());
        }
        return arr;
    },

    /**
     * @return {number[]}
     */
    getShorts: function () {
        const arr = [];
        const size = this.getShort();
        for (let i = 0; i < size; i++) {
            arr.push(this.getShort());
        }
        return arr;
    }
});