const BoardData = cc.Class.extend({
    ctor: function () {
        this.arrayPiece = [];
        for (let i = 0; i < ConfigGame.BOARD_SIZE; i++) {
            this.arrayPiece[i] = [];
            for (let j = 0; j < ConfigGame.BOARD_SIZE; j++) {
                this.arrayPiece[i][j] = new PieceData(PieceData.Type.NONE, 0);
            }
        }
    },

    newGame: function () {
        for (let i = 0; i < ConfigGame.BOARD_SIZE; i++) {
            for (let j = 0; j < ConfigGame.BOARD_SIZE; j++) {
                this.arrayPiece[i][j].type = PieceData.Type.NONE;
            }
        }
    },

    /**
     * @param {number} row
     * @param {number} column
     * @param {PieceData.Type} type
     * @param {number} chair
     */
    setPieceData: function (row, column, type, chair) {
        this.arrayPiece[row][column].type = type;
        this.arrayPiece[row][column].chair = chair;
    },

    getPieceData: function (row, column) {
        return this.arrayPiece[row][column];
    },

    /**
     * @param {number} row
     * @param {number} column
     * @param {PieceData} pieceData
     * @returns {MoveCell[]}
     */
    getListAutoMoveCell: function (row, column, pieceData) {
        const listCell = [];
        let rowCheck, columnCheck;
        let startRow = row - 1, startColumn = column - 1;
        let mapDirection = [MoveCell.Direction.LEFT_DOWN, MoveCell.Direction.DOWN, MoveCell.Direction.RIGHT_DOWN, MoveCell.Direction.LEFT, 0,
                            MoveCell.Direction.RIGHT, MoveCell.Direction.LEFT_UP, MoveCell.Direction.UP, MoveCell.Direction.RIGHT_UP];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                rowCheck = startRow + i;
                columnCheck = startColumn + j;
                if (this.inBound(rowCheck, columnCheck) && (rowCheck !== row || columnCheck !== column)) {
                    let piece = this.arrayPiece[rowCheck][columnCheck];
                    if (piece.isNone() === false) {
                        //continue;
                        if (piece.isSmall() || pieceData.isBig()) {
                            let newRow = i - 1 + rowCheck;
                            let newColumn = j - 1 + columnCheck;
                            if (this.inBound(newRow, newColumn) === false || this.arrayPiece[newRow][newColumn].isNone())
                                listCell.push(new MoveCell(rowCheck, columnCheck, newRow, newColumn, piece.type, piece.chair, mapDirection[i * 3 + j]));
                        }
                    }
                }
            }
        }
        cc.log("List Cell " + JSON.stringify(listCell));
        return listCell;
    },

    getListConvert: function () {
        const listConvert = [];
        for (let i = 0; i < ConfigGame.BOARD_SIZE; i++) {
            for (let j = 0; j < ConfigGame.BOARD_SIZE; j++) {
                let arrChange = [cc.p(0, 1), cc.p(1, 1), cc.p(1, 0), cc.p(1, -1)];
                for (let l = 0; l < arrChange.length; l++) {
                    let dRow = arrChange[l].x;
                    let dColumn = arrChange[l].y;
                    let count = 1;
                    let tempArr = [];
                    tempArr.push(new ConvertCell(i, j, this.arrayPiece[i][j].type));
                    for (let k = 1; k < ConfigGame.CELL_TO_EAT; k++) {
                        let rowCheck = i + dRow * k;
                        let columnCheck = j + dColumn * k;
                        if (this.inBound(rowCheck, columnCheck)) {
                            if (this.arrayPiece[rowCheck][columnCheck].checkSamePlayer(this.arrayPiece[i][j])) {
                                tempArr.push(new ConvertCell(rowCheck, columnCheck, this.arrayPiece[rowCheck][columnCheck].type));
                                count++;
                            }
                            else {
                                break;
                            }
                        }
                        else {
                            break;
                        }
                    }
                    if (count === ConfigGame.CELL_TO_EAT) {
                        listConvert.push(tempArr);
                    }
                }
            }
        }
        cc.log("List Convert " + JSON.stringify(listConvert));
        return listConvert;
    },

    checkEndGame: function (listConvert, currentTurn) {
        let player1Win = false;
        let player2Win = false;
        for (let list of listConvert) {
            let count1 = 0, count2 = 0;
            for (let cell of list) {
                let piece = this.arrayPiece[cell.row][cell.column];
                if (player1Win === false) {
                    cc.log("Piece Type " + piece.type + " big " + piece.isBig());
                    if (piece.isPlayer1() && piece.isBig()) {
                        count1++;
                        cc.log("Count1 " + count1);
                        if (count1 >= 3) {
                            player1Win = true;
                            this.listWin1 = list;
                        }
                    }
                }
                if (player2Win === false) {
                    if (piece.isPlayer2() && piece.isBig()) {
                        count2++;
                        if (count2 >= 3) {
                            player2Win = true;
                            this.listWin2 = list;
                        }
                    }
                }
            }
        }
        if (currentTurn === 0) {
            if (player1Win)
                return 0;
            if (player2Win)
                return 1;
            return -1;
        }
        else {
            if (player2Win)
                return 1;
            if (player1Win)
                return 0;
            return -1;
        }
    },

    inBound: function (rowCheck, columnCheck) {
        return rowCheck >= 0 && rowCheck < ConfigGame.BOARD_SIZE && columnCheck >= 0 && columnCheck < ConfigGame.BOARD_SIZE;
    },

    getNumPlayerPieces: function (playerId) {
        let count = 0;
        for (let i = 0; i < ConfigGame.BOARD_SIZE; i++) {
            for (let j = 0; j < ConfigGame.BOARD_SIZE; j++) {
                if (this.arrayPiece[i][j].getPlayerId() == playerId)
                    count++;
            }
        }
        return count;
    },

    getNumPlayerPiecesBig: function (playerId) {
        let count = 0;
        for (let i = 0; i < ConfigGame.BOARD_SIZE; i++) {
            for (let j = 0; j < ConfigGame.BOARD_SIZE; j++) {
                if (this.arrayPiece[i][j].getPlayerId() == playerId && this.arrayPiece[i][j].isBig())
                    count++;
            }
        }
        return count;
    }
})

const PieceData = cc.Class.extend({
    ctor: function (type, chair) {
        this.type = type;
        this.chair = chair;
    },

    setInfo: function (type, chair) {
        this.type = type;
        this.chair = chair;
    },

    isNone: function () {
        return this.type === PieceData.Type.NONE;
    },

    isBig: function () {
        return this.type === PieceData.Type.BIG;
    },

    isSmall: function () {
        return this.type === PieceData.Type.SMALL;
    },

    isPlayer1: function () {
        return this.chair == 0;
    },

    isPlayer2: function () {
        return this.chair = 1;
    },

    getPlayerId: function () {
        cc.log("this. type " + this.type + " " + this.isPlayer1());
        if (this.isPlayer1())
            return 0;
        return 1;
    },

    checkSamePlayer: function (data) {
        if (this.isNone() || data.isNone())
            return false;
        return (this.isPlayer1() && data.isPlayer1()) || (this.isPlayer2() && data.isPlayer2());
    },

    exchangeType: function () {
        switch (this.type) {
            case PieceData.Type.SMALL:
                this.type = PieceData.Type.BIG;
                break;
            case PieceData.Type.BIG:
                this.type = PieceData.Type.SMALL;
                break;
        }
    },
})

PieceData.getPlayerIdFromPieceType = function (pieceType) {
    if (pieceType === PieceData.Type.SMALL_1 || pieceType === PieceData.Type.BIG_1)
        return 0;
    return 1;
}

PieceData.Type = {};
PieceData.Type.NONE = -1;
PieceData.Type.SMALL = 0;
PieceData.Type.BIG = 1;

const MoveCell = function (row, column, newRow, newColumn, pieceType, chair, dir) {
    this.row = row;
    this.column = column;
    this.direction = dir;
    this.newRow = newRow;
    this.newColumn = newColumn;
    this.pieceType = pieceType;
    this.chair = chair;
}
MoveCell.Direction = {};
MoveCell.Direction.LEFT = 0;
MoveCell.Direction.RIGHT = 1;
MoveCell.Direction.UP = 2;
MoveCell.Direction.DOWN = 3;
MoveCell.Direction.LEFT_UP = 4;
MoveCell.Direction.RIGHT_UP = 5;
MoveCell.Direction.LEFT_DOWN = 6;
MoveCell.Direction.RIGHT_DOWN = 7;

const ConvertCell = function (row, column, pieceType) {
    this.row = row;
    this.column = column;
    this.pieceType = pieceType;
}