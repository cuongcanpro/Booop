/**
 * @property {BoardData} boardData
 */
const GameLogic = cc.Class.extend( {
    ctor: function () {
        /** @type PlayerData[] */
        this.arrPlayerData = [];
        for (let i = 0; i < ConfigGame.NUM_PLAYER; i++) {
            this.arrPlayerData[i] = new PlayerData(i);
        }
        this.currentTurn = 0;
        this.myChair = 0;
        /** @type BoardData */
        this.boardData = new BoardData();
    },

    newGame: function () {
        this.boardScene = sceneMgr.getMainLayer();
        this.currentTurn = 0;
        this.boardData.newGame();
        for (let player of this.arrPlayerData)
            player.newGame();

        // maybe send from server
        this.currentTurn = 1;
    },

    /**
     * @param {CmdReceivedJoinRoomSuccess} cmd
     */
    joinRoomSuccess: function (cmd) {
        cc.log("CmdReceivedJoinRoomSuccess:: " + JSON.stringify(cmd));
        this.myChair = cmd.myChair;
        this.hasOpponent = cmd.hasOpponent;
        if (this.hasOpponent) {
            this.arrPlayerData[1].playerInfo.userName = cmd.username;
        }
        this.boardScene = sceneMgr.openScene(BoardScene.className);
        this.boardScene.joinRoomSuccess();
    },

    /**
     * @param {CmdReceivedNewUserJoinRoom} cmd
     */
    newUserJoinRoom: function (cmd) {
        cc.log("CmdReceivedNewUserJoinRoom:: " + JSON.stringify(cmd));
        this.arrPlayerData[1].playerInfo.userName = cmd.username;
        this.boardScene.newUserJoinRoom();
    },

    /**
     * @param {CmdReceivedNotifyStartGame} cmd
     */
    notifyStartGame: function (cmd) {
        this.boardScene.notifyStartGame(cmd);
    },

    /**
     * run without server
     */
    autoChangeTurn: function () {
        this.currentTurn = 1 - this.currentTurn;
        this.changeTurn(this.currentTurn);
    },

    /**
     * @param {CmdReceivedChangeTurn} cmd
     */
    changeTurn: function (cmd) {
        cc.log("CmdReceivedChangeTurn:: " + JSON.stringify(cmd));
        this.currentTurn = this.convertToClientChair(cmd.chair);
        this.boardScene.changeTurn(this.currentTurn, cmd.turnTime);
    },

    /**
     * @param {CmdReceivedPlacePiece} cmd
     */
    placePiece: function (cmd) {
        cc.log("CmdReceivedPlacePiece:: " + JSON.stringify(cmd));
        let chairConvert = this.convertToClientChair(cmd.chair)
        this.listConvertCell = cmd.listConvertCell;
        this.listMoveCell = cmd.listMoveCell;
        this.listSelectCell = cmd.listSelectCell;
        this.boardData.setPieceData(cmd.row, cmd.column, cmd.pieceType, chairConvert);
        cc.log("Chair Convert " + chairConvert);

        // change data when auto move
        for (let cell of this.listMoveCell) {
            let pieceData = this.boardData.getPieceData(cell.row, cell.column);
            cell.chair = pieceData.chair;
            cell.pieceType = pieceData.type;
            cc.log("Auto move chair " + cell.chair + " " + pieceData.type);
            if (this.inBound(cell.newRow, cell.newColumn)) {
                this.boardData.setPieceData(cell.newRow, cell.newColumn, pieceData.type, cell.chair);
            }
            this.boardData.setPieceData(cell.row, cell.column, PieceData.Type.NONE, 0);
        }

        // change data when auto convert
        for (let list of this.listConvertCell) {
            for (let cell of list) {
                let pieceData = this.boardData.getPieceData(cell.row, cell.column);
                cell.pieceType = pieceData.type;
                cell.chair = pieceData.chair;
                // Todo: Need to check again
                if (pieceData.isSmall() && pieceData.isPlayer1()) {
                    this.arrPlayerData[ConfigGame.MY_INDEX].numBig++;
                }
                else if (pieceData.isSmall() && pieceData.isPlayer2()) {
                    this.arrPlayerData[ConfigGame.OTHER_INDEX].numBig++;
                }
                this.boardData.setPieceData(cell.row, cell.column, PieceData.Type.NONE, 0);
            }
        }

        this.boardScene.placePiece(cmd.row, cmd.column, cmd.pieceType, chairConvert);
    },

    /**
     * @param {CmdReceivedConfirmConvertRow} cmd
     */
    confirmConvertRow: function (cmd) {
        cc.log("CmdReceivedConfirmConvertRow:: " + JSON.stringify(cmd));
        for (let cell of cmd.listConvert) {
            let pieceData = this.boardData.getPieceData(cell.row, cell.column);
            cell.chair = pieceData.chair;
            cell.pieceType = pieceData.type;
            this.boardData.setPieceData(cell.row, cell.column, PieceData.Type.NONE, 0);

            // Todo: Need to check again
            if (pieceData.isSmall()) {
                this.arrPlayerData[this.convertToClientChair(cmd.chair)].numBig++;
            }
        }
        this.boardScene.convertOneRow(cmd.listConvert);
    },

    selectArrayPiece: function (listSelect) {
        this.listSelect = listSelect;
        this.boardScene.selectArrayPiece(listSelect);
    },

    /**
     * @param {CmdReceivedResult} cmd
     */
    resultGame: function (cmd) {
        cc.log("CmdReceivedResult:: " + JSON.stringify(cmd));
        this.chairWin = this.convertToClientChair(cmd.chair);
        // this.boardScene.endGame(listCell);
    },

    setListAutoMoveCell: function (row, column, pieceData) {
        this.listAutoMoveCell = this.boardData.getListAutoMoveCell(row, column, pieceData);
    },

    inBound: function (rowCheck, columnCheck) {
        return rowCheck >= 0 && rowCheck < ConfigGame.BOARD_SIZE && columnCheck >= 0 && columnCheck < ConfigGame.BOARD_SIZE;
    },

    convertToClientChair: function (chairServer) {
        return Math.abs(this.myChair - chairServer);
    },

    convertToServerChair: function (chairClient) {
        return Math.abs(this.myChair - chairClient);
    },

    /**
     * @param {PieceData} pieceData
     */
    getResourcePiece: function (pieceData) {
        let chairServer = this.convertToServerChair(pieceData.chair);
        if (pieceData.isBig())
            return "res/opponent_big_" + (chairServer + 1) + ".png";
        else
            return "res/opponent_small_" + (chairServer + 1) + ".png";
    }
})


// region GameLogic Instance
GameLogic._inst = null;
GameLogic.instance = function() {
    if(!GameLogic._inst) {
        GameLogic._inst = new GameLogic();
    }
    return GameLogic._inst;
}
const gameLogic = GameLogic.instance();
// endregion