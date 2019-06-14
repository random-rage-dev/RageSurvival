const toSync = ["health", "running", "engine", "wheel_fl", "wheel_fr", "wheel_rl", "wheel_rr", "fuel", "spark_plugs", "battery"]

function syncVehicle(type, vehicle, value) {
    if (type == "running") {
        //console.log("Set Engine to", value);
        vehicle.setEngineOn(value, true, true);
    }
    if (type == "health") {
        vehicle.setPetrolTankHealth(value);
        vehicle.setBodyHealth(value);
        //vehicle.setEngineHealth(value);
    }
    if (type == "engine") {
        vehicle.setEngineHealth((value == 1 || value == true) ? 1000 : 0);
    }
    let tyres_burst = 0;
    if (type == "wheel_fl") {
        if (value == false) {
            vehicle.setTyreBurst(0, true, 1000);
            tyres_burst += 1;
        } else {
            vehicle.setTyreFixed(0);
        }
    }
    if (type == "wheel_fr") {
        if (value == false) {
            vehicle.setTyreBurst(1, true, 1000);
            tyres_burst += 1;
        } else {
            vehicle.setTyreFixed(1);
        }
    }
    if (type == "wheel_rl") {
        if (value == false) {
            vehicle.setTyreBurst(4, true, 1000);
            tyres_burst += 1;
        } else {
            vehicle.setTyreFixed(4);
        }
    }
    if (type == "wheel_rr") {
        if (value == false) {
            vehicle.setTyreBurst(5, true, 1000);
            tyres_burst += 1;
        } else {
            vehicle.setTyreFixed(5);
        }
    }
    if (tyres_burst >= 3) {
        vehicle.setReduceGrip(true);
    } else {
        vehicle.setReduceGrip(false);
    }
}
toSync.forEach(function(data) {
    mp.events.addDataHandler(data, (entity, value) => {
        if (entity.type === "vehicle") {
            syncVehicle(data, entity, value);
            //console.log(`${data} changed to ${value} on entity ${entity.handle}.`);
        }
    });
})
mp.events.add('entityStreamIn', (entity) => {
    if (entity.type === "vehicle") {
        let components = entity.getVariable("components");
        if (components != undefined) {
            Object.keys(components).forEach(function(key, i) {
                syncVehicle(key, entity, components[key]);
            })
        }
    }
});
var drivenDist = 0;
var drivenOldPos = null;
mp.events.add('playerEnterVehicle', (vehicle, seat) => {
    if (vehicle != null) {
        let running = vehicle.getVariable("running");
        if (running != null) {
            vehicle.freezePosition(false);
            drivenDist = 0;
            if (running == true) {
                vehicle.setEngineOn(true, true, true);
            } else {
                vehicle.setEngineOn(false, true, true);
            }
        }
    }
});
mp.events.add("render", () => {
    let pPos = mp.localPlayer.position;
    /*Draw Vehicle Details*/
    if (mp.localPlayer.vehicle) {
        if (mp.localPlayer.isInAnyVehicle(false)) {
            let veh = mp.localPlayer.vehicle;
            if (veh.getPedInSeat(-1) == mp.localPlayer.handle) {
                if (drivenOldPos != null) {
                    let cPos = mp.localPlayer.vehicle.position;
                    let dist = mp.game.system.vdist(drivenOldPos.x, drivenOldPos.y, drivenOldPos.z, cPos.x, cPos.y, cPos.z);
                    if (dist < 7500 && dist > 0) {
                        drivenDist += dist;
                        if (drivenDist > 100) {
                            mp.events.callRemote("Vehicles:UpdateFuel",drivenDist);
                            drivenDist = 0;
                        }
                    }
                }
                drivenOldPos = mp.localPlayer.vehicle.position;
                if (veh.getVariable("running")) {
                    mp.game.graphics.drawText("Engine:" + (veh.getVariable("running") ? "~g~On" : "~r~Off"), [0.4, 0.8], {
                        font: 4,
                        color: [255, 255, 255, 185],
                        scale: [0.4, 0.4],
                        outline: true,
                        centre: true
                    });
                    let v = Math.ceil(veh.getSpeed() * (veh.getSpeed() / 20) * 2);
                    mp.game.graphics.drawText(v + " KM/H", [0.6, 0.8], {
                        font: 4,
                        color: [255, 255, 255, 185],
                        scale: [0.4, 0.4],
                        outline: true,
                        centre: true
                    });
                    if (veh.getVariable("components").fuel) {
                        mp.game.graphics.drawText("Fuel:" + (veh.getVariable("components").fuel > 0 ? (veh.getVariable("components").fuel.toFixed(2)) : "0") + "L", [0.5, 0.8], {
                            font: 4,
                            color: [255, 255, 255, 185],
                            scale: [0.4, 0.4],
                            outline: true,
                            centre: true
                        });
                    }
                }
            }
        }
    }
    if (mp.players.local.isInAnyVehicle(false)) {
        if (mp.players.local.vehicle != null) {
            if (mp.players.local.vehicle.getVariable("running") != undefined) {
                if (mp.players.local.vehicle.getVariable("running") != true) {
                    mp.game.controls.disableControlAction(0, 278, true);
                    mp.game.controls.disableControlAction(0, 279, true);
                    mp.game.controls.disableControlAction(0, 280, true);
                    mp.game.controls.disableControlAction(0, 281, true);
                    mp.game.controls.disableControlAction(2, 278, true);
                    mp.game.controls.disableControlAction(2, 279, true);
                    mp.game.controls.disableControlAction(2, 280, true);
                    mp.game.controls.disableControlAction(2, 281, true);
                    mp.players.local.vehicle.setEngineOn(false, true, true);
                }
            } else {
                    mp.players.local.vehicle.setEngineOn(true, true, true);
                
            }
        }
    }
});
mp.keys.bind(0x58, true, function() {
    mp.events.callRemote("Vehicles:ToggleEngine");
    mp.events.callRemote("Vehicles:RequestInventory");
});
var seats = {
    0: "seat_pside_f", // passanger side front
    1: "seat_dside_r", // driver side rear
    2: "seat_pside_r", // passanger side rear
    3: "seat_dside_r1", // driver side rear1
    4: "seat_pside_r1", // passanger side rear1
    5: "seat_dside_r2", // driver side rear2
    6: "seat_pside_r2", // passanger side rear2
    7: "seat_dside_r3", // driver side rear3
    8: "seat_pside_r3", // passanger side rear3
    9: "seat_dside_r4", // driver side rear4
    10: "seat_pside_r4", // passanger side rear4
    11: "seat_dside_r5", // driver side rear5
    12: "seat_pside_r5", // passanger side rear5
    13: "seat_dside_r6", // driver side rear6
    14: "seat_pside_r6", // passanger side rear6
    15: "seat_dside_r7", // driver side rear7
    16: "seat_pside_r7", // passanger side rear7
}
mp.game.controls.useDefaultVehicleEntering = false;
mp.keys.bind(0x47, false, () => {
    if (mp.players.local.vehicle === null) {
        if (mp.gui.cursor.visible) return;
        let pos = mp.players.local.position;
        let targetVeh = {
            veh: null,
            dist: 900
        }
        // get closest veh + police cars
        mp.vehicles.forEachInStreamRange((veh) => {
            let vp = veh.position;
            let dist = mp.game.system.vdist2(pos.x, pos.y, pos.z, vp.x, vp.y, vp.z);
            if (dist < targetVeh.dist) {
                targetVeh.dist = dist;
                targetVeh.veh = veh;
            }
        });
        let veh = targetVeh.veh;
        if (veh !== null) {
            if (veh.isAnySeatEmpty()) {
                let toEnter = {
                    seat: 0,
                    dist: 99999,
                    pos: new mp.Vector3(0, 0, 0)
                }
                let insideSeatsFree = false;
                let ground;
                let seats_count = mp.game.vehicle.getVehicleSeats(veh);
                for (var i = 0; i <= seats_count; i++) {
                    if (veh.isSeatFree(i)) {
                        if (i <= 2) {
                            insideSeatsFree = true;
                        }
                        let seat = seats[i];
                        let seat_pos = veh.getWorldPositionOfBone(veh.getBoneIndexByName(seat))
                        let ground_pos = mp.game.gameplay.getGroundZFor3dCoord(seat_pos.x, seat_pos.y, seat_pos.z, 0, false);
                        let seat_dist = mp.game.system.vdist2(pos.x, pos.y, pos.z, seat_pos.x, seat_pos.y, seat_pos.z);
                        if ((i > 2) && (insideSeatsFree == true)) {} else {
                            if (veh.model == 1917016601 && i > 0) {
                                if ((toEnter.dist > 30)) {
                                    toEnter.dist = 30;
                                    toEnter.seat = i;
                                }
                            }
                            if ((seat_dist < toEnter.dist)) {
                                toEnter.dist = seat_dist;
                                toEnter.seat = i;
                            }
                        }
                    }
                }
                if ((veh.model == 1475773103) && (toEnter.seat > 0)) { // if rumpo3
                    mp.players.local.taskEnterVehicle(veh.handle, 5000, toEnter.seat, 2.0, 16, 0);
                } else {
                    mp.players.local.taskEnterVehicle(veh.handle, 5000, toEnter.seat, 2.0, 1, 0);
                }
            }
        }
    }
});