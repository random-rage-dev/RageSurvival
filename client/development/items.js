require("./vector.js")
var streamedPools = [];
class LootPool {
    constructor(data) {
        this._setup(data);
    }
    _setup(data) {
        let self = this;
        self._lootData = data;
        self._pickupObjects = [];
        self.initLootObjects()
    }
    set data(new_data) {
        this._lootData = new_data;
    }
    get position() {
        return new mp.Vector3(this._lootData.pos.x, this._lootData.pos.y, this._lootData.pos.z);
    }
    getLootPool() {
        return this._lootData.items;
    }
    isInRange() {
        let self = this;
        return new mp.Vector3(self._lootData.pos.x, self._lootData.pos.y, self._lootData.pos.z).dist(mp.players.local.position) < 2;
    }
    initLootObjects() {
        let self = this;
        console.log("loot objects init");
        let center = new mp.Vector3(self._lootData.pos.x, self._lootData.pos.y, self._lootData.pos.z);
        let Angle_Item = 360 / self._lootData.items.length;
        self._lootData.items.forEach(function(item, index) {
            let offset_pos = center.findRot(0, 0.5, Angle_Item * index);
            let base_rot = (Angle_Item * index) + Math.floor(Math.random() * (360 - 0));
            if (base_rot > 360) base_rot -= 360;
            var left_pos = offset_pos.findRot(0, 0.1, base_rot + 180).ground();
            var right_pos = offset_pos.findRot(0, 0.1, base_rot + 0).ground();
            var front_pos = offset_pos.findRot(0, 0.1, base_rot + 270).ground();
            var back_pos = offset_pos.findRot(0, 0.1, base_rot + 90).ground();
            let rot_x = front_pos.rotPoint(back_pos);
            let rot_y = left_pos.rotPoint(right_pos);
            let pos = offset_pos;
            pos.z += 1;
            let obj = mp.objects.new(mp.game.joaat(item.model), pos, {
                rotation: new mp.Vector3(0, 0, base_rot),
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
        })
    }
    render() {
        let self = this;
    }
    unload(id) {
        let self = this;
        console.log("DO UNLOADING");
        self._pickupObjects.forEach(function(item, i) {
            if (item.id == id) {
                console.log("remove");
                item.obj.markForDeletion();
                item.obj.destroy();
                delete self._pickupObjects[i];
            }
        })
    }
}
mp.events.add("Loot:Load", (id, poolData) => {
    if (!streamedPools[id]) {
        console.log("Creating LootPool", id);
        streamedPools[id] = new LootPool(poolData);
    }
});
mp.events.add("Loot:Unload", (id) => {
    if (streamedPools[id]) {
        console.log("Unload LootPool", id);
        streamedPools[id].unload(id)
        delete streamedPools[id];
    }
});
mp.events.add("Loot:Reload", (id, new_data) => {
    if (streamedPools[id]) {
        console.log("Reload LootPool", id);
        streamedPools[id].data = new_data
    }
});
var gameplayCam = mp.cameras.new('gameplay');

function pointingAt() {
    let distance = 5;
    direction = gameplayCam.getDirection();
    coords = gameplayCam.getCoord();
    const farAway = new mp.Vector3((direction.x * distance) + (coords.x), (direction.y * distance) + (coords.y), (direction.z * distance) + (coords.z));
    const result = mp.raycasting.testPointToPoint(coords, farAway, mp.players.local, -1);
    if (result === undefined) {
        return undefined;
    }
    return result;
}
mp.events.add("render", () => {
    /*Display Items*/
    Object.keys(streamedPools).forEach(function(key) {
        let pool = streamedPools[key]
        //if (pool.isInRange() == true) {
        let pos = pool.position;
        pos.z += 1;
        let Angle_Item = 360 / pool.getLootPool().length;
        let pointAt = pointingAt();
        pool.getLootPool().forEach(function(item, index) {
            let offset_pos = pos.findRot(0, 0.5, Angle_Item * index).ground();
            if ((pointAt) && (pointAt.position)) {
                if (offset_pos.dist(pointAt.position) <= item.thickness) {
                    mp.game.ui.showHudComponentThisFrame(14);
                    mp.game.graphics.drawText("[E] " + ((item.amount != 1) ? item.amount + "x " : "") + item.name, [0.5, 0.55], {
                        font: 4,
                        color: [255, 255, 255, 200],
                        scale: [0.3, 0.3],
                        outline: true,
                        centre: true
                    });
                }
            }
            //mp.game.ui.instructionalButtons.InitButtons(offset_pos.x,offset_pos.y,offset_pos.z + 0.3);
            //mp.game.ui.instructionalButtons.AddButton(item.name,"t_E");
            //mp.game.ui.instructionalButtons.finalizeButtons(1,0,0,0,50);
        })
        // }
    });
});