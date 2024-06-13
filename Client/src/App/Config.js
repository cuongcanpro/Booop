
var Config = function () {

};

Config.ENABLE_CHEAT = false;
Config.ENABLE_DEVICE_CHEAT = true;
Config.ENABLE_W32_CHEAT = true;

Config.SERVER = {
    LIVE : {
        TYPE : "live",
        IP: "35.185.181.71",
        PORT: 443
    },
    QC1 : {
        TYPE : "qc",
        IP: "120.138.72.33",
        PORT: 10351
    },
    DEV1 : {
        TYPE : "dev",
        IP: "120.138.72.33",
        PORT: 10347
    },
    QC2 : {
        TYPE : "qc2",
        IP: "120.138.72.33",
        PORT: 10353
    },
    DEV2 : {
        TYPE : "dev2",
        IP: "120.138.72.33",
        PORT: 10349
    },
    LOCAL : {
        TYPE : "local",
        IP: "127.0.0.1",
        PORT: 10116
    }
}

Config.PATH_AVATAR = "avatar/";

//cheat
Config.CHEAT_MAX_PLAYER = 5;
Config.CHEAT_MAX_CARD = 12;
Config.CARD_CHEAT_SCALE_DECK = 0.45;
Config.CARD_CHEAT_SCALE_PLAYER = 0.29;
Config.CARD_CHEAT_PLAYER_LINE = 2;

//Config Module
Config.ENABLE_EVENT = true;

// test update private
Config.MANIFEST_URL_LIVE = "";
Config.MANIFEST_URL_PRIVATE = "";

Config.CARD_MULTI_COLOR = false;

// FEATURES
Config.IS_GAPLE_MAINTAIN = false;
Config.IS_GAPLE_DISABLE = false;
