var tick_rate = 16;
var Zombie = class {
    constructor(id, data, skin) {
        this._setup(id, data, skin);
    }
    _setup(id, data, skin) {
        let self = this;
        self._id = id;
        self._skin = skin;
        self._pos = mp.vector({
            x: 0,
            y: 0,
            z: 0
        })
        self._targetPos = mp.vector({
            x: 0,
            y: 0,
            z: 0
        })
        self.updatePackage(data);
        self._ped = mp.peds.new(mp.game.joaat(self._skin), self._pos, 0, function(ped) {}, 0);
        self._ped.freezePosition(false);
        self._target = null;
        self._currentMove = "walk"; /*Valid Types: "walk", "run", "attack","chase"*/
        self._health = 100;
        self._range = 25;
        self._acceptedErrorPosition = 2;
        self._maxNoHeartbeat = 1 * 1000;
        self._leader = "";
        self._ready = false;
        self._dead = false;
        self._syncer = undefined;
        self._needsUpdate = false;
        self._lastHeartbeat = Date.now();
        self._newPackage = {};
        self._oldPackage = {
            target: self._target,
            move: self._currentMove,
            health: self._health,
            syncer: self._syncer,
            pos: self._pos,
            nextpos: self._tagetPos
        };
        self._nextPackage = [];
        self._updater = setInterval(function() {
            self._update();
        }, 1000 / tick_rate);
    }
    get id() {
        return this._id;
    }
    get position() {
        return this._pos;
    }
    get ready() {
        return this._ready;
    }
    get syncer() {
        return this._syncer;
    }
    get getHeartbeat() {
        return this._lastHeartbeat;
    }
    dead() {
    	if (this._ped) {
	        this._ped.destroy();
	        this._ped = null;
	    }
        clearInterval(this._updater);
        ZombieManager.removeZombie(this, true)
    }
    setHealth(health) {
        this._health = health;
    }
    setTarget(player) {
        this._target = player;
    }
    setMove(move) {
        this._currentMove = move;
    }
    setNextPos(pos) {
        this._targetPos = mp.vector(pos);
    }
    setPos(pos) {
        console.log("setPos");
        this._pos = mp.vector(pos);
        if (this._ped) {
            if (this._pos.dist(this._ped.getCoords(true)) > this._acceptedErrorPosition) {
                this._ped.position = this._pos;
                this._ped.setCoords(this._pos.x, this._pos.y, this._pos.z - 1, true, true, true, false);
            }
        }
        if (!this._ready) {
            this._ready = true;
        }
    }
    setSyncer(syncer) {
        console.log("setSyncer");
        this._syncer = syncer;
    }
    updatePackage(data) {
        let self = this;
        self._lastHeartbeat = Date.now();
        self._newPackage = data;
        data.forEach(function(task) {
            if (task.type == "setTarget") {
                self.setTarget(task.data);
            }
            if (task.type == "setMove") {
                self.setMove(task.data);
            }
            if (task.type == "setHealth") {
                self.setHealth(task.data);
            }
            if (task.type == "setPos") {
                self.setPos(task.data);
            }
            if (task.type == "setNextPos") {
                self.setNextPos(task.data);
            }
            if (task.type == "setSyncer") {
                self.setSyncer(task.data);
            }
        })
    }
    _update() {
        let self = this;
        if ((Date.now() - self._lastHeartbeat) > self._maxNoHeartbeat) {
            self.dead();
        }
        if (self._ped) {
            if (self.syncer == mp.players.local.name) {
                // IsSyncer
                let tasks = Object.keys(self._nextPackage);
                if (!tasks["setPos"]) {
                    if (self._pos.dist(self._ped.getCoords(true)) > 0.2) {
                        self._nextPackage["setPos"] = this._ped.getCoords(true)
                    }
                }
                /* if (!tasks["setNextPos"]){
                 	self._nextPackage["setNextPos"] = mp.vector({x:0,y:0,z:0})
                 }*/
                if (tasks.length > 0) {
                    let task_block = Object.keys(self._nextPackage).map(function(key) {
                        return {
                            type: key,
                            data: self._nextPackage[key]
                        }
                    })
                    mp.events.callRemote("Zombie:ReSync", self.id, JSON.stringify(task_block));
                }
            }
            self._ped.taskGoToCoordAnyMeans(self._targetPos.x, self._targetPos.y, self._targetPos.z, 1, 0, false, 786603, 0);
        }
    }
}
var ZombieManager = new class {
    constructor() {
        this._allZombies = [];
    }
    getAllZombies() {
        return this._allZombies;
    }
    newZombie(id, data, skin) {
        let zombie = new Zombie(id, data, skin);
        this._allZombies.push(zombie);
        console.log("Added Zombie")
        return zombie;
    }
    updateZombie(id, zombieData, skin) {
        let self = this;
        let zObject = self.getZombieById(id);
        if (zObject == -1) {
            self.newZombie(id, zombieData, skin);
        } else {
            zObject.zombie.updatePackage(zombieData)
        }
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
            return (zombie != undefined) && (zombie._id == id);
        });
        if (zIndex > -1) {
            return {
                zombie: this._allZombies[zIndex],
                index: zIndex
            };
        } else {
            return -1;
        }
    }
    render() {}
}
mp.events.add("render", () => {
    ZombieManager.getAllZombies().forEach(function(zombie) {
        if (zombie != undefined) {
            if (zombie.ready) {
                mp.game.graphics.drawText(zombie.id + "\nSyncer " + (zombie.syncer == mp.players.local.name), [zombie.position.x, zombie.position.y, zombie.position.z], {
                    font: 4,
                    color: [255, 255, 255, 185],
                    scale: [0.3, 0.3],
                    outline: true,
                    centre: true
                });
            }
        }
    })
});
mp.events.add("Zombies:Sync", (id, zombieData, skin) => {
    console.log("Zombies:Sync")
    ZombieManager.updateZombie(id, zombieData, skin);
});
mp.events.add("Zombies:Remove", (id) => {
    console.log("Zombies:Remove")
    let zombie = ZombieManager.getZombieById(id);
    ZombieManager.removeZombie(zombie, false)
});