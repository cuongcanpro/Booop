
/* region OutPacket */
const CmdSendPlacePiece = CmdSendCommon.extend({
    ctor:function()
    {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(InGameMgr.CMD.PLACE_PIECE);

    },

    putData:function(row, column, pieceType){
        this.packHeader();
        this.putInt(row);
        this.putInt(column);
        this.putInt(pieceType);
        this.updateSize();
    }
});

const CmdSendConfirmRow = CmdSendCommon.extend({
    ctor:function()
    {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(InGameMgr.CMD.CONFIRM_ROW);

    },

    putData:function(index){
        this.packHeader();
        this.putInt(index);
        this.updateSize();
    }
});

const CmdSendFindMatch = CmdSendCommon.extend({
    ctor:function()
    {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(InGameMgr.CMD.FIND_MATCH);
        this.putData();
    }
});

/* endregion OutPacket */

/* region InPacket */

const CmdReceivedJoinRoomSuccess = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.myChair = this.getInt();
        this.hasOpponent = this.getBool();
        if (this.hasOpponent) {
            this.avatarURL = this.getString();
            this.uId = this.getInt();
            this.username = this.getString();
            this.otherChair = this.getInt();
        }
    }
});

const CmdReceivedNewUserJoinRoom = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.avatarURL = this.getString();
        this.uId = this.getInt();
        this.username = this.getString();
        this.otherChair = this.getInt();
    }
});

const CmdReceivedNotifyStartGame = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.time = this.getInt();
    }
});

const CmdReceivedChangeTurn = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.chair = this.getInt();
        this.uId = this.getInt();
        this.turnTime = this.getInt();
    }
});

const CmdReceivedPlacePiece = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.chair = this.getInt();
        this.uId = this.getInt();
        this.row = this.getInt();
        this.column = this.getInt();
        this.pieceType = this.getInt();
        this.timeConfirm = this.getInt();
        this.listMoveCell = [];
        this.numChangePosition = this.getInt();
        for (let i = 0; i < this.numChangePosition; i++) {
            let chair = this.getInt();
            let type = this.getInt();
            let row = this.getInt();
            let column = this.getInt();
            let newRow = this.getInt();
            let newColumn = this.getInt();
            this.getBool();
            this.listMoveCell[i] = new MoveCell(row, column, newRow, newColumn, 0, 0);
        }

        this.listConvertCell = [];
        this.numConvert = this.getInt();
        for (let i = 0; i < this.numConvert; i++) {
            this.listConvertCell[i] = [];
            let size = this.getInt();
            for (let j = 0; j < size; j++) {
                let row = this.getInt();
                let column = this.getInt();
                this.listConvertCell[i][j] = new ConvertCell(row, column, 0, 0);
            }
        }

        this.listSelectCell = [];
        this.numSelect = this.getInt();
        for (let i = 0; i < this.numSelect; i++) {
            this.listSelectCell[i] = [];
            let size = this.getInt();
            for (let j = 0; j < size; j++) {
                let row = this.getInt();
                let column = this.getInt();
                this.listSelectCell[i][j] = new ConvertCell(row, column, 0, 0);
            }
        }
    }
});

const CmdReceivedConfirmConvertRow = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.chair = this.getInt();
        this.uId = this.getInt();
        let size = this.getInt();
        this.listConvert = [];
        for (let i = 0; i < size; i++) {
            let row = this.getInt();
            let column = this.getInt();
            this.listConvert[i] = new ConvertCell(row, column, PieceData.Type.NONE);
        }
    }
})

const CmdReceivedResult = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.chair = this.getInt();
        this.uId = this.getInt();
        this.isWin
    }
})

const CmdReceivedHistory = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.numChangePosition = this.getInt();
        this.listMove = [];
        for (let i = 0; i < this.numChangePosition; i++) {
            let obj = {};
            obj.row = this.getInt();
            obj.column = this.getInt();
            obj.chessType = this.getInt();
            obj.chair = this.getInt();
            obj.uId = this.getInt();
            this.listMove.push(obj);
        }
    }
})

/* endregion InPacket */