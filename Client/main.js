var js_runtime_reloader_enabled = jsb.fileUtils.isDirectoryExist("tool_js_reloader");
if(js_runtime_reloader_enabled){
    require("tool_js_reloader/scripts/code-bindings.js");
}
cc.game.onStart = function () {
    if(js_runtime_reloader_enabled){
        require("tool_js_reloader/scripts/auto/code-bindings-auto.js");
        require("tool_js_reloader/scripts/custom/code-bindings-custom.js");
        zpsdn.init();
    }
    if (!cc.sys.isNative && document.getElementById("cocosLoading"))
        document.body.removeChild(document.getElementById("cocosLoading"));

    let rect = cc.rect(0, 0, 100, 100);
    cc.log("content " + cc.rectContainsPoint(rect, cc.p(40, 40)));
    gameMgr.initGame();

};
cc.game.run();