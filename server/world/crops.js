var MongoDB = require("../libs/mongodb.js")
var Crops = MongoDB.getCropModel();
const cropObjects = [];
cropObjects["potato"] = {
    max_yield: 4,
    timeToGrow: 4 * 60 * 60 * 1000
};
cropObjects["onion"] = {
    max_yield: 4,
    timeToGrow: 4 * 60 * 60 * 1000
};
cropObjects["carrot"] = {
    max_yield: 4,
    timeToGrow: 4 * 60 * 60 * 1000
};
cropObjects["salat"] = {
    max_yield: 4,
    timeToGrow: 4 * 60 * 60 * 1000
};
cropObjects["cucumber"] = {
    max_yield: 4,
    timeToGrow: 4 * 60 * 60 * 1000
};
var Crop = class {
    constructor(data) {
        if (!new.target) new Error('class must be called with new');
        let self = this;
        console.log("new crop class");
        console.log(data);
        self._id = data._id;
        self._data = data;
        self._type = data.cropType;
        self._planted = data.planted;
        self._streamRadius = 150;
        self._pos = new mp.Vector3(data.position.x, data.position.y, data.position.z);
        self._colshape = mp.colshapes.newSphere(self._pos.x, self._pos.y, self._pos.z, self._streamRadius, 0);
        self._blip = mp.blips.new(1, self._pos, {
            name: self._type,
            color: 3,
            shortRange: true,
            scale: 0.2
        });
        self._colshape.setVariable("crop_colshape", true);
        self._colshape.setVariable("crop_colshape_id", self._id);
    }
    get yield() {
        if (cropObjects[this._type]) {
            return {
                max: cropObjects[this._type].max_yield,
                ttg: cropObjects[this._type].timeToGrow
            };
        } else {
            return false;
        }
    }
    streamIn(player) {
        console.log("streamIn")
        player.call("Crops:Load", [this._id, {
            _id: this._id,
            type: this._type,
            planted: this._planted,
            watered: this._watered,
            yield: this.yield,
            position: this._pos
        }])
    }
    streamOut(player) {
        console.log("streamOut")
    }
    harvest() {

    }
}
mp.events.add("Crop:Interact", function(player, crop_ID) {
    console.log("crop_ID", crop_ID)
});
/* CropManager */
var CropManager = new class {
    constructor() {
        let self = this;
        this._allCrops = [];
        this.loadCrops();
        mp.events.add("playerEnterColshape", function(player, colshape) {
            if (colshape.getVariable("crop_colshape")) {
                self.cropStreamIn(player, colshape);
            }
        });
        mp.events.add("playerExitColshape", function(player, colshape) {
            if (colshape.getVariable("crop_colshape")) {
                self.cropStreamOut(player, colshape);
            }
        });
    }
    cropStreamOut(player, colshape) {
        let crop_id = colshape.getVariable("crop_colshape_id");
        if (this._allCrops[crop_id]) {
            this._allCrops[crop_id].streamOut(player);
        }
    }
    cropStreamIn(player, colshape) {
        let crop_id = colshape.getVariable("crop_colshape_id");
        if (this._allCrops[crop_id]) {
            this._allCrops[crop_id].streamIn(player);
        }
    }
    getCrop(id) {
        return this._allCrops[id];
    }
    async loadCrops() {
        let self = this;
        console.log("-- Load Crops")
        let dbCrops = await Crops.find({});
        dbCrops.forEach(function(dbCrop) {
            self._allCrops[dbCrop._id] = new Crop(dbCrop);
        })
    }
    async addCrop(player, x, y, z, type) {
        let self = this;
        console.log("addCrop")
        let id = Math.floor(Date.now() / 1000 + (Math.random() * 1000));
        let dbCrop = new Crops({
            cropType: type,
            position: {
                x: x,
                y: y,
                z: z
            },
            planter: player.class.id
        });
        dbCrop.save(function(err) {
            if (err) return console.log(err);
            // saved!
            console.log("trigger", "Crops:addCrop")
            mp.events.call("Crops:addCrop", dbCrop);
            self._allCrops[dbCrop._id] = new Crop(dbCrop);
        });
    }
}
mp.events.addCommand("ccrop", (player, fulltext, type) => {
    if (cropObjects[type]) {
        console.log("Spawn Crop", type);
        let pos = mp.players.local.position;
        CropManager.addCrop(player, pos.x, pos.y, pos.z, type)
    }
});
module.exports = CropManager