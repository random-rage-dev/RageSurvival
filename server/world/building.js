var MongoDB = require("../libs/mongodb.js")
var Storage = require("./storage.js")
var Buildings = MongoDB.getBuildingModel();
/*Building Class*/
var Building = class {
	constructor(data) {
		try {
			this._data = data;
			this._id = data._id;
			this.health = data.health;
			this.model = data.model;
			this.pos = {
				x: data.x,
				y: data.y,
				z: data.z
			}
			this.rot = {
				x: data.rot_x,
				y: data.rot_y,
				z: data.rot_z
			}
			this.placed = data.placed || Date.now();
			this.last_repair = data.last_repair || Date.now();
			this.dataStorage = data.data || {};
			this.owner_id = data.owner_id;
			this._obj = undefined;
			this.create();
		} catch (err) {
			console.log("err", err);
		}
	}
	get object() {
		return this._obj;
	}
	create() {
		this._obj = mp.objects.new(mp.joaat(this.model), mp.vector(this.pos), {
			rotation: mp.vector(this.rot),
			alpha: 255,
			dimension: 0
		});
		this._obj.setVariable("id", this._id);
		if (this.dataStorage != undefined) {
			if (this.dataStorage.container != undefined) {
				this.container();
			}
		}
	}
	container() {
		this._obj.setVariable("container", true);
		this._obj.setVariable("opened", false);
	}
}
var BuildingManager = new class {
	constructor() {
		this._allObjects = [];
		this.loadObjects();
	}
	getObject(id) {
		return this._allObjects[id] || undefined;
	}
	async addTempObject(model, pos, rot, data = {}) {
		let u_id = "TEMP_" + (Date.now() + pos.x + pos.y + pos.z).toString();
		let prep = {
			_id: u_id,
			health: 1000,
			model: model,
			x: pos.x,
			y: pos.y,
			z: pos.z,
			rot_x: rot.x,
			rot_y: rot.y,
			rot_z: rot.z,
			data: data,
			owner_id: -1
		}
		self._allObjects[u_id] = new Building(prep);
		return u_id;
	}
	async loadObjects() {
		let self = this;
		console.log("-- Load Objects")
		let dbObjects = await Buildings.find({});
		dbObjects.forEach(function(dbObject) {
			self._allObjects[dbObject._id] = new Building(dbObject);
		})
	}
	async addObject(player = {
		class: {
			id: 0
		}
	}, pos, rot, model, data = {}) {
		let self = this;
		try {
			console.log("addObject")
			if (model == "v_res_smallplasticbox") {
				data = {
					"container": {
						cells: 6,
						rows: 6
					}
				}
			}
			let dbObject = await new Buildings({
				health: 1000,
				model: model,
				x: pos.x,
				y: pos.y,
				z: pos.z,
				rot_x: rot.x,
				rot_y: rot.y,
				rot_z: rot.z,
				data: data,
				owner_id: player.class.id
			}).save();
			self._allObjects[dbObject._id] = new Building(dbObject);
			console.log("Saving..:", dbObject);
		} catch (err) {
			console.log("err", err);
		}
	}
	async interact(player, id) {
		let obj = this.getObject(id);
		console.log("obj", obj);
		if (obj != undefined) {
			let packages = {
				id: obj._id,
				data: obj.dataStorage
			}
			console.log("packages", packages);
			if (obj.dataStorage.container != undefined) {
				if (Storage.canInteract(player, packages)) {
					console.log("canInteract");
					Storage.Interact(player, packages, obj.object);
					obj.object.setVariable("opened", true);
				}
			}
		}
	}
	removeObject(id) {}
}
module.exports = BuildingManager
mp.events.addCommand("build", (player, model = "v_res_smallplasticbox") => {
	console.log("model", mp.joaat(model));
	player.notify(`Building:Start: ~w~${model}`);
	player.call("Building:Start", [model])
});
mp.events.add("Building:Place", function(player, data) {
	console.log("Building:Place", data);
	data = JSON.parse(data);
	BuildingManager.addObject(player, data.pos, data.rot, data.model)
});
mp.events.add("Building:Canceled", function(player, data) {
	console.log("GIVE BACK ITEM TO PLAYER");
});
mp.events.add("Building:Interact", function(player, id) {
	console.log("Building:Interact");
	BuildingManager.interact(player, id)
});