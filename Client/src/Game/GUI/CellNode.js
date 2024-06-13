let CellNode = cc.Node.extend({
    ctor: function (row, column) {
        this._super();
        this.row = row;
        this.column = column;

        this.bg = cc.Scale9Sprite.create("res/brickWhite.png");
        // this.addChild(this.bg);
        this.bg.setContentSize(cc.size(CellNode.SIZE, CellNode.SIZE));

        this.iconArrow = cc.Sprite.create("res/iconArrow.png");
        this.addChild(this.iconArrow);
        this.iconArrow.setAnchorPoint(cc.p(0.5, 0));
        this.iconArrow.setVisible(false);

        this.piece = new PieceNode();
        this.addChild(this.piece);

        this.setState(CellNode.State.NORMAL);
        // this.caculateZOrder();
    },

    newGame: function () {
        this.iconArrow.setVisible(false);
        this.setState(CellNode.State.NORMAL);
        this.piece.setPieceData(PieceData.Type.NONE, 0);
        this.piece.setScale(1);
        this.piece.stopAllActions();
    },

    /**
     * @param {CellNode.State} state
     */
    setState: function (state) {
        this.cellState = state;
        switch (state) {
            case CellNode.State.NORMAL:
                this.bg.runAction(cc.tintTo(0.2, cc.color(150, 150, 150)));
                break;
            case CellNode.State.VISITED:
                this.bg.runAction(cc.tintTo(0.2, cc.color(240, 240, 240)));
                break;
            case CellNode.State.SELECT:
                this.bg.runAction(cc.tintTo(0.2, cc.color(0, 240, 0)));
                break;
        }
    },

    /**
     * @param {MoveCell.Direction} direction
     */
    showMove: function (direction) {
        this.iconArrow.setVisible(true);
        let angle = 0;
        switch (direction) {
            case MoveCell.Direction.UP:
                angle = 0;
                break;
            case MoveCell.Direction.RIGHT_UP:
                angle = 45;
                break;
            case MoveCell.Direction.RIGHT:
                angle = 90;
                break;
            case MoveCell.Direction.RIGHT_DOWN:
                angle = 135;
                break;
            case MoveCell.Direction.DOWN:
                angle = 180;
                break;
            case MoveCell.Direction.LEFT_DOWN:
                angle = 225;
                break;
            case MoveCell.Direction.LEFT:
                angle = 270;
                break;
            case MoveCell.Direction.LEFT_UP:
                angle = 315;
                break;
        }
        this.iconArrow.setScaleY(0);
        this.iconArrow.setRotation(angle);
        this.iconArrow.runAction(
            cc.spawn(
                // cc.rotateTo(0.2, angle),
                cc.scaleTo(0.4, 1).easing(cc.easeBackOut())
            )
        );
    },

    hideMove: function () {
        this.iconArrow.setVisible(false);
    },

    /**
     * Move Piece form other Cell
     * @param {PieceData.Type} pieceType
     * @param {cc.Point} pos
     */
    changePiece: function (pieceType, pos) {
        this.setPiece(pieceType);
        pos = this.convertToNodeSpace(pos);
        this.piece.setPosition(pos);
        let beginPos = pos;
        let endPos = cc.p(0, 0);
        let centerPos = cc.p(pos.x * 0.5, pos.y * 0.5 + 50);
        this.piece.runAction(cc.sequence(
            //cc.moveTo(0.3, cc.p(0, 0)),
            cc.bezierTo(0.5, [beginPos, centerPos, endPos]).easing(cc.easeSineOut()),
            cc.callFunc(() => {
                this.setLocalZOrder(0)
            })
        ));
        this.piece.runAction(cc.sequence(
           cc.scaleTo(0.2, 1.2),
           cc.scaleTo(0.2, 1.0)
        ));
        this.setLocalZOrder(1);
    },

    setPiece: function (pieceType, chair) {
        this.piece.setPieceData(pieceType, chair);
    },

    setPieceFromPos: function (pieceType, chair, pos) {
        this.setPiece(pieceType, chair);
        pos = this.convertToNodeSpace(pos);
        this.piece.setPosition(pos);
        this.piece.runAction(cc.sequence(
            //cc.moveTo(0.3, cc.p(0, 0)),
            cc.moveTo(0.5, 0, 0).easing(cc.easeSineOut()),
            cc.callFunc(() => {
                this.setLocalZOrder(0)
            })
        ));
        this.setLocalZOrder(1);
    },

    effectEndGame: function () {
        this.piece.runAction(cc.repeatForever(
           cc.sequence(
               cc.scaleTo(0.2, 1.1),
               cc.scaleTo(0.2, 1.0)
           )
        ));
    },

    caculateZOrder: function () {
        let zOrder = this.row * ConfigGame.BOARD_SIZE + this.column;
        this.setLocalZOrder(zOrder);
    }
})
CellNode.SIZE = 80;
CellNode.State = {};
CellNode.State.NORMAL = 0;
CellNode.State.VISITED = 1;
CellNode.State.SELECT = 2;
