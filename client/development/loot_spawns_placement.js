const controlsIds = {
    F5: 327,
    W: 32, // 232
    S: 33, // 31, 219, 233, 268, 269
    A: 34, // 234
    D: 35, // 30, 218, 235, 266, 267
    Space: 321,
    LCtrl: 326,
    Mouse1: 24,
    Mouse2: 25,
    Shift: 21
};
global.fly = {
    flying: false,
    f: 2.0,
    w: 2.0,
    h: 2.0,
    point_distance: 1000,
};
global.gameplayCam = mp.cameras.new('gameplay');
mp.game.graphics.notify('~r~F5~w~ - enable/disable');
let direction = null;
let coords = null;

function pointingAt(distance) {
    const farAway = new mp.Vector3((direction.x * distance) + (coords.x), (direction.y * distance) + (coords.y), (direction.z * distance) + (coords.z));
    const result = mp.raycasting.testPointToPoint(coords, farAway, mp.players.local, [1, 16]);
    if (result === undefined) {
        return undefined;
    }
    return result;
}
var placed_loot_pool = [];

function getNearestSpot(vector, dist) {
    let spot = {
        index: -1,
        pos: null,
        dist: dist
    }
    placed_loot_pool.forEach(function(pos, index) {
        let pos_spot = new mp.Vector3(pos.x, pos.y, pos.z);
        let dist_spot = vector.dist(pos_spot);
        if (dist_spot < spot.dist) {
            spot.dist = dist_spot;
            spot.pos = pos_spot;
            spot.index = index;
        }
    })
    return spot;
}
let selected_type = "Residential";
let types = ["Industrial", "Other", "Military", "Residential", "Food", "Hospital", "Police", "Resdential", "Beach", "Forest", "Farm", "Land"]

function getSelectedType() {
    return selected_type;
}
mp.events.add('render', () => {
    const fly = global.fly;
    direction = global.gameplayCam.getDirection();
    coords = global.gameplayCam.getCoord();
    if (mp.game.controls.isControlJustPressed(0, controlsIds.F5)) {
        fly.flying = !fly.flying;
        const player = mp.players.local;
        player.setInvincible(fly.flying);
        player.freezePosition(fly.flying);
        player.setAlpha(fly.flying ? 0 : 255);
        if (!fly.flying) {
            const position = mp.players.local.position;
            position.z = mp.game.gameplay.getGroundZFor3dCoord(position.x, position.y, position.z, 0.0, false);
            mp.players.local.setCoordsNoOffset(position.x, position.y, position.z, false, false, false);
        }
        mp.game.graphics.notify(fly.flying ? 'Fly: ~g~Enabled' : 'Fly: ~r~Disabled');
    } else if (fly.flying) {
        let updated = false;
        const position = mp.players.local.position;
        if (mp.game.controls.isControlPressed(0, controlsIds.W)) {
            if (mp.game.controls.isControlPressed(0, controlsIds.LCtrl)) {
                fly.f = 0.1;
            }
            if (mp.game.controls.isControlPressed(0, controlsIds.Shift)) {
                fly.f = 4.0;
            }
            position.x += direction.x * fly.f;
            position.y += direction.y * fly.f;
            position.z += direction.z * fly.f;
            updated = true;
        } else if (mp.game.controls.isControlPressed(0, controlsIds.S)) {
            if (mp.game.controls.isControlPressed(0, controlsIds.LCtrl)) {
                fly.f = 0.1;
            }
            if (mp.game.controls.isControlPressed(0, controlsIds.Shift)) {
                fly.f = 4.0;
            }
            position.x -= direction.x * fly.f;
            position.y -= direction.y * fly.f;
            position.z -= direction.z * fly.f;
            updated = true;
        } else {
            fly.f = 2.0;
        }
        if (mp.game.controls.isControlPressed(0, controlsIds.A)) {
            if (mp.game.controls.isControlPressed(0, controlsIds.LCtrl)) {
                fly.l = 0.1;
            }
            if (mp.game.controls.isControlPressed(0, controlsIds.Shift)) {
                fly.l = 4.0;
            }
            position.x += (-direction.y) * fly.l;
            position.y += direction.x * fly.l;
            updated = true;
        } else if (mp.game.controls.isControlPressed(0, controlsIds.D)) {
            if (mp.game.controls.isControlPressed(0, controlsIds.LCtrl)) {
                fly.l = 0.1;
            }
            if (mp.game.controls.isControlPressed(0, controlsIds.Shift)) {
                fly.l = 4.0;
            }
            position.x -= (-direction.y) * fly.l;
            position.y -= direction.x * fly.l;
            updated = true;
        } else {
            fly.l = 2.0;
        }
        mp.game.controls.disableControlAction(2, 16, true);
        mp.game.controls.disableControlAction(2, 17, true);
        if (mp.game.controls.isDisabledControlJustPressed(2, 16)) {
            let cIndex = types.indexOf(getSelectedType());
            if ((cIndex + 1) > types.length) {
                cIndex = types.length;
            } else {
                cIndex += 1;
            }
            if (types[cIndex]) {
                selected_type = types[cIndex];
            }
            /*Prev*/
        } else if (mp.game.controls.isDisabledControlJustPressed(2, 17)) {
            let cIndex = types.indexOf(getSelectedType());
            if ((cIndex - 1) < 0) {
                cIndex = 0;
            } else {
                cIndex -= 1;
            }
            if (types[cIndex]) {
                selected_type = types[cIndex];
            }
            /*Next*/
        }
        mp.game.ui.showHudComponentThisFrame(14);
        let pPos = pointingAt(1000);
        if (pPos != undefined) {
            let pos = mp.vector(pPos.position);
            pos.z += 0.02;
            let nearest = getNearestSpot(pos, 2);
            if (nearest.index == -1) {
                mp.game.graphics.drawMarker(28, pos.x, pos.y, pos.z, 0, 0, 0, 0, 0, 0, 1.0, 1.0, 1.0, 0, 150, 0, 150, false, false, 2, false, "", "", false);
                mp.game.graphics.drawText("Selected Type " + selected_type + "\n MouseWheel to Switch", [pos.x, pos.y, pos.z], {
                    font: 4,
                    color: [255, 255, 255, 185],
                    scale: [0.3, 0.3],
                    outline: true,
                    centre: true
                });
                if (mp.game.controls.isControlJustPressed(0, controlsIds.Mouse1)) {
                    placed_loot_pool.push({
                        x: pos.x,
                        y: pos.y,
                        z: pos.z,
                        type: getSelectedType()
                    });
                }
            } else {
                mp.game.graphics.drawMarker(28, pos.x, pos.y, pos.z, 0, 0, 0, 0, 0, 0, 1.0, 1.0, 1.0, 150, 0, 0, 150, false, false, 2, false, "", "", false);
            }
        }
        if (updated) {
            mp.players.local.setCoordsNoOffset(position.x, position.y, position.z, false, false, false);
        }
    }
});
mp.events.add('render', () => {
    let pPos = pointingAt(1000);
    if (pPos != undefined) {
        pPos = mp.vector(pPos.position);
    } else {
        pPos = false;
    }
    placed_loot_pool.forEach(function(pos, index) {
        if (mp.vector(pos).dist(mp.players.local.position) < 100) {
            if (pPos != false) {
                let nearest = getNearestSpot(pPos, 2);
                if (nearest.index == index) {
                    mp.game.graphics.drawMarker(28, pos.x, pos.y, pos.z, 0, 0, 0, 0, 0, 0, 1.0, 1.0, 1.0, 150, 0, 150, 150, false, false, 2, false, "", "", false);
                    mp.game.graphics.drawText("Right Click to Remove", [pos.x, pos.y, pos.z + 0.3], {
                        font: 4,
                        color: [255, 255, 255, 185],
                        scale: [0.3, 0.3],
                        outline: true,
                        centre: true
                    });
                    if (mp.game.controls.isControlJustPressed(0, controlsIds.Mouse2)) {
                        placed_loot_pool.splice(index, 1);
                    }
                } else {
                    mp.game.graphics.drawMarker(28, pos.x, pos.y, pos.z, 0, 0, 0, 0, 0, 0, 1.0, 1.0, 1.0, 0, 0, 150, 150, false, false, 2, false, "", "", false);
                }
            } else {
                mp.game.graphics.drawMarker(28, pos.x, pos.y, pos.z, 0, 0, 0, 0, 0, 0, 1.0, 1.0, 1.0, 0, 0, 150, 150, false, false, 2, false, "", "", false);
            }
            mp.game.graphics.drawText(pos.type, [pos.x, pos.y, pos.z], {
                font: 4,
                color: [255, 255, 255, 185],
                scale: [0.3, 0.3],
                outline: true,
                centre: true
            });
        }
    });
});