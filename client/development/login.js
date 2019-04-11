//1868.765869140625, 3710.90283203125, 113.74462127685547
var natives = require("./natives.js")
var CEFInterface = require("./browser.js").interface;
var CEFInventory = require("./browser.js").inventory;
var CEFNotification = require("./browser.js").notification;
CEFInterface.load("login/index.html");

function clearBlips() {
    natives.SET_THIS_SCRIPT_CAN_REMOVE_BLIPS_CREATED_BY_ANY_SCRIPT(true);
    let last_blip = natives.GET_FIRST_BLIP_INFO_ID(5);
    while (natives.DOES_BLIP_EXIST(last_blip)) {
        mp.game.ui.removeBlip(last_blip);
        last_blip = natives.GET_NEXT_BLIP_INFO_ID(5);
    }
    mp.game.wait(50);
}
// Account Stuff
mp.events.callRemote("ServerAccount:Ready");
mp.game.graphics.transitionToBlurred(1);
var LastCam;
mp.events.add("Server:RequestLogin", () => {
    clearBlips();
    mp.players.local.position = new mp.Vector3(2927.993408203125, 5618.33544921875, 244.45285034179688);
    mp.players.local.setAlpha(0);
    mp.defaultCam = mp.cameras.new('default', new mp.Vector3(2927.993408203125, 5618.33544921875, 244.45285034179688), new mp.Vector3(), 70);
    mp.defaultCam.pointAtCoord(2906.989501953125, 5563.49267578125, 245.226806640625);
    mp.defaultCam.setActive(true);
    mp.game.cam.renderScriptCams(true, false, 0, true, false);
    mp.game.ui.displayHud(false);
    mp.game.ui.displayRadar(false);
    mp.game.graphics.transitionToBlurred(1);
    CEFInterface.cursor(true);
    setTimeout(function() {
        CEFInterface.call("cef_loadlogin", mp.players.local.name)
    }, 100);
});
mp.events.add("Account:Alert", function(...args) {
    CEFInterface.call("alert_login", args[0])
});
mp.events.add("Account:HideLogin", () => {
    mp.game.graphics.transitionFromBlurred(500);
    CEFInterface.cursor(false);
    CEFInterface.call("cef_hidelogin")
});
mp.events.add("Account:LoginDone", () => {
    mp.game.player.setTargetingMode(1);
    mp.game.player.setLockon(false);
    mp.game.player.setLockonRangeOverride(0.0);
    mp.players.local.setOnlyDamagedByPlayer(false);
    mp.players.local.setProofs(true, false, false, false, false, false, false, false);
    mp.game.player.setHealthRechargeMultiplier(0.0);
    mp.game.ui.displayRadar(true);
    mp.game.ui.displayHud(true);
    mp.game.ui.setMinimapVisible(false)
    //CEFInventory.load("user_interface/index.html");
})
mp.events.add("Cam:Hide", () => {
    mp.game.graphics.transitionFromBlurred(100);
    mp.game.ui.displayRadar(true);
    mp.game.ui.displayHud(true);
    mp.game.ui.setMinimapVisible(false)
    mp.game.player.setTargetingMode(1);
    mp.game.player.setLockon(false);
    mp.game.player.setLockonRangeOverride(0.0);
    mp.players.local.setOnlyDamagedByPlayer(false);
    mp.players.local.setProofs(true, false, false, false, false, false, false, false);
    mp.game.player.setHealthRechargeMultiplier(0.0);
    mp.players.local.freezePosition(false);
    mp.game.cam.renderScriptCams(false, false, 0, true, false);
    mp.game.cam.doScreenFadeIn(1000);
})

mp.events.add("entityStreamIn", (entity) => {
    if (entity.type !== "player") return;
    mp.game.player.setTargetingMode(1);
    mp.game.player.setLockon(false);
    mp.game.player.setLockonRangeOverride(0.0);
    mp.players.local.setOnlyDamagedByPlayer(false);
    mp.players.local.setProofs(true, false, false, false, false, false, false, false);
    mp.game.player.setLockonRangeOverride(0.0);
});
mp.events.add("Account:Login", (username, password) => {
    mp.events.callRemote("ServerAccount:Login", username, password);
});
mp.events.add("Account:Register", (username, hash_password, salt) => {
    mp.events.callRemote("ServerAccount:Register", username, hash_password, salt);
});