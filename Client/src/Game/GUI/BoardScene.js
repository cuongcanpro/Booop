let BoardScene = BaseLayer.extend({
    ctor: function () {
        this._super();
        this.currentPiece = null;
        this.arrPlayer = [];
        this.arrayCell = [];
        this.arrGhost = [];
        this.lastCell = null;
        this.indexSelect = -1;

        this.initGUI();
    },

    initGUI: function () {
        this.initBoardGroup();
        this.initPlayer();
        this.initGhost();

        let resource = "res/brickWhite.png";
        let btnHistory = ccui.Button.create(resource, resource, resource);
        btnHistory.setTitleText("History");
        btnHistory.setTitleColor(cc.color("#000000"));
        btnHistory.setPosition(100, 150);
        btnHistory.setTitleFontSize(20);
        this.addChild(btnHistory);
        btnHistory.addClickEventListener(() => {
            cc.log("Click ======= ");
           inGameMgr.sendPacketCMD(InGameMgr.CMD.HISTORY);
        });

        this.currentPiece = new PieceNode();
        this.addChild(this.currentPiece);

        const listener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan.bind(this),
            onTouchMoved: this.onTouchMoved.bind(this),
            onTouchEnded: this.onTouchEnded.bind(this)
        });
        cc.eventManager.addListener(listener, this);
    },

    initBoardGroup: function () {
        let size = ConfigGame.BOARD_SIZE * CellNode.SIZE;
        this.startX = cc.winSize.width * 0.5 - size * 0.5;
        this.startY = cc.winSize.height * 0.5 - size * 0.5;
        this.nodeBgCell = cc.Node.create();
        this.addChild(this.nodeBgCell);
        for (let i = 0; i < ConfigGame.BOARD_SIZE; i++) {
            this.arrayCell[i] = [];
            for (let j = 0; j < ConfigGame.BOARD_SIZE; j++) {
                let cell = new CellNode(i, j);
                this.addChild(cell);
                this.nodeBgCell.addChild(cell.bg);
                cell.setPosition(this.startX + CellNode.SIZE * (j + 0.5), this.startY + CellNode.SIZE * (i + 0.5));
                cell.bg.setPosition(cell.getPosition());
                this.arrayCell[i][j] = cell;
            }
        }
    },

    initPlayer: function () {
        for (let i = 0; i < ConfigGame.NUM_PLAYER; i++) {
            this.arrPlayer[i] = new PlayerUI(i);
            this.addChild(this.arrPlayer[i]);
            if (i === ConfigGame.MY_INDEX) {
                this.arrPlayer[i].setPosition(0, cc.winSize.height * 0.05);
            }
            else {
                this.arrPlayer[i].setPosition(cc.winSize.width, cc.winSize.height * 0.95);
            }
        }
    },

    initGhost: function () {
        for (let i = 0; i < ConfigGame.NUM_PLAYER; i++) {
            this.arrGhost[i] = new Ghost();
            this.addChild(this.arrGhost[i]);
        }
    },

    onEnter: function () {
        this._super();
        this.newGame();
    },

    newGame: function () {
        for (let player of this.arrPlayer)
            player.newGame();
        for (let i = 0; i < ConfigGame.BOARD_SIZE; i++) {
            for (let j = 0; j < ConfigGame.BOARD_SIZE; j++) {
                let cell = this.arrayCell[i][j];
                cell.newGame();
            }
        }
        this.lastCell = null;
        gameLogic.newGame();
    },

    joinRoomSuccess: function () {
        if (gameLogic.hasOpponent) {
            this.arrPlayer[ConfigGame.OTHER_INDEX].setVisible(true);
        }
        else {
            this.arrPlayer[ConfigGame.OTHER_INDEX].setVisible(false);
        }
        this.newGame();
    },

    newUserJoinRoom: function () {
        this.arrPlayer[1].setVisible(true);
    },

    notifyStartGame: function (time) {

    },

    changeTurn: function (chair, time) {
        this.arrPlayer[1 - gameLogic.currentTurn].stopTurn();
        this.arrPlayer[gameLogic.currentTurn].changeTurn();
    },

    /* region Touch Handler */
    onTouchBegan: function (touch, event) {
        if (gameLogic.currentTurn !== ConfigGame.MY_INDEX)
            return false;
        let pos = touch.getLocation();
        if (this.indexSelect >= 0) {
            // select group pieces to convert
            this.setAllCellToNormal();
            gameLogic.convertArrayPiece(gameLogic.listSelect[this.indexSelect]);
            this.indexSelect = -1;
            return true;
        }
        let pieceType = this.arrPlayer[ConfigGame.MY_INDEX].getTouchPieceType(pos);
        this.currentPiece.setPieceData(pieceType, ConfigGame.MY_INDEX);
        if (this.currentPiece.isVisible()) {
            this.currentPiece.setVisible(true);
            this.currentPiece.setPosition(pos.x, pos.y + BoardScene.PAD_TOUCH);
        }
        return true;
    },

    onTouchMoved: function (touch, event) {
        let pos = touch.getLocation();
        pos.y = pos.y + BoardScene.PAD_TOUCH;
        if (this.currentPiece.isVisible()) {
            this.setTouchCoordinate(pos);
            if (gameLogic.inBound(this.currentRow, this.currentColumn) && gameLogic.boardData.getPieceData(this.currentRow, this.currentColumn).isNone()) {
                if ((this.lastCell && (this.lastCell.row !== this.currentRow || this.lastCell.column !== this.currentColumn)) || !this.lastCell) {
                    if (this.lastCell)
                        this.lastCell.setState(CellNode.State.NORMAL);
                    // find move cell
                    this.hideAllMove();
                    this.showAllMove(this.currentPiece.getPieceData());
                }
                this.arrayCell[this.currentRow][this.currentColumn].setState(CellNode.State.VISITED);
                this.lastCell = this.arrayCell[this.currentRow][this.currentColumn];
            }
            else {
                if (this.lastCell) {
                    this.lastCell.setState(CellNode.State.NORMAL);
                    this.hideAllMove();
                }
                this.lastCell = null;
            }
            this.currentPiece.setPosition(pos.x, pos.y);
        }
        return true;
    },

    onTouchEnded: function (touch, event) {
        if (this.currentPiece.isVisible()) {
            if (this.lastCell) {
                this.lastCell.setState(CellNode.State.NORMAL);
                this.hideAllMove();

                // send to Server
                inGameMgr.sendPlacePiece(this.lastCell.row, this.lastCell.column, this.currentPiece.getPieceType());

                // auto action
                // gameLogic.placePiece(this.lastCell.row, this.lastCell.column, this.currentPiece.getPieceType());
            }
            else {
                this.arrPlayer[gameLogic.currentTurn].revertPiece(this.currentPiece.getPieceType(), this.currentPiece.getPosition(), false);

            }
            // this.currentPiece.setVisible(false)
        }
        // this.currentPiece.setVisible(false);
    },
    /* endregion Touch Handler */

    /**
     * @param {number} row
     * @param {number} column
     * @param {PieceData.Type} pieceType
     * @param {number} chair
     */
    placePiece: function (row, column, pieceType, chair) {
        cc.log("Place piece " + chair);
        this.currentPiece.setVisible(false);
        let pos = cc.p(0, 0);
        if (chair === ConfigGame.MY_INDEX) {
            // move from currentPiece to cell
            if (this.currentPiece.isVisible()) {
                pos = this.currentPiece.getPosition();
            }
        }
        else {
            // move from player to cell
            pos = this.arrPlayer[ConfigGame.OTHER_INDEX].removePiece(pieceType);
        }
        this.arrayCell[row][column].setPieceFromPos(pieceType, chair, pos);

        // auto move cell
        this.runAction(cc.sequence(
           cc.delayTime(0.5),
           cc.callFunc(this.autoMoveCell.bind(this))
        ));
    },

    /**
     * Move cell around piece
     */
    autoMoveCell: function () {
        let listMove = gameLogic.listMoveCell;
        let timeDelay = 0.0;
        for (let cellMove of listMove) {
            let pos = this.arrayCell[cellMove.row][cellMove.column].getPosition();
            if (gameLogic.inBound(cellMove.newRow, cellMove.newColumn)) {
                this.arrayCell[cellMove.newRow][cellMove.newColumn].setPieceFromPos(cellMove.pieceType, cellMove.chair, pos);
            }
            else {
                // move out cell
                this.arrPlayer[cellMove.chair].revertPiece(cellMove.pieceType, pos, false);
            }
            this.arrayCell[cellMove.row][cellMove.column].setPiece(PieceData.Type.NONE);
            timeDelay = 0.5;
        }
        this.runAction(
            cc.sequence(
                cc.delayTime(timeDelay),
                cc.callFunc(this.convertArrayPiece.bind(this))
            )
        );
        // this.moveGhost(0, 1, 1);
    },

    /**
     * Convert array pieces to big pieces
     */
    convertArrayPiece: function () {
        let listConvert = gameLogic.listConvertCell;
        let timeDelay = 0;
        if (listConvert.length > 0) {
            // auto move three piece
            for (let list of listConvert) {
                this.convertOneRow(list);
            }
            timeDelay = 1.5;
        }
        this.runAction(
            cc.sequence(
                cc.delayTime(timeDelay),
                cc.callFunc(this.selectArrayPiece.bind(this))
            )
        );
    },

    convertOneRow: function (listCell) {
        for (let cell of listCell) {
            let pos = this.convertToWorldSpace(this.arrayCell[cell.row][cell.column].getPosition());
            this.arrPlayer[cell.chair].revertPiece(cell.pieceType, pos, true);
            this.arrayCell[cell.row][cell.column].setPiece(PieceData.Type.NONE);
        }
    },

    selectArrayPiece: function () {
        if (gameLogic.listSelectCell.length > 0) {
            // guess user to select three pieces
            this.indexSelect = -1;
            this.suggestSelect();
        }
    },

    suggestSelect: function() {
        this.indexSelect++;
        if (this.indexSelect === gameLogic.listSelectCell.length) {
            this.indexSelect = 0;
        }
        this.setAllCellToNormal();
        const listCell = gameLogic.listSelectCell[this.indexSelect];
        cc.log("Index " + this.indexSelect);
        cc.log("List cell " + JSON.stringify(listCell));
        for (let cell of listCell) {
            this.arrayCell[cell.row][cell.column].setState(CellNode.State.SELECT);
        }
        this.runAction(
            cc.sequence(
                cc.delayTime(1.0),
                cc.callFunc( this.suggestSelect.bind(this))
            )
        );
    },

    moveGhost: function (playerId, row, column) {
        this.arrGhost[playerId].moveTo(row, column);
    },

    /**
     * @param {ConvertCell[]} listCell
     */
    endGame: function (listCell) {
        for (let cell of listCell) {
            this.arrayCell[cell.row][cell.column].effectEndGame();
        }
        this.runAction(
            cc.sequence(
                cc.delayTime(2.0),
                cc.callFunc(
                    () => {
                        Dialog.showOkDialogWithAction("Player " + gameLogic.playerWin + " Win", this, function () {
                            this.newGame();
                        });
                    }
                )
            )
        )
    },

    /**
     * @param {cc.Point} touchPos
     * @return {cc.Point}
     */
    setTouchCoordinate: function (touchPos) {
        const pos = this.convertToNodeSpace(touchPos);
        this.currentRow = Math.floor((pos.y - this.startY) / CellNode.SIZE);
        this.currentColumn = Math.floor((pos.x - this.startX) / CellNode.SIZE);
        return cc.p(this.currentRow, this.currentColumn);
    },

    hideAllMove: function () {
        for (let i = 0; i < ConfigGame.BOARD_SIZE; i++)
            for (let j = 0; j < ConfigGame.BOARD_SIZE; j++) {
                this.arrayCell[i][j].hideMove();
            }
    },

    /**
     * @param {PieceData} pieceData
     */
    showAllMove: function (pieceData) {
        gameLogic.setListAutoMoveCell(this.currentRow, this.currentColumn, pieceData);
        for (let cell of gameLogic.listAutoMoveCell) {
            this.arrayCell[cell.row][cell.column].showMove(cell.direction);
        }
    },

    setAllCellToNormal: function () {
        for (let i = 0; i < ConfigGame.BOARD_SIZE; i++) {
            for (let j = 0; j < ConfigGame.BOARD_SIZE; j++) {
                let cell = this.arrayCell[i][j];
                cell.setState(CellNode.State.NORMAL);
            }
        }
    }
})

BoardScene.className = "BoardScene";
BoardScene.PAD_TOUCH = 30;

BoardScene.TouchState = {};
BoardScene.TouchState.NONE = 0;
BoardScene.TouchState.HOLD_ITEM = 1;