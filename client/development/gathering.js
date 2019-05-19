require("./vector.js")
var natives = require("./natives.js")
var materials = require("./materials.js")
var StorageSystem = require("./storage.js");

function checkResourceInFront(max_dist) {
    let nearest = {
        dist: max_dist,
        pos: null,
        resource: ""
    }
    let pos = new mp.Vector3(mp.players.local.position.x, mp.players.local.position.y, mp.players.local.position.z);
    let heading = mp.players.local.getHeading();
    pos = pos.findRot(heading, 0.5, 90);
    for (var i = 0; i < 180; i += 10) {
        let exit_ps = pos.findRot(heading, 5, i);
        let hitData = mp.raycasting.testCapsule(pos, exit_ps, 0.1, mp.players.local.handle, -1);
        if (hitData) {
            exit_ps = new mp.Vector3(hitData.position.x, hitData.position.y, hitData.position.z)
            let dist = pos.dist(exit_ps);
            if (dist < nearest.dist) {
                if (materials[hitData.material] == true) {
                    nearest.dist = dist;
                    nearest.pos = exit_ps;
                    nearest.resource = hitData.material;
                }
            }
        }
    }
    return nearest.resource != "" ? nearest.resource : false;
}
let addText = "";
mp.events.add("render", () => {
    if (mp.ui.ready == true) {
        if ((mp.localPlayer.getVariable('hasHatchet') == true) || (mp.localPlayer.getVariable('hasPickaxe') == true)) {
            if ((mp.localPlayer.getVariable('canGather') == true)) {
                let material = checkResourceInFront(0.5);
                if (material) {
                    if (((mp.localPlayer.getVariable('hasHatchet') == true) && (materials[material] == 1)) || ((mp.localPlayer.getVariable('hasPickaxe') == true) && (materials[material] == 2))) {
                        mp.game.controls.disableControlAction(0, 51, true);
                        mp.game.ui.showHudComponentThisFrame(14);
                        mp.game.graphics.drawText("[E] Gather Material", [0.5, 0.55], {
                            font: 4,
                            color: [255, 255, 255, 200],
                            scale: [0.3, 0.3],
                            outline: true,
                            centre: true
                        });
                        if ((addText != "")) {
                            mp.game.graphics.drawText("\n[" + addText + "]", [0.5, 0.55], {
                                font: 4,
                                color: [255, 150, 150, 200],
                                scale: [0.3, 0.3],
                                outline: true,
                                centre: true
                            });
                        }
                        if (mp.game.controls.isDisabledControlJustPressed(0, 51)) { // 51 == "E"
                            let doesFit = StorageSystem.checkFit("inventory", 2, 2)
                            doesFit.then(function(fit) {
                                if (fit != undefined) {
                                    mp.events.callRemote("Player:Gather", material.toString());
                                } else {
                                    addText = "Not enough Space"
                                }
                            });
                        }
                    } else {
                        addText = "";
                    }
                }
            } else {
                addText = "";
            }
        }
    }
});
/*mp.keys.bind(0x09, false, () => {
    console.log(JSON.stringify(checkResourceInFront(2)));
});*/
module.exports = checkResourceInFront;