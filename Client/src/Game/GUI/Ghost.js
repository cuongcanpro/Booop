const Ghost = cc.Node.extend({
    ctor: function () {
        this._super();
        this.row = 0;
        this.column = 0;
        this.direction = Ghost.Direction.LEFT_RIGHT;
        this.iconGhost = cc.Sprite.create("res/iconZP.png");
        this.addChild(this.iconGhost);
    },

    moveTo: function (row, column) {
        this.row = row;
        this.column = column;
        let addRow = 0, addColumn = 0;
        if (this.direction == Ghost.Direction.LEFT_RIGHT || this.direction == Ghost.Direction.RIGHT_LEFT) {
            addColumn = 0.5;
        }
        else {
            addRow = 0.5;
        }
        let pos = cc.p(CellNode.SIZE * (column + addColumn) + gameLogic.boardScene.startX, CellNode.SIZE * (row + addRow) + gameLogic.boardScene.startY);
        this.runAction(cc.moveTo(0.5, pos).easing(cc.easeSineOut()));
    },

})

Ghost.Direction = {};
Ghost.Direction.LEFT_RIGHT = 0;
Ghost.Direction.RIGHT_LEFT = 1;
Ghost.Direction.BOTTOM_TOP = 0;
Ghost.Direction.TOP_BOTTOM = 0;