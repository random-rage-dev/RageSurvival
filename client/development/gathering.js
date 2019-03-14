require("./vector.js")
var natives = require("./natives.js")
var materials = require("./materials.js")

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
                if (materials[hitData.material] != undefined) {
                    nearest.dist = dist;
                    nearest.pos = exit_ps;
                    nearest.resource = materials[hitData.material];
                }
            }
        }
    }
    return nearest.resource != "" ? nearest.resource : false;
}

mp.keys.bind(0x09, false, () => {
    console.log(JSON.stringify(checkResourceInFront(2)));
});