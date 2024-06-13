let UserInfoGUI = BaseLayer.extend({
    ctor: function () {
        this._super(UserInfoGUI.className);
        this.initWithBinaryFile("res/Board/GUIDetailUserInfo.json");
    },

    initGUI: function () {
        this.btnClose = this.customButton("btnClose", UserInfoGUI.BTN_CLOSE)
        this.bg = this.getControl("bg")
        this.customButton("btnClose", UserInfoGUI.BTN_CLOSE, this.bg)
        this.pFog = this.getControl("pFog")
        this.pInfo = this.getControl("pInfo", this.bg)
        this.txtVersion = this.getControl("txtVersion", this.bg)

        // Avatar
        this.pAvt = this.getControl("pAvt", this.pInfo)
        this.bgAvt = this.getControl("bgAvt", this.pAvt)
        this.bgAvt.setVisible(false);
        this.avatarFrame = this.getControl("avatarFrame", this.pAvt)
        this.avatarFrame.setVisible(false)
        this.iconLeague = this.getControl("iconLeague", this.pAvt)

        this.avatar = new AvatarUI();
        this.avatar.setScale(1.3);
        this.pAvt.addChild(this.avatar, -2);
        this.border = new BorderUI(true);
        this.border.setScale(1.15);
        this.pAvt.addChild(this.border, -1);

        // Vip
        this.bgVip = this.getControl("bgVip", this.pInfo)
        this.txtVip = this.getControl("txtVip", this.bgVip)

        // Coin
        this.txtCoin = this.getControl("txtGold", this.pInfo)

        // Display Name
        this.displayName = this.getControl("name", this.pInfo)

        // ID
        this.infoID = this.getControl("infoID", this.pInfo)
        this.txtId = this.getControl("txtId", this.infoID)
        this.btnCopyID = this.customButton("btnCopy", UserInfoGUI.BTN_COPY_ID, this.pInfo)

        // Level
        this.infoLevel = this.getControl("infoLevel", this.pInfo)
        this.txtLevel = this.getControl("txtLevel", this.infoLevel)

        let bgLevel = this.getControl("bgLevel", this.pInfo)
        this.processLevel = this.getControl("processLevel", bgLevel)
        this.processLevel.txt = this.getControl("txt", bgLevel)

        // Button change tab
        this.btnStatistic = this.getControl("tab1", this.bg)
        this.btnStatistic.selected = this.getControl("selected", this.btnStatistic)
        this.btnStatistic.txt = this.getControl("txt", this.btnStatistic)
        this.btnStatistic.txt.defaultColor = cc.color("#626BD4")
        this.btnStatistic.txt.selectedColor = cc.color("#85553C")
        this.customButton("btn", UserInfoGUI.BTN_STATISTIC, this.btnStatistic)

        this.btnInventory = this.getControl("tab2", this.bg)
        this.btnInventory.selected = this.getControl("selected", this.btnInventory)
        this.btnInventory.txt = this.getControl("txt", this.btnInventory)
        this.btnInventory.txt.defaultColor = cc.color("#626BD4")
        this.btnInventory.txt.selectedColor = cc.color("#85553C")
        this.customButton("btn", UserInfoGUI.BTN_INVENTORY, this.btnInventory)

        this.btnLeague = this.getControl("tab3", this.bg)
        this.btnLeague.selected = this.getControl("selected", this.btnLeague)
        this.btnLeague.txt = this.getControl("txt", this.btnLeague)
        this.btnLeague.txt.defaultColor = cc.color("#626BD4")
        this.btnLeague.txt.selectedColor = cc.color("#85553C")
        this.customButton("btn", UserInfoGUI.BTN_LEAGUE, this.btnLeague)

        this.pStatistic = this.getControl("pStatistic", this.bg)
        // Tab qiu qiu
        let tabQQ = this.getControl("pTop", this.pStatistic)
        this.infoQQ = {}

        this.infoQQ.gamePlayed = this.getControl("txtGamePlayed", tabQQ)
        this.infoQQ.winRate = this.getControl("txtWinRate", tabQQ)
        this.infoQQ.styleBar = this.getControl("styleBar", tabQQ)
        this.infoQQ.iconChoose = this.getControl("choose", this.infoQQ.styleBar)

        // Tab gaple
        let tabGaple = this.getControl("pMid", this.pStatistic)
        this.infoGaple = {}

        this.infoGaple.gamePlayed = this.getControl("txtGamePlayed", tabGaple)
        this.infoGaple.winRate = this.getControl("txtWinRate", tabGaple)
        this.infoGaple.numGaple = this.getControl("txtGaple", tabGaple)

        // Tab seasonal ranking
        let tabSeason = this.getControl("pBot", this.pStatistic)
        this.listSeason = []
        for (let i = 0; i < 5; i++) {
            this.listSeason[i] = {}

            this.listSeason[i].bg = this.getControl("bgSeason_" + i, tabSeason)
            this.listSeason[i].txt = this.getControl("txt", this.listSeason[i].bg)

            this.listSeason[i].bg.setVisible(false)
        }

        // Tab Inventory
        this.pStorage = new StorageGUI();
        this.bg.addChild(this.pStorage);
        this.pStorage.setVisible(false);
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this.bg, true, false);
        this.pFog.setOpacity(0)
        this.pFog.runAction(cc.fadeIn(0.2))
        this.txtVersion.setString(gameMgr.getVersionString())

        this.switchTab(UserInfoGUI.BTN_STATISTIC)
    },

    switchTab: function (id) {
        this.pStorage.setVisible(false);
        this.pStatistic.setVisible(false);
        this.pInfo.setVisible(true);
        this.btnStatistic.selected.setVisible(false)
        this.btnInventory.selected.setVisible(false)
        this.btnLeague.selected.setVisible(false)

        this.btnStatistic.txt.setTextColor(this.btnStatistic.txt.defaultColor)
        this.btnInventory.txt.setTextColor(this.btnInventory.txt.defaultColor)
        this.btnLeague.txt.setTextColor(this.btnLeague.txt.defaultColor)

        switch (id) {
            case UserInfoGUI.BTN_STATISTIC: {
                this.pStatistic.setVisible(true);
                this.btnStatistic.selected.setVisible(true)
                this.btnStatistic.txt.setTextColor(this.btnStatistic.txt.selectedColor)
                break;
            }
            case UserInfoGUI.BTN_INVENTORY: {
                this.btnInventory.selected.setVisible(true)
                this.btnInventory.txt.setTextColor(this.btnStatistic.txt.selectedColor)
                this.pStorage.open();
                this.pInfo.setVisible(false);
                break;
            }
            case UserInfoGUI.BTN_LEAGUE: {
                this.btnLeague.selected.setVisible(true)
                this.btnLeague.txt.setTextColor(this.btnStatistic.txt.selectedColor)
                break;
            }
        }
    },

    onButtonRelease: function (btn, id) {
        switch (id) {
            case UserInfoGUI.BTN_CLOSE: {
                this.onClose()
                break;
            }
            case UserInfoGUI.BTN_STATISTIC: {
                this.switchTab(UserInfoGUI.BTN_STATISTIC)
                break;
            }
            case UserInfoGUI.BTN_INVENTORY: {
                // Toast.makeToast(Toast.SHORT, LocalizedString.to("GAME_FEATURE_COMING_SOON"))
                this.switchTab(UserInfoGUI.BTN_INVENTORY)
                break;
            }
            case UserInfoGUI.BTN_LEAGUE: {
                Toast.makeToast(Toast.SHORT, LocalizedString.to("GAME_FEATURE_COMING_SOON"))
                // this.switchTab(UserInfoGUI.BTN_LEAGUE)
                break;
            }
            case UserInfoGUI.BTN_COPY_ID: {
                let text = this.txtId.getString()
                fr.platformWrapper.copy2Clipboard(LocalizedString.to("GAME_COPIED"), text);
                break;
            }
        }
    },

    updateUserInfo: function (index, playerInfo) {
        this.userIndex = index
        this.playerInfo = playerInfo
        if (!this.playerInfo) return

        if (!this.playerInfo.displayName) {
            this.playerInfo.displayName = this.playerInfo.accountName
        }
        if (!this.playerInfo.userId) {
            this.playerInfo.userId = this.playerInfo.uid
        }
        this.updateInfo()
    },

    updateInfo: function () {
        this.displayName.setString(StringUtility.subStringTextLength(StringUtility.convertUTF8String(this.playerInfo.displayName), 13));
        this.setAvatar(this.playerInfo.userId, this.playerInfo.avatarURL);

        this.txtId.setString(this.playerInfo.userId)
        this.txtLevel.setString(this.playerInfo.level)

        let gold = this.playerInfo.chip;
        if (!gold) {
            gold = this.playerInfo.gold;
        }

        if (this.playerInfo.gold !== undefined && this.playerInfo.chip !== undefined) {
            gold = this.playerInfo.gold + this.playerInfo.chip;
        }

        this.txtCoin.setString(StringUtility.pointNumber(gold))

        this.processLevel.setPercent(this.playerInfo.levelPercent)
        this.processLevel.txt.setString(this.playerInfo.levelPercent + "%")

        // Panel qiu qiu
        this.infoQQ.gamePlayed.setString(this.playerInfo.qqTotalMatches)
        this.infoQQ.winRate.setString(this.playerInfo.qqWinRate + "%")

        let percent = 1 - parseFloat(this.playerInfo.qqStyle)
        this.infoQQ.iconChoose.setPositionX(percent * this.infoQQ.styleBar.width)

        // Panel gaple
        this.infoGaple.gamePlayed.setString(this.playerInfo.gapleTotalMatches)
        this.infoGaple.winRate.setString(this.playerInfo.gapleWinRate + "%")
        this.infoGaple.numGaple.setString(this.playerInfo.gapleTime)
    },

    setAvatar: function(userId, avatar) {
        this.avatar.asyncExecuteWithUrl(userId, avatar);
    },

    updateStorage: function () {
        // this.pStorage.onUpdateGUI();
    },

    onClose: function () {
        this._super()
        this.pFog.runAction(cc.fadeOut(0.2))
    }
})

UserInfoGUI.className = "UserInfoGUI";
UserInfoGUI.tag = 501;

UserInfoGUI.BTN_COPY_ID = 4;
UserInfoGUI.BTN_CLOSE = 0;
UserInfoGUI.BTN_STATISTIC = 1;
UserInfoGUI.BTN_INVENTORY = 2;
UserInfoGUI.BTN_LEAGUE = 3;