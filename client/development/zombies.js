var tick_rate = 1;
var Zombie = class {
    constructor(x, y, z) {
        this._setup(x, y, z);
    }
    _setup(x, y, z) {
        let self = this;
        self._id = "Zombie_" + Date.now() + x + "_" + y + "_" + z
        self._skin = "u_m_y_zombie_01";
        self._pos = mp.vector({
            x: x,
            y: y,
            z: z
        })
        self._tagetPos = mp.vector({
            x: x,
            y: y,
            z: z
        })
        self._target = null;
        self._currentMove = "walk"; /*Valid Types: "walk", "run", "attack","chase"*/
        self._health = 100;
        self._range = 50;
        self._leader = "";
        self._dead = false;
        self._syncer = undefined;
        self._needsUpdate = false;
        self._updater = setInterval(function() {
            self._update();
        }, 1000 / tick_rate);
    }

}
var ZombieManager = new class {
    constructor() {
        this._allZombies = [];
    }
    newZombie(x, y, z) {
        let zombie = new Zombie(x, y, z);
        this._allZombies.push(zombie);
        console.log("Added Zombie")
        return zombie;
    }
    removeZombie(zombie) {
        let index = this._allZombies.indexOf(zombie);
        if (index > -1) {
            this._allZombies[index] = null;
            this._allZombies.splice(index, 1);
            delete this._allZombies[index];
            console.log("Removed Zombie")
        }
    }
}