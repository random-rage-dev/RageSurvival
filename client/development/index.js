console.log = function(...a) {
    mp.gui.chat.push("DEBUG:" + a.join(" "))
};
mp.gameplayCam = mp.cameras.new('gameplay');
require("./vector.js")
require("./scaleforms/index.js")
require("./crouch.js")
require("./items.js")
require("./zombies.js")
require("./gathering.js")
require("./building.js")
require("./loot_spawns_placement.js") // remove once done
var natives = require("./natives.js")
var CEFBrowser = require("./browser.js");
var Browser = new CEFBrowser("login/index.html");

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

    LastCam = mp.cameras.new('default', new mp.Vector3(593.5968627929688, -1820.015869140625, 142.7814483642578), new mp.Vector3(), 60);
    LastCam.pointAtCoord(163.39794921875, -1788.3284912109375, 27.982322692871094);
    LastCam.setActive(true);
    mp.game.cam.renderScriptCams(true, false, 0, true, false);
    mp.game.ui.displayHud(false);
    mp.game.ui.displayRadar(false);
    mp.game.graphics.transitionToBlurred(1);
    Browser.cursor(true);
    setTimeout(function() {
        Browser.call("cef_loadlogin", mp.players.local.name)
    }, 100);
});
mp.events.add("Account:Alert", function(...args) {
    Browser.call("alert_login", args[0])
});
mp.events.add("Account:HideLogin", () => {
    mp.game.graphics.transitionFromBlurred(500);
    Browser.cursor(false);
    Browser.call("cef_hidelogin")
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
})
mp.events.add("Cam:Hide", () => {
    mp.game.graphics.transitionFromBlurred(100);
    LastCam.setActive(false);
    mp.game.cam.renderScriptCams(false, false, 0, true, false);
    mp.game.ui.displayRadar(true);
    mp.game.ui.displayHud(true);
    mp.game.ui.setMinimapVisible(false)
    mp.game.player.setTargetingMode(1);
    mp.game.player.setLockon(false);
    mp.game.player.setLockonRangeOverride(0.0);
    mp.players.local.setOnlyDamagedByPlayer(false);
    mp.players.local.setProofs(true, false, false, false, false, false, false, false);
    mp.game.player.setHealthRechargeMultiplier(0.0);
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
/*mp.events.add("Player:UpdateEXP", (currentRankLimit, nextRankLimit, lastRankEXP, currentXP, currentLvl) => {
    exp.showEXPBar(currentRankLimit, nextRankLimit, lastRankEXP, currentXP, currentLvl)
});*/



mp.events.add("Notifications:New", (notification_data) => {
    Browser.call("notify", notification_data)
})
mp.events.add('Player:Collision', (enable) => {
    if (enable == true) {
        mp.vehicles.forEach(vehicle => {
            if (mp.players.local.vehicle) {
                mp.players.local.vehicle.setNoCollision(vehicle.handle, true);
                natives.SET_ENTITY_NO_COLLISION_ENTITY(mp.players.local.vehicle, vehicle, true)
                natives.SET_ENTITY_NO_COLLISION_ENTITY(vehicle, mp.players.local.vehicle, true)
            }
            vehicle.setAlpha(255);
        });
    } else {
        mp.vehicles.forEach(vehicle => {
            if (mp.players.local.vehicle) {
                mp.players.local.vehicle.setNoCollision(vehicle.handle, false);
                natives.SET_ENTITY_NO_COLLISION_ENTITY(vehicle, mp.players.local.vehicle, false)
                natives.SET_ENTITY_NO_COLLISION_ENTITY(mp.players.local.vehicle, vehicle, false)
            }
            vehicle.setAlpha(150);
        });
    }
});
