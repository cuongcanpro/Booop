var InGameMgr = BaseMgr.extend({
    ctor: function () {
        this._super();
    },

    init: function () {

    },

    onReceived: function (cmd, pk) {
        switch (cmd) {
            case InGameMgr.CMD.JOIN_ROOM:
                const cmdJoinRoom = new CmdReceivedJoinRoomSuccess(pk);
                cmdJoinRoom.clean();
                gameLogic.joinRoomSuccess(cmdJoinRoom);
                break;
            case InGameMgr.CMD.NEW_USER_JOIN_ROOM:
                const cmdNewUserJoinRoom = new CmdReceivedNewUserJoinRoom(pk);
                cmdNewUserJoinRoom.clean();
                gameLogic.newUserJoinRoom(cmdNewUserJoinRoom);
                break;
            case InGameMgr.CMD.NOTIFY_START_GAME:
                const cmdNotifyStart = new CmdReceivedNotifyStartGame(pk);
                cmdNotifyStart.clean();
                gameLogic.notifyStartGame(cmdNotifyStart);
                break;
            case InGameMgr.CMD.CHANGE_TURN:
                const cmdChangeTurn = new CmdReceivedChangeTurn(pk);
                cmdChangeTurn.clean();
                gameLogic.changeTurn(cmdChangeTurn);
                break;
            case InGameMgr.CMD.PLACE_PIECE:
                const cmdPlacePiece = new CmdReceivedPlacePiece(pk);
                cmdPlacePiece.clean();
                gameLogic.placePiece(cmdPlacePiece);
                break;
            case InGameMgr.CMD.CONFIRM_ROW:
                const cmdConfirmRow = new CmdReceivedConfirmConvertRow(pk);
                cmdConfirmRow.clean();
                gameLogic.confirmConvertRow(cmdConfirmRow);
                break;
            case InGameMgr.CMD.RESULT:
                const cmdResult = new CmdReceivedResult(pk);
                cmdResult.clean();
                gameLogic.resultGame(cmdResult);
                break;
            case InGameMgr.CMD.HISTORY:
                const cmdHistory = new CmdReceivedHistory(pk);
                cmdHistory.clean();
                cc.log("CmdReceivedHistory:: " + JSON.stringify(cmdHistory));
                break;
        }
        return false;
    },

    /**
     * @param {number} row
     * @param {number} column
     * @param {PieceData.Type} pieceType
     */
    sendPlacePiece: function (row, column, pieceType) {
        let cmd = new CmdSendPlacePiece();
        cmd.putData(row, column, pieceType);
        this.sendPacket(cmd);
        cmd.clean();
    },

    /**
     * @param {number} index
     */
    sendConfirmRow: function (index) {
        let cmd = new CmdSendConfirmRow();
        cmd.putData(index);
        this.sendPacket(cmd);
        cmd.clean();
    },

})

InGameMgr.instance = null;
InGameMgr.getInstance = function () {
    if (!InGameMgr.instance) {
        InGameMgr.instance = new InGameMgr();
    }
    return InGameMgr.instance;
};
var inGameMgr = InGameMgr.getInstance();

InGameMgr.CMD = {};
InGameMgr.CMD.FIND_MATCH = 30901;
InGameMgr.CMD.JOIN_ROOM = 30902;
InGameMgr.CMD.NEW_USER_JOIN_ROOM = 30903;
InGameMgr.CMD.NOTIFY_START_GAME = 30904;
InGameMgr.CMD.CHANGE_TURN = 30905;
InGameMgr.CMD.PLACE_PIECE = 30906;
InGameMgr.CMD.CONFIRM_ROW = 30907;
InGameMgr.CMD.RESULT = 30908;
InGameMgr.CMD.HISTORY = 30909;