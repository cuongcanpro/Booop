let DeleteAccountUI = BaseLayer.extend({
    ctor: function () {
        this._super();
        this.initWithBinaryFile("Setting/json/DeleteAccountGUI.json");
    },

    initGUI: function () {
        this.bg = this.getControl("bg");
        this.customButton("btnClose", DeleteAccountUI.BTN_CLOSE, this.bg);

        this.btnNext =this.customButton("next", DeleteAccountUI.BTN_NEXT, this.bg);

        this.p0 = this.getControl("p0", this.bg);

        this.p1 = this.getControl("p1", this.bg);
        this.tfReason = this.getControl("tfReason", this.p1);
        this.arOP =[];
        for(let i = 0; i < 3; i++) {
            this.arOP.push(this.getOption(i, this.p1));
        }

        this.p2 = this.getControl("p2", this.bg);
        this.customButton("cancel", DeleteAccountUI.BTN_CANCEL, this.p2);
        this.customButton("delete", DeleteAccountUI.BTN_DELETE, this.p2);

        this.p3 = this.getControl("p3", this.bg);
        this.customButton("finish", DeleteAccountUI.BTN_FINISH, this.p3);

        this.arPage = [];
        this.arPage.push(this.p0);
        this.arPage.push(this.p1);
        this.arPage.push(this.p2);
        this.arPage.push(this.p3);
        this.isNext = [1,1,0,0];

        this.initFog();
    },

    getOption : function (i,p) {
        let btn = this.customButton("op" + i, DeleteAccountUI.BTN_OPTION + i, p);
        btn.selected = this.getControl("select", btn);
        btn.content = this.getControl("content", btn).getString();
        return btn;
    },

    onEnterFinish: function () {
        let isDelete = StorageUtil.getInt(this.getKeyCache());

        this.curStep = 0;
        if(isDelete) {
            this.curStep = this.arPage.length - 1;
        }

        this.clearOption();
        this.showFog();
        this.showStep();
        this.setShowHideAnimate(this.bg);
    },

    showStep : function () {
        this.btnNext.setVisible(this.isNext[this.curStep]);
        for(let s in this.arPage) {
            this.arPage[s].setVisible(s == this.curStep);
        }
    },

    clearOption : function () {
        this.curOption  = -1;
        for(let s in this.arOP) {
            this.arOP[s].selected.setVisible(false);
        }
        this.tfReason.setString("");
    },

    chooseOption : function (n) {
        this.curOption = n;
        for(let s in this.arOP) {
            this.arOP[s].selected.setVisible(s == n);
        }
    },

    getReason : function () {
        if(this.curOption < this.arOP.length - 1) {
            return this.arOP[this.curOption].content;
        }

        return this.tfReason.getString();
    },

    getKeyCache : function () {
        return DeleteAccountUI.KEY_DELETE_ACCOUNT + "_" + userMgr.getUserId();
    },

    onButtonRelease: function (button, id) {
        switch (id) {
            case DeleteAccountUI.BTN_FINISH:
            case DeleteAccountUI.BTN_CLOSE: {
                this.onClose();
                break;
            }
            case DeleteAccountUI.BTN_NEXT: {
                if(this.curStep == 1 && this.curOption == -1) {
                    ToastFloat.makeToast(ToastFloat.SHORT,"Please choose option !!!");
                    return;
                }
                this.curStep++;
                this.showStep();
                break;
            }
            case DeleteAccountUI.BTN_CANCEL: {
                this.onClose()
                break;
            }
            case DeleteAccountUI.BTN_DELETE: {
                Loading.show("Sending Request");

                let reason = userMgr.getUserId() + "-" + userMgr.getUserName() + " - " + this.getReason();
                logMgr.logDebug("ACCOUNT","Delete", reason);
                JSLog.sendTelegramTopic(JSLog.TOPIC.ACCOUNT, "DeleteAccount::" + reason);

                StorageUtil.setInt(this.getKeyCache(), 1);

                setTimeout(function () {
                    Loading.clear();
                    ToastFloat.makeToast(ToastFloat.SHORT,"Request Success !!!");
                    this.curStep++;
                    this.showStep();
                }.bind(this), 1000);
                break;
            }
            default : {
                this.chooseOption(id - DeleteAccountUI.BTN_OPTION);
                break;
            }
        }
    }
});

DeleteAccountUI.className = "DeleteAccountUI";
DeleteAccountUI.TAG = 1001;

DeleteAccountUI.KEY_DELETE_ACCOUNT = "_game_delete_account_";

DeleteAccountUI.BTN_CLOSE = 100;
DeleteAccountUI.BTN_NEXT = 101;
DeleteAccountUI.BTN_DELETE = 102;
DeleteAccountUI.BTN_CANCEL = 103;
DeleteAccountUI.BTN_FINISH = 104;

DeleteAccountUI.BTN_OPTION = 200;