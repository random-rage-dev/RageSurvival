require("./vector.js")
var natives = require("./natives.js")
var materials = require("./materials.js")
console.log = function(...a) {
    mp.gui.chat.push("DEBUG:" + a.join(" "))
};
mp.events.add("render", () => {
    let nearest = {
        dist: 9999,
        pos: null
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
                mp.game.graphics.drawLine(pos.x, pos.y, pos.z, exit_ps.x, exit_ps.y, exit_ps.z, 0, 255, 0, 255);
                mp.game.graphics.drawText("Found " + (materials[hitData.material] != undefined ? materials[hitData.material] : hitData.material), [exit_ps.x, exit_ps.y, exit_ps.z], {
                    font: 4,
                    color: [255, 255, 255, 185],
                    scale: [0.3, 0.3],
                    outline: true,
                    centre: true
                });
            } else {
                mp.game.graphics.drawLine(pos.x, pos.y, pos.z, exit_ps.x, exit_ps.y, exit_ps.z, 159, 150, 0, 255);
            }
            console.log(JSON.stringify(mp.objects.atHandle(hitData.entity)));
        } else {
            mp.game.graphics.drawLine(pos.x, pos.y, pos.z, exit_ps.x, exit_ps.y, exit_ps.z, 255, 0, 0, 255);
        }
    }
});