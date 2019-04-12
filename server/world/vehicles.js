var MongoDB = require("../libs/mongodb.js")
var Vehicles = MongoDB.getVehicleModel();
var Vehicle = class {
    constructor(data) {
        let self = this;
        this._data = data;
        this._id = data.veh_id;
        this._model = data.model;
        this._position = data.position;
        this._rotation = data.rotation;
        this._storage_id = data.storage_id;
        this._health = data.health;
        this._running = data.running;
        this._key = data.key;
        this.components = data.components;
        this._veh = null;
        this._timer = setInterval(function() {
            self.save();
        }, 5 * 60 * 1000); // Save Interval 5 Min
        this.create();
        console.log("new Vehicle instance")
    }
    log(...args) {
        console.log("Vehicle:Log", args)
    }
    error(...args) {
        console.error("Vehicle:Error", args)
    }
    hasKey(player) {
        return true // TODO BUILD KEY SYSTEM
    }
    save() {
        let self = this;
        /*TODO SAVE*/
        this._position = this._veh.position;
        this._rotation = this._veh.rotation;
        console.log("save veh", this._id);
        Vehicles.updateOne({
            veh_id: this._id
        }, {
            position: this._position,
            rotation: this._rotation,
            health: this._health,
            running: this._running,
            components: this.components,
        }, function(err, numberAffected, rawResponse) {
            if (err) {
                self.error("Vehicle:Save Fail", err)
            }
        });
    }
    getFuelUsage(distance) {
        return (distance/1000) * 12;
    }
    get fuel() {
        return this.components.fuel;
    }
    set fuel(val) {
        this.components.fuel = val;

        this._veh.setVariable("components", this.components);
        if (this.components.fuel <= 0) {
            this._veh.setVariable("running", false);
        }
    }
    get running() {
        return this._running;
    }
    set running(state) {
        this._running = state;
        this._veh.setVariable("running", this._running);
    }
    create() {
        this._veh = mp.vehicles.new(this._model, mp.vector(this._position), {
            heading: mp.vector(this._rotation),
            numberPlate: "I3Ass",
            alpha: 255,
            color: [150, 150, 150],
            locked: false,
            engine: true,
            dimension: 0
        });
        this._veh.setVariable("id", this._id);
        this._veh.setVariable("running", this._running);
        this._veh.setVariable("components", this.components);
        this._veh.setVariable("key", this._key);
        this._veh.setVariable("health", this._health);
    }
}
mp.events.add("Vehicles:createVehicle", function(vehicle) {
    console.log("vehicle", vehicle);
});
mp.events.add("Vehicles:UpdateFuel", function(player, dist) {
    if (player.vehicle) {
        let id = player.vehicle.getVariable("id");
        if (VehicleManager.getVehicle(id) != false) {
            let veh = VehicleManager.getVehicle(id);
            let usage = veh.getFuelUsage(dist);
            let oFuel = veh.fuel;
            veh.fuel = (oFuel - usage);
        }
    }
});
mp.events.add("Vehicles:ToggleEngine", function(player) {
    if (player.vehicle) {
        let id = player.vehicle.getVariable("id");
        console.log("ID", id);
        console.log("ID", VehicleManager.getVehicle(id));
        if (VehicleManager.getVehicle(id) != false) {
            console.log("isVeh");
            let veh = VehicleManager.getVehicle(id);
            if (veh.hasKey(player) == true) {
                console.log("hasKey");
                if (veh.running == true) {
                    veh.running = false;
                } else {
                    veh.running = true;
                }
            }
        }
    }
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
    getVehicle(id) {
        return this._allVehicles[id];
    }
    async loadVehicles() {
        let self = this;
        console.log("-- Load Vehicles")
        let dbVehicles = await Vehicles.find({});
        dbVehicles.forEach(function(dbVehicle) {
            console.log("Vehicle", dbVehicle);
            self._allVehicles[dbVehicle.veh_id] = new Vehicle(dbVehicle);
        })
    }
    async addVehicle(x, y, z, rz, model) {
        let self = this;
        console.log("Add Vehicle")
        let VehicleCount = await Vehicles.find({});
        console.log("VehicleCount", VehicleCount.length);
        let id = Math.floor(Date.now() / 1000 + (Math.random() * 1000));
        let dbVehicle = new Vehicles({
            veh_id: id,
            model: model,
            running: true,
            position: {
                x: x,
                y: y,
                z: z
            },
            rotation: {
                x: 0,
                y: 0,
                z: rz
            },
            storage_id: id,
            key: id,
            health: 1000,
            /*TODO CHANGE TO VARIABLE HEALTH BASED ON VEH*/
            components: {
                engine: Math.random() >= 0.5,
                wheel_fl: Math.random() >= 0.5,
                wheel_fr: Math.random() >= 0.5,
                wheel_rl: Math.random() >= 0.5,
                wheel_rr: Math.random() >= 0.5,
                fuel: 100,
                spark_plugs: Math.random() >= 0.5,
                battery: Math.random() >= 0.5
            }
        });
        dbVehicle.save(function(err) {
            if (err) return console.log(err);
            // saved!
            mp.events.call("Vehicles:createVehicle", dbVehicle);
            self._allVehicles[id] = new Vehicle(dbVehicle);
        });
    }
    removeVehicle(id) {}
}
mp.events.addCommand("cveh", (player, fulltext, name) => {
    console.log("Spawn vehicle", name);
    let pos = mp.players.local.position;
    VehicleManager.addVehicle(pos.x, pos.y + 5, pos.z, 90, name)
});
//VehicleManager.addVehicle(0,0,0,90,"rebel")
module.exports = VehicleManager