require("./vector.js")
console.log = function(...a) {
    mp.gui.chat.push("DEBUG:" + a.join(" "))
};
var streamedPools = [];
class LootPool {
    constructor(data) {
        this._setup(data);
    }
    _setup(data) {
        let self = this;
        console.log("LootPool", JSON.stringify(data));
        self._lootData = data;
        self._pickupObjects = [];
        self.initLootObjects()
        mp.events.add("render", () => {
            self.render()
        });
    }
    initLootObjects() {
        let self = this;
        console.log("loot objects init");
        let center = new mp.Vector3(self._lootData.pos.x, self._lootData.pos.y, self._lootData.pos.z);
        let Angle_Item = 360 / self._lootData.items.length;
        self._lootData.items.forEach(function(item, index) {
            let offset_pos = center.findRot(0, 0.5, Angle_Item * index);
            let base_rot = Angle_Item * index;
            var left_pos = offset_pos.findRot(0, 0.1, base_rot + 180).ground();
            var right_pos = offset_pos.findRot(0, 0.1, base_rot + 0).ground();
            var front_pos = offset_pos.findRot(0, 0.1, base_rot + 270).ground();
            var back_pos = offset_pos.findRot(0, 0.1, base_rot + 90).ground();
            let rot_x = front_pos.rotPoint(back_pos);
            let rot_y = left_pos.rotPoint(right_pos);
            let pos = offset_pos.ground();
            let obj = mp.objects.new(mp.game.joaat(item.model), pos, {
                rotation: new mp.Vector3(0, 0, Angle_Item * index),
                alpha: 255,
                dimension: 0
            });
            obj.placeOnGroundProperly();
            let rotobj = obj.getRotation(0);
            let posobj = obj.getCoords(false);
            obj.setCoords(posobj.x + item.offset.pos.x, posobj.y + item.offset.pos.y, (posobj.z - obj.getHeightAboveGround()) + item.offset.pos.z, false, false, false, false);
            obj.setRotation(rotobj.x + item.offset.rot.x, rotobj.y + item.offset.rot.y, rotobj.z, 0, true);

            self._pickupObjects.push({
            	id:self._lootData.id,
            	obj:obj
            })
        })
    }
    render() {
        let self = this;
        mp.game.graphics.drawText("Loot Pool", [self._lootData.pos.x, self._lootData.pos.y, self._lootData.pos.z], {
            font: 2,
            color: [255, 255, 255, 185],
            scale: [0.4, 0.4],
            outline: true
        });
    }
    unload(id) {
        let self = this;
        console.log("DO UNLOADING");
        self._pickupObjects.forEach(function(item,i) {
        	if (item.id == id) {
        		item.obj.destroy();
        		self._pickupObjects.splice(i,1);
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
        //delete streamedPools[id];
    }
});