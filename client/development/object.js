//object.js
var ObjectManager = new class {
	constructor() {
		this.objects = [];
		this.lastCreation = Date.now();
	}
	register(object) {
		this.objects.push(object);
	}
	destroy(object) {
		this.objects.splice(this.objects.indexOf(object),1);
		delete object;

	}
}
class Object {
	constructor(model, position, rotation, customData) {
		this.obj = undefined;
		this.model = model;
		this.position = mp.vector(position);
		this.rotation = mp.vector(rotation);
		this.customData = customData;
		ObjectManager.register(this);
	}
	create() {
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
	}
	get handle() {
		return this.obj.handle || 0;
	}
	delete() {
		if (typeof this.obj != "object") return;
		this.obj.markForDeletion();
		this.obj.destroy();
		ObjectManager.destroy(this);
	}
}