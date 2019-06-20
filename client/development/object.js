//object.js
var ObjectManager = new class {
	constructor() {
		let self = this;
		this.objects = [];
		this.streamed = [];
		this.lastCreation = Date.now();
	}
	register(object) {
		this.objects.push(object);
	}
	destroy(object) {
		this.objects.splice(this.objects.indexOf(object), 1);
		delete this.objects[this.objects.indexOf(object)];
	}
}
class ObjectStreamer {
	constructor(model, position, rotation, customData) {
		let self = this;
		this.obj = undefined;
		this.model = model;
		this.position = mp.vector(position);
		this.rotation = mp.vector(rotation);
		this.customData = customData;
		this.created = false;
		ObjectManager.register(this);
		setImmediate(function() {
			self.create();
		})
	}
	get id() {
		return this.obj != undefined ? this.obj.id : -1;
	}
	create() {
		let self = this;
		if (this.created == false) {
			try {
				mp.game.streaming.requestModel(mp.game.joaat(this.model));
				if (mp.game.streaming.hasModelLoaded(mp.game.joaat(this.model))) {
					this.obj = mp.objects.new(mp.game.joaat(this.model), this.position, {
						rotation: this.rotation,
						alpha: 255,
						dimension: 0
					});
					if (this.customData.type == "pickup") {
						let offset = this.customData.offset;
						this.obj.placeOnGroundProperly();
						let rotobj = this.obj.getRotation(0);
						let posobj = this.obj.getCoords(false);
						this.obj.setCollision(false, true);
						this.obj.freezePosition(true);
						if ((offset.rot.x > 0) || (offset.rot.y > 0)) {
							this.obj.setCoords(posobj.x + offset.pos.x, posobj.y + offset.pos.y, (posobj.z - this.obj.getHeightAboveGround()) + offset.pos.z, false, false, false, false);
						} else {
							this.obj.setCoords(posobj.x + offset.pos.x, posobj.y + offset.pos.y, posobj.z + offset.pos.z, false, false, false, false);
						}
						this.obj.setRotation(rotobj.x + offset.rot.x, rotobj.y + offset.rot.y, rotobj.z, 0, true);
					}
					this.created = true;
				} else {
					setTimeout(function() {
						self.create()
					}, 1000)
				}
			} catch (err) {
				console.log(err);
			}
		}
		return this.created;
	}
	get handle() {
		return (this.created == 1) ? this.obj.handle : -1;
	}
	delete() {
		if (typeof this.obj != "object") return;
		this.obj.markForDeletion();
		this.obj.destroy();
		console.log("delted obj")
		ObjectManager.destroy(this);
	}
}
module.exports = ObjectStreamer;