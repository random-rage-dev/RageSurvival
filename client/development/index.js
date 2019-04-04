console.log = function(...a) {
    mp.gui.chat.push("DEBUG:" + a.join(" "))
};
mp.gameplayCam = mp.cameras.new('gameplay');
require("./vector.js")
require("./scaleforms/index.js")
require("./crouch.js")
require("./items.js")
require("./crafting.js")
require("./zombies.js")
require("./gathering.js")
require("./building.js")
require("./login.js")
var natives = require("./natives.js")

var CEFInterface = require("./browser.js").interface;
var CEFNotification = require("./browser.js").notification;

/*mp.events.add("Player:UpdateEXP", (currentRankLimit, nextRankLimit, lastRankEXP, currentXP, currentLvl) => {
    exp.showEXPBar(currentRankLimit, nextRankLimit, lastRankEXP, currentXP, currentLvl)
});*/



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
