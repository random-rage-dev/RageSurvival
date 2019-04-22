mp.rpc = require("./libs/rage-rpc.min.js");
console.log = function(...a) {
    mp.gui.chat.push("DEBUG:" + a.join(" "))
};
mp.isValid = function(val) {
    return val != null && val != undefined && val != "";
}
mp.gameplayCam = mp.cameras.new('gameplay');
mp.defaultCam = mp.cameras.new('default');
mp.localPlayer = mp.players.local;
require("./vector.js")
require("./scaleforms/index.js")
require("./crouch.js")
require("./items.js")
require("./crafting.js")
require("./zombies.js")
require("./gathering.js")
require("./building.js")
require("./login.js")
require("./combat.js")
require("./character_creator.js")
require("./vehicles.js")
require("./storage.js")
var natives = require("./natives.js")
var CEFNotification = require("./browser.js").notification;
mp.events.add("Notifications:New", (notification_data) => {
    CEFNotification.call("notify", notification_data)
})
/*CEFNotification.call("notify", {
                    title: "Buyable",
                    titleSize: "16px",
                    message: `${name} just got unlocked`,
                    messageColor: 'rgba(0,50,0,.8)',
                    position: "topCenter",
                    backgroundColor: 'rgba(86, 206, 86, 0.9)',
                    close: false
                })*/
/*mp.events.add("Player:UpdateEXP", (currentRankLimit, nextRankLimit, lastRankEXP, currentXP, currentLvl) => {
    exp.showEXPBar(currentRankLimit, nextRankLimit, lastRankEXP, currentXP, currentLvl)
});*/
mp.events.add("Player:WanderDuration", (ms) => {
    console.log("GO WANDER");
    let p = mp.players.local.position;
    mp.players.local.taskWanderStandard(10, 10);
    setTimeout(function() {
        mp.players.local.clearTasksImmediately();
    }, ms)
});
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