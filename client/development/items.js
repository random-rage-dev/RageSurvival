"use strict";
var natives = require("./natives.js")
var CEFNotification = require("./browser.js").notification;
var StorageSystem = require("./storage.js");
var Notifications = require("./notifications.js");
var StreamedObject = require("./object.js");
var streamedPools = [];
class LootPool {
    constructor(data) {
        this._setup(data);
    }
    _setup(data) {
        let self = this;
        self._lootData = data;
        self._pickupObjects = [];
        self.loaded = false;
        //let dist = mp.localPlayer.getPos().dist2d(new mp.Vector3(this._lootData.pos.x, this._lootData.pos.y, this._lootData.pos.z));
        //setTimeout(function() {
        self.check();
        // }, 50*dist );
    }
    get position() {
        return new mp.Vector3(this._lootData.pos.x, this._lootData.pos.y, this._lootData.pos.z);
    }
    get id() {
        return this._lootData.id;
    }
    getLootPool() {
        return this._lootData.items;
    }
    isInRange() {
        let self = this;
        return new mp.Vector3(self._lootData.pos.x, self._lootData.pos.y, self._lootData.pos.z).dist(mp.players.local.position) < ((mp.players.local.isRunning() == true) ? 7 : 5);
    }
    reload(data) {
        let self = this;
        self.unload(self.id)
        let rot_data = [];
        self._lootData.items.forEach(function(item, index) {
            if (item != null) {
                if (rot_data[item.index] == undefined) {
                    rot_data[item.index] = item.rot;
                }
            }
        });
        self._lootData = data;
        self._lootData.items = self._lootData.items.map(function(item, index, theArray) {
            let sArr = item;
            if (sArr != null) {
                sArr.rot = rot_data[index] || undefined
            }
            return sArr;
        });
        self.loaded = false;
        self.check();
    }
    check() {
        let self = this;
        try {
            let center = new mp.Vector3(self._lootData.pos.x, self._lootData.pos.y, self._lootData.pos.z);
            let Angle_Item = 360 / 8;
            if ((self.loaded == false) && ((!mp.raycasting.testPointToPoint(mp.vector(mp.localPlayer.position).add(0, 0, 100), center, mp.players.local, (1))) || (!mp.raycasting.testPointToPoint(mp.vector(mp.localPlayer.position), center, mp.players.local, (1))))) {
                self.loaded = true;
                self._lootData.items.forEach(function(item, index) {
                    if (item != null) {
                        item.index = index;
                        if (mp.game.streaming.isModelInCdimage(mp.game.joaat(item.model))) {
                            let offset_pos = center.findRot(0, 0.5, Angle_Item * index);
                            let base_rot = (Angle_Item * index) + (offset_pos.rotPoint(center) + Math.floor(Math.random() * (360 - 0)));
                            if (base_rot > 360) base_rot -= 360;
                            if (item.rot == undefined) {
                                item.rot = base_rot
                            }
                            let pos = offset_pos;
                            pos.z += 1;
                            let obj = new StreamedObject(item.model, pos, new mp.Vector3(0, 0, item.rot), {
                                type: "pickup",
                                offset: item.offset
                            })
                            self._pickupObjects.push({
                                id: self._lootData.id,
                                obj: obj
                            })
                        }
                    }
                })
            }
        } catch (err) {
            console.log("err", err);
        }
    }
    unload(id) {
        let self = this;
        self._pickupObjects.forEach(function(item, i) {
            //if (item.id == id) {
            if (mp.objects.atHandle(item.obj.handle)) {
                console.log("exists");
                item.obj.delete();
                delete self._pickupObjects[i];
                console.log("removed");
            }
            //}
        })
    }
}
mp.events.add("Loot:Load", (id, poolData) => {
    if (!streamedPools[id]) {
        streamedPools[id] = new LootPool(poolData);
    }
});
mp.events.add("playerExitColshape", (colshape) => {
    if (colshape.getVariable("item_colshape")) {
        let id = colshape.getVariable("item_colshape_id");
        if (streamedPools[id]) {
            streamedPools[id].unload(id)
            delete streamedPools[id];
        }
    }
});
mp.events.add("Loot:Unload", (id) => {
    if (streamedPools[id]) {
        streamedPools[id].unload()
        delete streamedPools[id];
    }
});
mp.events.add("Loot:Reload", (id, new_data) => {
    if (streamedPools[id]) {
        streamedPools[id].reload(new_data);
    }
});

function pointingAt() {
    let ray_dist = 25;
    let direction = mp.gameplayCam.getDirection();
    let coords = mp.gameplayCam.getCoord();
    let farAway = new mp.Vector3((direction.x * ray_dist) + (coords.x), (direction.y * ray_dist) + (coords.y), (direction.z * ray_dist) + (coords.z));
    let result = mp.raycasting.testPointToPoint(coords, farAway, mp.players.local, -1);
    if (result === undefined) {
        return undefined;
    }
    return result;
}
let cStatus = "";
let cItem = 0;
let timer_anim;
let isOpening = 0;
mp.events.add("render", () => {
    /*Display Items*/
    let cur_selected = false;
    let cur_dist = 999;
    let pool_data = null;
    let pointAt = pointingAt();
    let Angle_Item = 360 / 8;
    Object.keys(streamedPools).forEach(function(key) {
        let pool = streamedPools[key]
        if (pool.isInRange() == true) {
            let pos = pool.position;
            pos.z += 1;
            pool.getLootPool().forEach(function(item, index) {
                if (item != null) {
                    let offset_pos = pos.findRot(0, 0.5, Angle_Item * index).ground();
                    let thickness = item.thickness //(mp.players.local.isRunning() == true) ? item.thickness * 2 : item.thickness;
                    mp.game.graphics.drawMarker(28, offset_pos.x, offset_pos.y, offset_pos.z, 0, 0, 0, 0, 0, 0, thickness, thickness, thickness, 255, 255, 255, 150, false, false, 2, false, "", "", false);
                    let player_pos = mp.vector(mp.localPlayer.position).ground();
                    let near_dist = thickness * 2.5;
                    let pointAtPos;
                    if ((pointAt) && (pointAt.position)) {
                        if (player_pos.dist2d(pointAt.position) < 2) {
                            pointAtPos = pointAt.position;
                        }
                    }
                    let dist;
                    if (((pointAtPos != undefined) && (offset_pos.dist(pointAtPos) <= thickness)) || (offset_pos.dist(player_pos) <= near_dist)) {
                        dist = ((pointAtPos != undefined) && (offset_pos.dist(pointAtPos) <= thickness)) ? offset_pos.dist(pointAtPos) : offset_pos.dist(player_pos);
                    }
                    if ((dist) && (cur_selected == false) && (dist < cur_dist)) {
                        item.position = offset_pos;
                        cur_selected = item;
                        cur_dist = dist //((pointAtPos != undefined) && (offset_pos.dist(pointAtPos) <= thickness)) ? offset_pos.dist(pointAtPos) : offset_pos.dist(player_pos);
                        pool_data = key;
                    }
                }
            })
        }
    });
    if ((cur_selected) && (pool_data)) {
        mp.game.controls.disableControlAction(0, 51, true);
        mp.game.ui.showHudComponentThisFrame(14);
        mp.game.graphics.drawText("[E] " + cur_selected.name, [0.5, 0.55], {
            font: 4,
            color: [255, 255, 255, 200],
            scale: [0.3, 0.3],
            outline: true,
            centre: true
        });
        if ((cItem == cur_selected) && (cStatus != "")) {
            mp.game.graphics.drawText("\n[" + cStatus + "]", [0.5, 0.55], {
                font: 4,
                color: [255, 150, 150, 200],
                scale: [0.3, 0.3],
                outline: true,
                centre: true
            });
        } else {
            cStatus = "";
            cItem = cur_selected
        }
        if (mp.game.controls.isDisabledControlJustPressed(0, 51)) { // 51 == "E"
            //Loot:Pickup
            if (pool_data) {
                let name = cur_selected.name;
                let amount = cur_selected.amount;
                if (amount > 0) {
                    let doesFit = StorageSystem.checkFit("inventory", cur_selected.width, cur_selected.height)
                    doesFit.then(function(fit) {
                        if ((fit != undefined) && (cur_selected.index)) {
                            console.log("Loot:Pickup", pool_data, cur_selected);
                            mp.events.callRemote("Loot:Pickup", pool_data, cur_selected.index, cur_selected.name, cur_selected.amount);
                            /*3d Notify*/
                            let pos = cur_selected.position;
                            Notifications.notify3D(pos.x, pos.y, pos.z, pos.x, pos.y, pos.z + 0.5, `+ ${cur_selected.name}`, [255, 255, 255]);
                            CEFNotification.call("notify", {
                                title: "Notification",
                                titleSize: "16px",
                                message: `${cur_selected.name} just got picked up`,
                                messageColor: 'rgba(50,50,50,.8)',
                                position: "topCenter",
                                backgroundColor: 'rgba(206, 206, 206, 0.9)',
                                close: false
                            })
                            if (timer_anim) {
                                clearTimeout(timer_anim);
                                mp.players.local.stopAnimTask("mp_take_money_mg", "stand_cash_in_bag_loop", 1.0);
                            }
                            mp.players.local.taskPlayAnim("mp_take_money_mg", "stand_cash_in_bag_loop", 16, 8.0, -1, 49, 0, false, false, false);
                             timer_anim = setTimeout(function() {
                                mp.players.local.stopAnimTask("mp_take_money_mg", "stand_cash_in_bag_loop", 1.0);
                            }, 250);
                        } else {
                            cStatus = "Not enough Space";
                        }
                    })
                }
            }
        }
    } else {
        cStatus = "";
        if ((pointAt) && (pointAt.entity)) {
            if (typeof pointAt.entity == "object") {
                if (mp.vector(mp.localPlayer.position).dist(pointAt.entity.getCoords(true)) < 3) {
                    if (pointAt.entity.getVariable("container") == true) {
                        if (pointAt.entity.getVariable("opened") == false) {
                            mp.game.ui.showHudComponentThisFrame(14);
                            mp.game.graphics.drawText("[E] Open", [0.5, 0.55], {
                                font: 4,
                                color: [255, 255, 255, 200],
                                scale: [0.3, 0.3],
                                outline: true,
                                centre: true
                            });
                            if (mp.game.controls.isDisabledControlJustPressed(0, 51)) { // 51 == "E"
                                let id = pointAt.entity.getVariable("id");
                                mp.events.callRemote("Building:Interact", id);
                            }
                        }
                    } else if (pointAt.entity.getVariable("interactable") == true) {
                        let openDur = pointAt.entity.getVariable("openDuration") || 2000;
                        mp.game.ui.showHudComponentThisFrame(14);
                        mp.game.graphics.drawText("[E] Open", [0.5, 0.55], {
                            font: 4,
                            color: [255, 255, 255, 200],
                            scale: [0.3, 0.3],
                            outline: true,
                            centre: true
                        });
                        if (mp.game.controls.isDisabledControlJustPressed(0, 51) && (isOpening == 0)) { // 51 == "E"
                            isOpening = Date.now();
                        }
                        if (isOpening != 0) {
                            if (mp.game.controls.isDisabledControlPressed(0, 51)) { // 51 == "E"
                                mp.game.graphics.drawRect(0.5, 0.525, 0.025, 0.0025, 0, 0, 0, 155);
                                let t = (Date.now() - isOpening);
                                t = (t < openDur) ? t : openDur;
                                let w = mp.lerp(0, 0.025, 1 / openDur * t);
                                mp.game.graphics.drawRect((0.5 - (0.025 / 2) + w / 2), 0.525, w, 0.0025, 255, 255, 255, 155);
                                if (t == openDur) {
                                    let e = pointAt.entity.getVariable("interact_event");
                                    isOpening = 0;
                                    if (e != "") {
                                        let id = pointAt.entity.getVariable("id");
                                        mp.events.callRemote(e, id);
                                    }
                                }
                            } else {
                                isOpening = 0;
                            }
                            //
                        }
                    }
                }
            } else {
                isOpening = 0;
            }
        }
    }
});