/**
 * @property {PieceNode[]} arrPieceActive
 */
const PlayerUI = cc.Node.extend({
    ctor: function (id) {
        this._super();

        this.id = id;
        this.arrPieceActive = [];
        this.arrPieceNotActive = [];
        this.arrBgActive = [];
        this.arrBgNotActive = [];

        let rate = id === PlayerUI.MY_INDEX ? 1 : -1;
        for (let i = 0; i < ConfigGame.NUM_SLOT; i++) {
            this.arrBgActive[i] = cc.Scale9Sprite.create("res/brickWhite.png");
            this.arrBgActive[i].setColor(cc.color("#eeeeee"));
            this.arrBgActive[i].setContentSize(cc.size(PlayerUI.SIZE_BG_ACTIVE, PlayerUI.SIZE_BG_ACTIVE));
            this.arrBgActive[i].setPosition(rate * PlayerUI.SIZE_BG_ACTIVE * (i + 0.5), 0);
            this.addChild(this.arrBgActive[i]);

            let piece = new PieceNode();
            this.addChild(piece);
            piece.setPieceData(PieceData.Type.SMALL, this.id);
            piece.setPosition(this.arrBgActive[i]);
            piece.defaultPos = piece.getPosition();
            this.arrPieceActive[i] = piece;

            this.arrBgNotActive[i] = cc.Scale9Sprite.create("res/brickWhite.png");
            this.arrBgNotActive[i].setColor(cc.color("#eeeeee"));
            this.arrBgNotActive[i].setContentSize(cc.size(PlayerUI.SIZE_BG_ACTIVE, PlayerUI.SIZE_BG_ACTIVE));
            this.arrBgNotActive[i].setPosition(PlayerUI.SIZE_BG_ACTIVE * 0.5 * rate, -PlayerUI.SIZE_BG_ACTIVE * (i + 1.5));
            this.addChild(this.arrBgNotActive[i]);

            let piece1 = new PieceNode();
            piece1.setPieceData(PieceData.Type.BIG, this.id);
            this.addChild(piece1);
            piece1.setPosition(this.arrBgNotActive[i]);
            piece1.defaultPos = piece1.getPosition();
            this.arrPieceNotActive[i] = piece1;
        }

        this.playerData = gameLogic.arrPlayerData[id];
    },

    newGame: function () {
        for (let piece of this.arrPieceActive) {
            piece.stopAllActions();
            piece.setPosition(piece.defaultPos);
            piece.setPieceData(PieceData.Type.SMALL, this.id);
        }
        for (let piece of this.arrPieceNotActive) {
            piece.stopAllActions();
            piece.setPosition(piece.defaultPos);
            piece.setPieceData(PieceData.Type.BIG, this.id);
        }
    },

    getTouchPieceType: function (pos) {
        pos = this.convertToNodeSpace(pos);
        let result = PieceData.Type.NONE;
        for (let i = 0; i < this.arrBgActive.length; i++) {
            let bg = this.arrBgActive[i];
            let piece = this.arrPieceActive[i];
            if (piece.isVisible()) {
                let rect = cc.rect(bg.getPositionX() - bg.getContentSize().width * 0.5, bg.getPositionY() - bg.getContentSize().height * 0.5, bg.getContentSize().width, bg.getContentSize().height);
                if (cc.rectContainsPoint(rect, pos)) {
                    result = piece.getPieceType();
                    piece.setVisible(false);
                    this.relayout();
                    break;
                }
            }
        }
        return result;
    },

    relayout: function () {
        let arrPieceType = [];
        let arrPos = [];
        let sum = this.arrPieceActive.reduce((count, piece, index) => {
            if (piece.isVisible()) {
                count = count + 1;
                arrPieceType.push(this.arrPieceActive[index].getPieceType());
                arrPos.push(this.arrPieceActive[index].getPosition());
            }
            return count;
        }, 0);
        let startIndex = ConfigGame.NUM_SLOT * 0.5 - Math.ceil(sum / 2);
        startIndex = 0;
        this.arrPieceActive.forEach((piece, index) => {
           if (index < startIndex || index >= startIndex + sum) {
               piece.setPieceData(PieceData.Type.NONE);
           }
           else if (index < startIndex + sum) {
               piece.setPieceData(arrPieceType[index - startIndex], this.id);
               piece.setPosition(arrPos[index - startIndex]);
               piece.runAction(cc.moveTo(0.4, piece.defaultPos).easing(cc.easeBackOut()));
           }
        });
    },

    /**
     * Take piece comeback to active piece
     * @param {PieceData.Type} pieceType
     * @param {cc.Point} pos
     * @param {boolean} isExchange
     */
    revertPiece: function (pieceType, pos, isExchange) {
        pos = this.convertToNodeSpace(pos);
        for (let i = 0; i < this.arrPieceActive.length; i++) {
            let piece = this.arrPieceActive[i];
            if (piece.isVisible() === false) {
                piece.setPieceData(pieceType, this.id);
                piece.setPosition(pos);
                if (isExchange && piece.isSmallPieceNode()) {
                    piece.runAction(
                        cc.sequence(
                            cc.moveTo(0.5, piece.defaultPos).easing(cc.easeSineOut()),
                            cc.delayTime(0.5),
                            cc.callFunc(this.exchangePiece.bind(this, i))
                        )
                    );
                }
                else {
                    piece.runAction(
                        cc.moveTo(0.5, piece.defaultPos).easing(cc.easeSineOut())
                    );
                }
                break;
            }
        }
    },

    /**
     * Exchange small piece to big piece
     * @param {number} exchangeIndex
     */
    exchangePiece: function (exchangeIndex) {
        let pieceActive = this.arrPieceActive[exchangeIndex];
        for (let pieceNotActive of this.arrPieceNotActive) {
            if (pieceNotActive.isVisible() && pieceNotActive.isBigPieceNode()) {
                pieceNotActive.exchangePiece();
                pieceActive.exchangePiece();

                pieceActive.setPosition((pieceNotActive.getPosition()));
                pieceActive.runAction(cc.moveTo(0.5, pieceActive.defaultPos).easing(cc.easeSineOut()));
                pieceNotActive.setPosition((pieceActive.defaultPos));
                pieceNotActive.runAction(cc.moveTo(0.5, pieceNotActive.defaultPos).easing(cc.easeSineOut()));

                break;
            }
        }
    },

    getNumBigInActive: function () {
        return this.arrPieceActive.reduce((sum, piece) => {
            if (piece.isBigPieceNode())
                sum++;
        }, 0);
    },

    getNumSmallInActive: function () {
        return this.arrPieceActive.reduce((sum, piece) => {
            if (piece.isSmallPieceNode())
                sum++;
        }, 0);
    },

    /**
     * Need to update view when have problems
     */
    updateFromPlayerData: function () {
        // Update for Pieces Active
        let numPieceInBoard = gameLogic.boardData.getNumPlayerPieces(this.id);
        let numBigInBoard = gameLogic.boardData.getNumPlayerPiecesBig(this.id);
        let numBigInActive = this.playerData.numBig - numBigInBoard;
        let numSmallInActive = ConfigGame.NUM_SLOT - numPieceInBoard - numBigInActive;
        let numBigInNotActive = ConfigGame.NUM_SLOT - this.playerData.numBig;
        let numSmallInNotActive = ConfigGame.NUM_SLOT - numBigInNotActive;

        if (this.getNumBigInActive() !== numBigInActive || this.getNumSmallInActive() !== numSmallInActive) {
            // need to update data
            this.arrPieceActive.forEach((piece, index) => {
                if (index < numSmallInActive) {
                    piece.setPieceType(this.playerData.getSmallType());
                }
                else if (index < numSmallInActive + numBigInActive) {
                    piece.setPieceType(this.playerData.getBigType());
                }
                else {
                    piece.setPieceType(PieceData.Type.NONE);
                }
            });

            this.arrPieceNotActive.forEach((piece, index) => {
                if (index < numSmallInNotActive) {
                    piece.setPieceType(this.playerData.getSmallType());
                }
                else {
                    piece.setPieceType(this.playerData.getBigType());
                }
            });
        }
    },

    changeTurn: function () {
        for (let bgPiece of this.arrBgActive) {
            bgPiece.runAction(cc.repeatForever(
                cc.sequence(
                    cc.fadeTo(0.3, 200),
                    cc.fadeTo(0.3, 255)
                )
            ));
            bgPiece.setColor(cc.color("#40e214"));
        }
    },

    stopTurn: function () {
        for (let bgPiece of this.arrBgActive) {
            bgPiece.stopAllActions();
            bgPiece.setColor(cc.color("#ea8282"));
        }
    },

    removePiece: function (pieceType) {
        for (let piece of this.arrPieceActive) {
            if (piece.isVisible() && piece.getPieceType() === pieceType) {
                piece.setPieceData(PieceData.Type.NONE, 0);
                return this.convertToWorldSpace(piece.getPosition());
            }
        }
        return cc.p(0, 0);
    }
})

PlayerUI.MY_INDEX = 0;
PlayerUI.OTHER_INDEX = 1;
PlayerUI.SIZE_BG_ACTIVE = 70;