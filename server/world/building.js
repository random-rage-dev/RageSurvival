var MongoDB = require("../libs/mongodb.js")
var Buildings = MongoDB.getBuildingModel();
/*Building Class*/
var Building = class {
    constructor(data) {
		this._data = data;
        this._id = data._id;
        this.health = data.health;
        this.model = data.model;
        this.pos = {
        	x:data.x,
        	y:data.y,
        	z:data.z
        }
        this.rot = {
        	x:data.rot_x,
        	y:data.rot_y,
        	z:data.rot_z
        }
        this.placed = data.placed;
        this.last_repair = data.last_repair;
        this.dataStorage = data.data;
        this.owner = data.owner;
        this._obj = undefined;
        this.create();
    }
    create() {
		this._obj = mp.objects.new(mp.joaat(this.model), mp.vector(this.pos),
		{
		    rotation: mp.vector(this.rot),
		    alpha: 255,
		    dimension: 0
		});
		this._obj.setVariable("id",this._id);
    }
}


mp.events.addCommand("build", (player, model = "No name") => {
    console.log("model", mp.joaat(model));
    player.notify(`Building:Start: ~w~${model}`);
    player.call("Building:Start", [model])
});
mp.events.add("Building:Place", function(player, data) {
    console.log("Building:Place", data);
    data = JSON.parse(data);
    mp.objects.new(data.model, mp.vector(data.pos), {
        rotation: mp.vector(data.rot),
        alpha: 255,
        dimension: 0
    });
});