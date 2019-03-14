var tick_rate = 1;
var Zombie = class {
    constructor(id, data) {
        this._setup(id, data);
    }
    _setup(id, data) {
        let self = this;
        self._id = id;
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
        self._oldPackage = {
            target: self._target,
            move: self._currentMove,
            health: self._health,
            syncer: self._syncer,
            pos: self._pos,
            nextpos: self._tagetPos
        };
        self._updater = setInterval(function() {
            self._update();
        }, 1000 / tick_rate);
    }
    dead() {
        clearInterval(this._updater);
        ZombieManager.removeZombie(this, true)
    }
    _update() {
        let self = this;
    }
}
var ZombieManager = new class {
    constructor() {
        this._allZombies = [];
    }
    newZombie(id, data, skin) {
        let zombie = new Zombie(id, data, skin);
        this._allZombies.push(zombie);
        console.log("Added Zombie")
        return zombie;
    }
    removeZombie(zombie, fromSelf) {
        let index = this._allZombies.indexOf(zombie);
        if (fromSelf == true) {
            if (index > -1) {
                this._allZombies[index] = null;
                this._allZombies.splice(index, 1);
                delete this._allZombies[index];
                console.log("Removed Zombie")
            }
        } else {
            this._allZombies[index].dead();
        }
    }
    getZombieById(id) {
        let zIndex = this._allZombies.findIndex(function(zombie) {
            return zombie._id == id;
        });
        if (zIndex > -1) {
            return {
                zombie: this._allZombies[zIndex],
                index: zIndex
            };
        } else {
            return false;
        }
    }
}
mp.events.add("Zombies:sync", (id, zombieData, skin) => {
	console.log("Zombies:sync")
});
mp.events.add("Zombies:remove", (id) => {
	console.log("Zombies:remove")
    let zombie = ZombieManager.getZombieById(id);
    ZombieManager.removeZombie(zombie, false)
});