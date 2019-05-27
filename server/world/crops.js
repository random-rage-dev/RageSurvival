var MongoDB = require("../libs/mongodb.js")
var Crops = MongoDB.getCropModel();
var Crop = class {
    constructor(data) {
        let self = this;
        console.log("new crop class");
        this._data = data;

    }
}
mp.events.add("Crop:Interact", function(player,crop_ID) {
    console.log("crop_ID",crop_ID)
});

/* CropManager */
var CropManager = new class {
    constructor() {
        this._allCrops = [];
        this.loadCrops();
    }
    getVehicle(id) {
        return this._allVehicles[id];
    }
    async loadCrops() {
        let self = this;
        console.log("-- Load Crops")
        let dbCrops = await Crops.find({});
        dbCrops.forEach(function(dbCrop) {
            self._allCrops[dbCrop._id] = new Crop(dbCrop);
        })
    }
}
module.exports = CropManager