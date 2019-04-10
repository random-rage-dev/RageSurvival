var MongoDB = require("../libs/mongodb.js")
var VehicleModel = MongoDB.getVehicleModel();
var Vehicle = class {
    constructor(data) {
        let self = 
        this._id = data.id;
        this._model = data.model;
        this._position = data.position;
        this._rotation = data.rotation;
        this._storage_id = data.storage_id;
        this._key = data.key;
        this.components = data.components;

        this._timer = setInterval(function() {
            this.save();
        },5*60*1000).bind(this) // Save Interval 5 Min
    }
    save() {
        /*TODO SAVE*/
        console.log("save veh",this._id);
    }
}
/*Valid Vehicles
** dominator4, rebel, Emperor2, sanchez2, bmx


*/
/* Vehicle Manager */
var VehicleManager = new class {
    constructor() {
        this._allVehicles = [];
    }
    async addVehicle(x,y,z,rz,model) {
        let self = this;
        console.log("Add Vehicle")
        let VehicleCount = await VehicleModel.find({});
        console.log("VehicleCount",VehicleCount.length);
        let id = Date.now()/1000;
        let vehicle = new VehicleModel({
            veh_id: Date,
            model:model,
            position:{x:x,y:y,z:z},
            rotation: {x:0,y:0,z:rz},
            storage_id:0,
            key:0,
            components:{}
        });
        vehicle.save(function(err) {
            if (err) return console.log(err);
            // saved!
            mp.events.call("Vehicles:addVehicle", vehicle)
        });


    }
    removeVehicle(id) {

    }
}

//VehicleManager.addVehicle(0,0,0,90,"rebel")
module.exports = VehicleManager