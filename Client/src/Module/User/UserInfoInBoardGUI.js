let UserInfoInBoardGUI = BaseLayer.extend({
    ctor: function () {
        this._super(UserInfoInBoardGUI.className);
        this.initWithBinaryFile("res/Board/UserInfo.json");
    },

    initGUI: function () {
        this.btnClose = this.customButton("btnClose", UserInfoInBoardGUI.BTN_CLOSE)
        this.bg = this.getControl("bg")

        // Avatar
        this.pAvt = this.getControl("pAvt", this.bg)
        this.bgAvt = this.getControl("bgAvt", this.pAvt)
        this.bgAvt.setVisible(false);
        this.avatarFrame = this.getControl("avatarFrame", this.pAvt)
        this.avatarFrame.setVisible(false)
        this.iconOwn = this.getControl("iconOwn", this.pAvt)

        this.avatar = new AvatarUI();
        this.avatar.setScale(0.9);
        this.pAvt.addChild(this.avatar, -2);
        this.border = new BorderUI(false);
        this.border.setScale(0.76);
        this.pAvt.addChild(this.border, -1);

        // Vip
        this.bgVip = this.getControl("bgVip", this.bg)
        this.txtVip = this.getControl("txtVip", this.bgVip)

        // Coin
        this.bgCoin = this.getControl("bgCoin", this.bg)
        this.txtCoin = this.getControl("txtCoin", this.bgCoin)

        // Request friend
        this.bgRequestFriend = this.getControl("bgRequestFriend", this.bg)
        this.btnAddFriend = this.customButton("btnAdd", UserInfoInBoardGUI.BTN_ADD_FRIEND, this.bgRequestFriend)
        this.btnDeleteFriend = this.customButton("btnDelete", UserInfoInBoardGUI.BTN_DEL_FRIEND, this.bgRequestFriend)

        // Display Name
        this.displayName = this.getControl("txtName", this.bg)

        // ID
        this.infoID = this.getControl("infoID", this.bg)
        this.txtId = this.getControl("txtId", this.infoID)
        this.btnCopyID = this.customButton("btnCopy", UserInfoInBoardGUI.BTN_COPY_ID, this.txtId)

        // Level
        this.infoLevel = this.getControl("infoLevel", this.bg)
        this.txtLevel = this.getControl("txtLevel", this.infoLevel)

        // Game played
        this.infoGamePlayed = this.getControl("infoGamePlayed", this.bg)
        this.txtGamePlayed = this.getControl("txtGamePlayed", this.infoGamePlayed)

        // Win rate
        this.infoWinRate = this.getControl("infoWinRate", this.bg)
        this.txtWinRate = this.getControl("txtWinRate", this.infoWinRate)

        // Play style
        this.infoPlayStyle = this.getControl("infoPlayStyle", this.bg)
        this.styleBar = this.getControl("styleBar", this.infoPlayStyle)
        this.iconChoose = this.getControl("choose", this.styleBar)

        // Info domino
        this.infoDomino = this.getControl("infoDomino", this.bg)
        this.txtDomino = this.getControl("txtDomino", this.infoDomino)

        // pInteract
        this.pInteract = this.getControl("pInteract", this.bg)
        this.tableViewInteract = new GUIInfoPanelInteract(this, this.pInteract.getContentSize());
        this.pInteract.addChild(this.tableViewInteract);
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this.bg, true, false);
    },

    onButtonRelease: function (btn, id) {
        switch (id) {
            case UserInfoInBoardGUI.BTN_CLOSE: {
                this.onClose()
                break;
            }
        }
    },

    updateMode: function () {
        switch (this.mode) {
            case QiuQiuManager.MODE: {
                this.infoDomino.setVisible(false)
                this.infoPlayStyle.setVisible(true)

                this.txtGamePlayed.setString(this.playerInfo.qqTotalMatches)
                this.txtWinRate.setString(this.playerInfo.qqWinRate + "%")

                let percent = 1 - parseFloat(this.playerInfo.qqStyle)
                this.iconChoose.setPositionX(percent * this.styleBar.width)
                break;
            }
            case GapleManager.MODE: {
                this.infoDomino.setVisible(true)
                this.infoPlayStyle.setVisible(false)

                this.txtGamePlayed.setString(this.playerInfo.gapleTotalMatches)
                this.txtWinRate.setString(this.playerInfo.gapleWinRate + "%")
                this.txtDomino.setString(this.playerInfo.gapleTime)
                break;
            }
        }
    },

    updateInfo: function () {
        this.displayName.setString(StringUtility.subStringTextLength(StringUtility.convertUTF8String(this.playerInfo.displayName), 16));
        this.setAvatar(this.playerInfo.userId, this.playerInfo.avatarURL);
        this.checkFriend()

        this.txtId.setString(this.playerInfo.userId)
        this.txtLevel.setString(this.playerInfo.level)
        this.txtCoin.setString(StringUtility.formatNumberSymbol(this.playerInfo.chip))

        this.border.sync(this.playerInfo.userId);
    },

    checkFriend: function () {
        // todo
    },

    updatePosition: function () {
        switch (this.mode) {
            case GapleManager.MODE: {
                switch (this.userIndex) {
                    case 0: {
                        this.bg.setPosition(this.userPos.x + this.bg.width / 2 + 30, this.userPos.y + this.bg.height / 2 + 20)
                        break;
                    }
                    case 1: {
                        this.bg.setPosition(this.userPos.x + this.bg.width / 2 + 60, this.userPos.y)
                        break;
                    }
                    case 2: {
                        this.bg.setPosition(this.userPos.x, this.userPos.y - this.bg.height / 2 - 60)
                        break;
                    }
                    case 3: {
                        this.bg.setPosition(this.userPos.x - this.bg.width / 2 - 55, this.userPos.y)
                        break;
                    }
                }
                break;
            }
            case QiuQiuManager.MODE: {
                switch (this.userIndex) {
                    case 0: {
                        this.bg.setPosition(this.userPos.x + this.bg.width / 2 + 5, this.userPos.y + this.bg.height / 2 + 5)
                        break;
                    }
                    case 1: {
                        this.bg.setPosition(this.userPos.x + this.bg.width / 2 + 5, this.userPos.y + this.bg.height / 2 + 5)
                        break;
                    }
                    case 2: {
                        this.bg.setPosition(this.userPos.x + this.bg.width / 2 + 15, this.userPos.y)
                        break;
                    }
                    case 3: {
                        this.bg.setPosition(this.userPos.x + this.bg.width / 2, this.userPos.y - this.bg.height / 2)
                        break;
                    }
                    case 4: {
                        this.bg.setPosition(this.userPos.x - this.bg.width / 2, this.userPos.y - this.bg.height / 2)
                        break;
                    }
                    case 5: {
                        this.bg.setPosition(this.userPos.x - this.bg.width / 2 - 15, this.userPos.y)
                        break;
                    }
                    case 6: {
                        this.bg.setPosition(this.userPos.x - this.bg.width / 2 - 5, this.userPos.y + this.bg.height / 2 + 5)
                        break;
                    }
                }
                break;
            }
        }
    },

    updateUserInfo: function(index, playerInfo, mode, userPos, serverUserIndex) {
        this.userIndex = index
        this.playerInfo = playerInfo
        this.mode = mode
        this.userPos = userPos

        this.tableViewInteract.updateData(serverUserIndex)

        if (!this.playerInfo.displayName) {
            this.playerInfo.displayName = this.playerInfo.accountName
        }
        if (!this.playerInfo.userId) {
            this.playerInfo.userId = this.playerInfo.uid
        }

        this.updateMode()
        this.updateInfo()
        this.updatePosition()
    },

    setAvatar: function(userId, avatar) {
        this.avatar.asyncExecuteWithUrl(userId, avatar);
    },
})

UserInfoInBoardGUI.className = "UserInfoInBoardGUI";
UserInfoInBoardGUI.tag = 500;

UserInfoInBoardGUI.BTN_CLOSE = 0
UserInfoInBoardGUI.BTN_ADD_FRIEND = 1
UserInfoInBoardGUI.BTN_DEL_FRIEND = 2
UserInfoInBoardGUI.BTN_COPY_ID = 3

let GUIInfoPanelInteract = ccui.Layout.extend({
    ctor: function (_tParent, size) {
        this._parent = _tParent;
        this.panelSize = size;

        this.tbList = null;
        this.listData = [];
        this.cellSize = cc.size(0,0);

        this._super();
        this.setContentSize(size);
    },

    updateData: function (userIndex) {
        this.userIndex = userIndex
        this.initGUI();
        this.customPanel();
    },

    initGUI: function() {
        if (this.tbList) {
            this.tbList.removeFromParent(true)
        }

        this.tbList = new cc.TableView(this, this.panelSize);
        this.tbList.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
        this.tbList.setVerticalFillOrder(0);
        this.tbList.setDelegate(this);
        this.addChild(this.tbList);
    },

    customPanel: function() {
        this.setCellSize(cc.size(90, 90));
        this.setData(interactMgr.loadInteractData())
    },

    createCell: function() {
        return new InteractCell(this.userIndex, -1);
    },

    touchedCell: function() {},

    setData: function(data) {
        this.listData = data;
        this.reloadData();
    },

    setCellSize: function(_cellSize) {
        this.cellSize = _cellSize;
    },

    tableCellAtIndex: function (table, idx) {
        try {
            let cell = table.dequeueCell();
            if (!cell) {
                cell = this.createCell();
            }
            cell.setInfo(this.listData[idx]);
            return cell;
        } catch(e) {
            cc.log("error", e.toString());
        }
    },

    tableCellSizeForIndex: function (table, idx) {
        return this.cellSize;
    },

    numberOfCellsInTableView: function (table) {
        if (this.listData)
            return this.listData.length;
        return 0
    },

    tableCellTouched: function (table, cell) {
        this.touchedCell();
    },

    reloadData: function() {
        this.tbList.reloadData();
    }
});