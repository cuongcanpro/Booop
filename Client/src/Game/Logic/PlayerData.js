const PlayerData = cc.Class.extend({
    ctor: function (index) {
        this.numBig = 0;
        this.index = index;
        this.playerInfo = new UserInfo();
    },

    newGame: function () {
        this.numBig = 0;
    },

    /**
     * @return {PieceData.Type}
     */
    getBigType: function () {
        if (this.index === 0) {
            return PieceData.Type.BIG_1;
        }
        return PieceData.Type.BIG_2;
    },

    /**
     * @return {PieceData.Type}
     */
    getSmallType: function () {
        if (this.index === 0) {
            return PieceData.Type.SMALL_1;
        }
        return PieceData.Type.SMALL_2;
    },
})