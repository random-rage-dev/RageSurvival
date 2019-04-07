var CEFNotification = require("./browser.js").notification;

var streamedPools = [];
class LootPool {
    constructor(data) {
        this._setup(data);
    }
    _setup(data) {
        let self = this;
        self._lootData = data;
        self._pickupObjects = [];
        self.load()
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
        self.load();
    }
    load() {
        let self = this;
        let center = new mp.Vector3(self._lootData.pos.x, self._lootData.pos.y, self._lootData.pos.z);
        let Angle_Item = 360 / 8;
        self._lootData.items.forEach(function(item, index) {
            if (item != null) {
                item.index = index;
                let offset_pos = center.findRot(0, 0.5, Angle_Item * index);
                let base_rot = (Angle_Item * index) + (offset_pos.rotPoint(center) + Math.floor(Math.random() * (360 - 0)));
                if (base_rot > 360) base_rot -= 360;
                if (item.rot == undefined) {
                    item.rot = base_rot
                }
                let pos = offset_pos;
                pos.z += 1;
                let obj = mp.objects.new(mp.game.joaat(item.model), pos, {
                    rotation: new mp.Vector3(0, 0, item.rot),
                    alpha: 255,
                    dimension: 0
                });
                obj.placeOnGroundProperly();
                let rotobj = obj.getRotation(0);
                let posobj = obj.getCoords(false);
                obj.setCollision(false, true);
                obj.freezePosition(true);
                obj.setPhysicsParams(9000000, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1);
                if ((item.offset.rot.x > 0) || (item.offset.rot.y > 0)) {
                    obj.setCoords(posobj.x + item.offset.pos.x, posobj.y + item.offset.pos.y, (posobj.z - obj.getHeightAboveGround()) + item.offset.pos.z, false, false, false, false);
                } else {
                    obj.setCoords(posobj.x + item.offset.pos.x, posobj.y + item.offset.pos.y, posobj.z + item.offset.pos.z, false, false, false, false);
                }
                obj.setRotation(rotobj.x + item.offset.rot.x, rotobj.y + item.offset.rot.y, rotobj.z, 0, true);
                self._pickupObjects.push({
                    id: self._lootData.id,
                    obj: obj
                })
            }
        })
    }
    unload(id) {
        let self = this;
        self._pickupObjects.forEach(function(item, i) {
            if (item.id == id) {
                item.obj.markForDeletion();
                item.obj.destroy();
                delete self._pickupObjects[i];
            }
        })
    }
}
mp.events.add("Loot:Load", (id, poolData) => {
    if (!streamedPools[id]) {
        streamedPools[id] = new LootPool(poolData);
    }
});
mp.events.add("Loot:Unload", (id) => {
    if (streamedPools[id]) {
        streamedPools[id].unload(id)
        delete streamedPools[id];
    }
});
mp.events.add("Loot:Reload", (id, new_data) => {
    if (streamedPools[id]) {
        streamedPools[id].reload(new_data);
    }
});

function pointingAt() {
    let distance = 10;
    direction = mp.gameplayCam.getDirection();
    coords = mp.gameplayCam.getCoord();
    const farAway = new mp.Vector3((direction.x * distance) + (coords.x), (direction.y * distance) + (coords.y), (direction.z * distance) + (coords.z));
    const result = mp.raycasting.testPointToPoint(coords, farAway, mp.players.local, -1);
    if (result === undefined) {
        return undefined;
    }
    return result;
}

let timer_anim;
mp.events.add("render", () => {
    /*Display Items*/
    let cur_selected = false;
    let cur_dist = 999;
    let pool_data = null;
    Object.keys(streamedPools).forEach(function(key) {
        let pool = streamedPools[key]
        if (pool.isInRange() == true) {
            let pos = pool.position;
            pos.z += 1;
            let Angle_Item = 360 / 8;
            let pointAt = pointingAt();
            pool.getLootPool().forEach(function(item, index) {
                if (item != null) {
                    let offset_pos = pos.findRot(0, 0.5, Angle_Item * index).ground();
                    if ((pointAt) && (pointAt.position)) {
                        let dist = (offset_pos.dist(pointAt.position));
                        if ((dist <= ((mp.players.local.isRunning() == true) ? item.thickness * 2 : item.thickness)) && (cur_selected == false) && (dist < cur_dist)) {
                            cur_selected = item;
                            cur_dist = dist;
                            pool_data = key;
                        }
                    }
                }
            })
        }
    });
    if ((cur_selected) && (pool_data)) {
        mp.game.controls.disableControlAction(0, 51, true);
        mp.game.ui.showHudComponentThisFrame(14);
        mp.game.graphics.drawText("[E] " + ((cur_selected.amount != 1) ? cur_selected.amount + "x " : "") + cur_selected.name, [0.5, 0.55], {
            font: 4,
            color: [255, 255, 255, 200],
            scale: [0.3, 0.3],
            outline: true,
            centre: true
        });
        if (mp.game.controls.isDisabledControlJustPressed(0, 51)) { // 51 == "E"
            //Loot:Pickup
            if (pool_data) {
                let name = cur_selected.name;
                let amount = cur_selected.amount;
                if (amount > 0) {
                    mp.events.callRemote("Loot:Pickup", pool_data, cur_selected.index, cur_selected.name, cur_selected.amount);
                    CEFNotification.call("notify", {
                        title: "Notification",
                        titleSize: "16px",
                        message: `${cur_selected.name} just got picked up`,
                        messageColor: 'rgba(50,50,50,.8)',
                        position: "bottomCenter",
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
                }
            }
        }
    }
});