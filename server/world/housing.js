var House = class {
	constructor(house_id,x,y,z) {
		 this._houseid = house_id;
		 this.pos = new mp.Vector3(x,y,z);
		 this.dimension = this._houseid;
		 this._locked = false;
		 this._lockHealth = 0.0;
		 this._maxLockhealth = 1000;

		
	}
}