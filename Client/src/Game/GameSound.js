/**
 * Created by GSN on 10/21/2015.
 */

var audioEngine = cc.audioEngine;

var gameSound = function () {
};

gameSound.voiceId = -1; //id voice dang bat (chi bat 1 voice trong 1 khoang thoi gian.
gameSound.timeEffect = -1;
gameSound.resetQQMusic = true;
gameSound.resetGapleMusic = true;
gameSound.resetLobbyMusic = true;

//region Common Sound
gameSound.off = function () {
    if (!settingMgr.sound) {
        jsb.AudioEngine.stopAll();

        gameSound.resetQQMusic = true;
        gameSound.resetGapleMusic = true;
        gameSound.resetLobbyMusic = true;
    }
}

gameSound.playLobbyMusic = function () {
    if (settingMgr.music) {
        if (gameSound.resetLobbyMusic) {
            gameSound.resetLobbyMusic = false
            gameSound.lobbyMusic = jsb.AudioEngine.play2d(game_sounds.lobby_sound, true, 0.1);
            return;
        }

        if (gameSound.lobbyMusic !== undefined) {
            jsb.AudioEngine.resume(gameSound.lobbyMusic);
            return;
        }

        gameSound.lobbyMusic = jsb.AudioEngine.play2d(game_sounds.lobby_sound, true, 0.1);
    }
}

gameSound.stopLobbyMusic = function (forceStop) {
    if (!settingMgr.music || forceStop) {
        if (gameSound.lobbyMusic !== undefined) {
            jsb.AudioEngine.pause(gameSound.lobbyMusic);
        }
    }
}

gameSound.playCountDown = function () {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.game_count_down, false);
    }
};

gameSound.joinRoom = function () {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.joinRoom, false, 1);
    }
};

gameSound.playCountDown = function () {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.countdown, false);
    }
};

gameSound.musicLose = function () {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.lose, false);
    }
};

gameSound.musicWin = function () {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.win, false, 1);
    }
};

gameSound.musicBigWin = function () {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.bigWin, false, 1);
    }
};

gameSound.playCoinFall = function () {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.coin_fall, false);
    }
};

gameSound.playCoinFly = function (delay, noRandom) {
    if (settingMgr.sound) {
        if (delay) {
            setTimeout(function () {
                var rnd = parseInt(Math.random() * 100) % 3 + 1;
                if (rnd < 3 || noRandom) jsb.AudioEngine.play2d(lobby_sounds["coin" + rnd], false);
            }, delay * 1000);
        } else {
            var rnd = parseInt(Math.random() * 100) % 3 + 1;
            if (rnd < 3 || noRandom) jsb.AudioEngine.play2d(lobby_sounds["coin" + rnd], false);
        }
    }
};

gameSound.playOpenCard = function (delay) {
    if (settingMgr.sound) {
        if (delay) {
            setTimeout(function () {
                jsb.AudioEngine.play2d(game_sounds.lat_bai, false);
            }, delay * 1000);
        } else jsb.AudioEngine.play2d(game_sounds.lat_bai, false);
    }
};

gameSound.voiceFastTurn = function () {
    if (settingMgr.sound) {
        var rand = Math.floor(Math.random() * 100) % 8;
        gameSound.voiceId = jsb.AudioEngine.play2d(game_sounds["v_fast_turn_" + rand], false);
    }
};

gameSound.playSoundClick = function () {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(lobby_sounds.click, false);
    }
};

gameSound.playVoiceStartGame = function () {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.voice_start_game, false, 1);
    }
};
//endregion

//region Qiu Qiu Sound
gameSound.playQiuQiuMusic = function () {
    if (settingMgr.music) {
        if (gameSound.resetQQMusic) {
            gameSound.resetQQMusic = false
            gameSound.qiuqiu_board_sound = jsb.AudioEngine.play2d(game_sounds.qiuqiu_board_sound, true, 0.1);
            return;
        }

        if (gameSound.qiuqiu_board_sound !== undefined) {
            jsb.AudioEngine.resume(gameSound.qiuqiu_board_sound);
            return;
        }

        gameSound.qiuqiu_board_sound = jsb.AudioEngine.play2d(game_sounds.qiuqiu_board_sound, true, 0.1);
    }
}

gameSound.stopQiuQiuMusic = function (forceStop) {
    if (!settingMgr.music || forceStop) {
        if (gameSound.qiuqiu_board_sound !== undefined) {
            jsb.AudioEngine.pause(gameSound.qiuqiu_board_sound);
        }
    }
}

gameSound.playQiuQiuStartGame = function () {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.qiuqiu_start_game, false, 0.3);
    }
};

gameSound.playQiuQiuDealCard = function () {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.qiuqiu_deal_card, false, 0.5);
    }
};

gameSound.playQiuQiuPlayerTurn = function () {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.qiuqiu_player_turn, false, 0.1);
    }
};

gameSound.playQiuQiuPlaceChip = function () {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.qiuqiu_place_chip, false, 0.5);
    }
};

gameSound.playQiuQiuShuffleCard = function (stop) {
    if (settingMgr.sound) {
        if (stop && gameSound.qiuQiuShuffleCardSound) {
            jsb.AudioEngine.stop(gameSound.qiuQiuShuffleCardSound);
            gameSound.qiuQiuShuffleCardSound = undefined;
            return;
        }

        gameSound.qiuQiuShuffleCardSound = jsb.AudioEngine.play2d(game_sounds.qiuqiu_shuffle_card, false, 0.5);
    }
};

gameSound.playQiuQiuDisappointSound = function (stop) {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.qiuqiu_disappoint_sound, false, 0.5);
    }
};

gameSound.playQiuQiuGoodSound = function (stop) {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.qiuqiu_good_sound, false, 0.5);
    }
};

gameSound.playQiuQiuAnBai = function (stop) {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.qiuqiu_an_bai, false, 0.5);
    }
};

gameSound.playQiuQiuFold = function (stop) {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.qiuqiu_FOLD, false, 0.5);
    }
};

gameSound.playQiuQiuAllin = function (stop) {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.qiuqiu_ALLIN, false, 0.5);
    }
};

gameSound.playQiuQiuCountDown = function (stop) {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.qiuqiu_countdown, false, 0.5);
    }
};

gameSound.playQiuQiuSoundCheck = function () {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.qiuqiu_sound_check, false, 0.7);
    }
};
//endregion

//region Qiu Qiu Voice
// id 0 -> 11
gameSound.playQiuQiuVoiceWin = function (id = 0) {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.qiuqiu_voice_win.replace("@", "" + (id + 1)), false, 1);
    }
};

// id 0 -> 8
gameSound.playQiuQiuVoiceLose = function (id = 0) {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.qiuqiu_voice_lose.replace("@", "" + (id + 1)), false, 1);
    }
};

// id 0 -> 2
gameSound.playQiuQiuVoiceAllin = function (id = 0) {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.qiuqiu_voice_indo_all_in, false, 1);
    }
};

gameSound.playQiuQiuVoiceCheck = function (id = 0) {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.qiuqiu_voice_indo_check, false, 1);
    }
};

gameSound.playQiuQiuVoiceCall = function (id = 0) {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.qiuqiu_voice_indo_ikut, false, 1);
    }
};

gameSound.playQiuQiuVoiceRaise = function (id = 0) {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.qiuqiu_voice_indo_naik, false, 1);
    }
};

gameSound.playQiuQiuVoiceFold = function (id = 0) {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.qiuqiu_voice_indo_balik, false, 1);
    }
};

// id 0 -> 2
gameSound.playQiuQiuVoiceSixDevils = function (id = 0) {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.qiuqiu_voice_six_devils.replace("@", "" + (id + 1)), false, 1);
    }
};

gameSound.playQiuQiuVoiceTwinCard = function (id = 0) {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.qiuqiu_voice_twin_card.replace("@", "" + (id + 1)), false, 1);
    }
};

gameSound.playQiuQiuVoiceSmallCard = function (id = 0) {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.qiuqiu_voice_small_card.replace("@", "" + (id + 1)), false, 1);
    }
};

gameSound.playQiuQiuVoiceBigCard = function (id = 0) {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.qiuqiu_voice_big_card.replace("@", "" + (id + 1)), false, 1);
    }
};

gameSound.playQiuQiuVoiceQiuQiu = function (id = 0) {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.qiuqiu_voice_qiuqiu.replace("@", "" + (id + 1)), false, 1);
    }
};
//endregion

//region Gaple Sound
gameSound.playGapleMusic = function () {
    if (settingMgr.music) {
        if (gameSound.resetGapleMusic) {
            gameSound.resetGapleMusic = false
            gameSound.gaple_board_music = jsb.AudioEngine.play2d(game_sounds.qiuqiu_board_sound, true, 0.1);
            return;
        }

        if (gameSound.gaple_board_music !== undefined) {
            jsb.AudioEngine.resume(gameSound.gaple_board_music);
            return;
        }

        gameSound.gaple_board_music = jsb.AudioEngine.play2d(game_sounds.qiuqiu_board_sound, true, 0.1);
    }
}

gameSound.stopGapleMusic = function (forceStop) {
    if (!settingMgr.music || forceStop) {
        if (gameSound.gaple_board_music !== undefined) {
            jsb.AudioEngine.pause(gameSound.gaple_board_music);
        }
    }
}

gameSound.playGaplePrepareDealCard = function () {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.gaple_prepare_deal_card, false, 0.5);
    }
};

gameSound.playGapleDealCard = function () {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.gaple_deal_card, false, 0.5);
    }
};

gameSound.playGapleCountdown = function () {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.gaple_countdown, false, 0.5);
    }
};

gameSound.playGapleStartGame = function () {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.gaple_start_game, false, 0.5);
    }
};

gameSound.playGaplePlayerTurn = function () {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.qiuqiu_player_turn, false, 0.2);
    }
};

gameSound.playGaplePlaceGold = function () {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.gaple_place_gold, false, 0.5);
    }
};

gameSound.playGapleStartGold = function () {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.gaple_start_gold, false, 0.5);
    }
};

gameSound.playGapleDominoTouchTable = function () {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.gaple_domino_touch_table, false, 0.7);
    }
};

gameSound.playGapleLastDominoTouchTable = function () {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.gaple_last_domino_touch_table, false, 1);
    }
};

gameSound.playGapleLastDominoUp = function () {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.gaple_last_domino_up, false, 1);
    }
};

gameSound.playGapleDominoTouchDomino = function () {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.gaple_domino_touch_domino, false, 1);
    }
};

gameSound.playGapleSoundLewat = function (id = 0) {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.gaple_sound_lewat, false, 0.5);
    }
};
//endregion

//region Gaple Voice
// id 0 -> 11
gameSound.playGapleVoiceWin = function (id = 0) {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.qiuqiu_voice_win.replace("@", "" + (id + 1)), false, 1);
    }
};

// id 0 -> 8
gameSound.playGapleVoiceLose = function (id = 0) {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.qiuqiu_voice_lose.replace("@", "" + (id + 1)), false, 1);
    }
};

gameSound.playGapleVoiceLewat = function (id = 0) {
    if (settingMgr.sound) {
        jsb.AudioEngine.play2d(game_sounds.gaple_void_lewat, false, 1);
    }
};
//endregion




