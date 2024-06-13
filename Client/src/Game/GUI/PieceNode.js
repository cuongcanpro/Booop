/**
 * @property {PieceData} data
 */
const PieceNode = cc.Node.extend({
    ctor: function () {
        this._super();
        this.iconItem = cc.Sprite.create("res/opponent_small_1.png");
        this.addChild(this.iconItem);
        this.data = new PieceData(PieceData.Type.NONE, 0);
        this.setPieceData(PieceData.Type.NONE, 0);
    },

    /**
     * @param {PieceData.Type} pieceType
     * @param {number} chair
     */
    setPieceData: function (pieceType, chair) {
        this.data.setInfo(pieceType, chair);
        if (this.data.isNone()) {
            this.setVisible(false);
            return;
        }
        else {
            this.setVisible(true);
        }
        this.iconItem.setTexture(gameLogic.getResourcePiece(this.data));
    },

    exchangePiece: function () {
        this.data.exchangeType();
        this.setPieceData(this.data.type, this.data.chair);
    },

    /**
     * @return {PieceData.Type}
     */
    getPieceType: function () {
        return this.data.type;
    },

    /**
     * @returns {PieceData}
     */
    getPieceData: function () {
        return this.data;
    },

    isBigPieceNode: function () {
        return this.data.isBig();
    },

    isSmallPieceNode: function () {
        return this.data.isSmall();
    }
})