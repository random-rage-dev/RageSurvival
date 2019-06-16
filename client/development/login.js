//1868.765869140625, 3710.90283203125, 113.74462127685547
var natives = require("./natives.js")
var CEFInterface = require("./browser.js").interface;
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
mp.gui.chat.show(false);
mp.events.callRemote("ServerAccount:Ready");
mp.game.graphics.transitionToBlurred(1);
var LastCam;
mp.events.add("Server:RequestLogin", () => {
    clearBlips();
    mp.players.local.position = new mp.Vector3(-76.66345977783203, -818.8128051757812, 327.5135498046875);
    mp.players.local.setAlpha(0);
    mp.players.local.freezePosition(true);
    mp.defaultCam = mp.cameras.new('default', new mp.Vector3(749.273193359375, 1294.376708984375, 391.9619445800781), new mp.Vector3(), 70);
    mp.defaultCam.pointAtCoord(485.366455078125, -1569.3214111328125, 203.82797241210938);
    mp.defaultCam.setActive(true);
    mp.game.cam.renderScriptCams(true, false, 0, true, false);
    mp.game.ui.displayHud(false);
    mp.game.ui.displayRadar(false);
    mp.game.graphics.transitionToBlurred(1);
    CEFInterface.cursor(true);
    setTimeout(function() {
        CEFInterface.call("cef_loadlogin", mp.players.local.name)
        var camera2 = mp.cameras.new('default', new mp.Vector3(-93.45111846923828, -826.1639404296875, 333.6698303222656), new mp.Vector3(), 70);
        camera2.pointAtCoord(-76.66345977783203, -818.8128051757812, 327.5135498046875);
        camera2.setActive(true);
        camera2.setActiveWithInterp(mp.defaultCam.handle, 60 * 1000 * 10, 0, 0);
        mp.game.streaming.setHdArea(-76.66345977783203, -818.8128051757812, 327.5135498046875, 327.5135498046875);
        mp.game.streaming.loadScene(-76.66345977783203, -818.8128051757812, 327.5135498046875);
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
    mp.game.ui.setMinimapVisible(false);
    mp.gui.chat.show(true);
    //startMakingItems();
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
/*
function startMakingItems() {
    mp.objects.new(mp.game.joaat("v_res_fa_bread01"), new mp.Vector3(1001, 620, 850), {
        rotation: new mp.Vector3(0, 0, 90),
        alpha: 255,
        dimension: 0
    });
    mp.events.add('render', () => {
        mp.players.local.freezePosition(true);
        mp.players.local.position = new mp.Vector3(1045, 620, 850);
        mp.players.local.setAlpha(0);
        mp.defaultCam.setFov(30);
        mp.defaultCam.setCoord(1004, 620, 850);
        mp.defaultCam.pointAtCoord(1000, 620, 850);
        mp.defaultCam.setActive(true);
        mp.game.cam.renderScriptCams(true, false, 0, true, false);
        mp.game.graphics.drawBox(1000, 500, 550, 1000, 1500, 1550, 0, 255, 0, 255);
    });
}*/