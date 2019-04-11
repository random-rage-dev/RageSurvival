var MongoDB = require("../libs/mongodb.js")
var VehicleModel = MongoDB.getVehicleModel();
var Vehicle = class {
    constructor(data) {
        let self = this;
        this._data = data;
        this._id = data.id;
        this._model = data.model;
        this._position = data.position;
        this._rotation = data.rotation;
        this._storage_id = data.storage_id;
        this._key = data.key;
        this.components = data.components;
        this._veh = null;
        this._timer = setInterval(function() {
            self.save();
        },5*60*1000); // Save Interval 5 Min
        this.create();
        console.log("new Vehicle instance")
    }
    save() {
        /*TODO SAVE*/
        console.log("save veh",this._id);
    }
    create() {
        this._veh = mp.vehicles.new(this._model, mp.vector(this._position),
        {
            heading: mp.vector(this._rotation),
            numberPlate: "Plate",
            alpha: 255,
            color: [150,150,150],
            locked: false,
            engine: true,
            dimension: 0
        });
        this._veh.setVariable("components", this.components);
        this._veh.setVariable("key", this._key);
    }
}

mp.events.add("Vehicles:createVehicle", function(vehicle) {
    console.log("vehicle",vehicle);
});


/*Valid Vehicles
** dominator4, rebel, Emperor2, sanchez2, bmx
*/
/* Vehicle Manager */
var VehicleManager = new class {
    constructor() {
        this._allVehicles = [];
        this.loadVehicles();
    }
    async loadVehicles() {
        let self = this;
        console.log("-- Load Vehicles")
        let Vehicles = await VehicleModel.find({});
        Vehicles.forEach(function(dbVehicle) {
            console.log("Vehicle",dbVehicle);
            self._allVehicles[dbVehicle.veh_id] = new Vehicle(dbVehicle);
        })
    }
    async addVehicle(x,y,z,rz,model) {
        let self = this;
        console.log("Add Vehicle")
        let VehicleCount = await VehicleModel.find({});
        console.log("VehicleCount",VehicleCount.length);
        let id = Math.floor(Date.now()/1000 + (Math.random() * 1000));
        let dbVehicle = new VehicleModel({
            veh_id: id,
            model:model,
            position:{x:x,y:y,z:z},
            rotation: {x:0,y:0,z:rz},
            storage_id:id,
            key:id,
            components:{
                engine:Math.random() >= 0.5,
                wheel_fl:Math.random() >= 0.5,
                wheel_fr:Math.random() >= 0.5,
                wheel_rl:Math.random() >= 0.5,
                wheel_rr:Math.random() >= 0.5,
                fuel:100,
                spark_plugs:Math.random() >= 0.5,
                battery:Math.random() >= 0.5
            }
        });
        dbVehicle.save(function(err) {
            if (err) return console.log(err);
            // saved!
            mp.events.call("Vehicles:createVehicle", dbVehicle);
            self._allVehicles[id] = new Vehicle(dbVehicle);
        });
    }
    removeVehicle(id) {
        
    }
}
mp.events.addCommand("cveh", (player, fulltext, name) => {
    console.log("Spawn vehicle",name);
    let pos = mp.players.local.position;
    VehicleManager.addVehicle(pos.x,pos.y + 5,pos.z,90,name)
});
VehicleManager.addVehicle(0,0,0,90,"rebel")
module.exports = VehicleManager