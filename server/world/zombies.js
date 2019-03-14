var tick_rate = 1;

const moveEnums = {
    1:"walk",
    2:"run",
    3:"attack",
    4:"chase"
}

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
        self._currentMove = 1; /*Valid Types: see moveEnums*/
        self._health = 100;
        self._range = 50;
        self._leader = "";
        self._dead = false;
        self._syncer = {
            player: undefined,
            lastHeartbeat: 0
        };
        self._firstTimeSync = [];
        self._syncedOnce = [];
        self._updatePackage = [];
        self._oldData = {}
        self._updatedPlayers = [];
        self._needsUpdate = false;
        self._updater = setInterval(function() {
            self._update();
        }, 1000 / tick_rate);
    }
    dead() {
        clearInterval(this._updater);
        ZombieManager.removeZombie(this)
    }
    get hasUpdatedForPlayer(player) {
        return this._updatedPlayers[player];
    }
    set target(player) {
        this._target = player;
    }
    changeMove(move) {
        this._currentMove = move;
    }
    setNextPos(pos) {
        this._tagetPos = mp.vector(pos);
    }
    setPos(pos) {
        this._pos = mp.vector(pos);
    }
    takeDamage(damage) {
        this._health -= damage;
        if (this._health < 0) {
            this._dead = true;
            this._health = 0;
        }
    }
    _update() {
        let self = this;
        let best_syncer = self.getBestSyncer();
        if (self._syncer.player != best_syncer) {
            self._syncer.player = best_syncer;
        }
        let new_data = {
            target: self._target,
            move: self._currentMove,
            health: self._health,
            syncer: self._syncer.player,
            pos: self._pos,
            nextpos: self._tagetPos
        }
        if (new_data != self._oldData) {
            self._updatedPlayers = [];
            self._updatePackage = [];
            self._updatePackage.push({
                type: "setTarget",
                data: new_data.target
            });
            self._updatePackage.push({
                type: "setMove",
                data: new_data.move
            });
            self._updatePackage.push({
                type: "setHealth",
                data: new_data.health
            });
            self._updatePackage.push({
                type: "setPos",
                data: new_data.pos
            });
            self._updatePackage.push({
                type: "setNextPos",
                data: new_data.nextpos
            });
            self._updatePackage.push({
                type: "setSyncer",
                data: self._syncer.player
            });
        }
    }
    getBestSyncer() {
        let self = this;
        let option = {
            player: undefined,
            dist: self._range,
            ping: 999
        }
        mp.players.forEachInRange(self._pos, self._range, function(player) {
            let dist = self._pos.dist(player.position);
            let ping = player.ping;
            if ((dist < option.dist) && (ping < option.ping)) {
                option = {
                    player: player,
                    dist: dist,
                    ping: ping
                }
            }
        });
        return option.player;
    }
    syncRange() {
        let self = this;
        let o_fts = self._firstTimeSync;
        self._firstTimeSync = [];
        mp.players.forEachInRange(self._pos, self._range, function(rPlayer) {
            self._syncedOnce[rPlayer] = true;
            if (!self._updatedPlayers[rPlayer]) {
                if (o_fts[rPlayer]) {
                    self._firstTimeSync[rPlayer] = true;
                }
                if (!self._firstTimeSync[rPlayer]) {
                    self._firstTimeSync[rPlayer] = true;
                    rPlayer.call("Zombies:sync", [self._id, self._updatePackage, self._skin]);
                } else {
                    rPlayer.call("Zombies:sync", [self._id, self._updatePackage]);
                }
                self._updatedPlayers[rPlayer] = true;
            }
        });
    }
}
/* Zombie Manager */
var ZombieManager = new class {
    constructor() {
        this._allZombies = [];
        this._removedZombies = [];
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
            let id = this._allZombies[index]._id;
            let synced_players = this._allZombies[index]._syncedOnce;

            this._allZombies[index] = null;
            this._allZombies.splice(index, 1);
            delete this._allZombies[index];
            console.log("Removed Zombie")
            this._removedZombies.push({
                id: id,
                players: synced_players
            });
        }
    }
    syncZombies() {
        this._allZombies.forEach(function(zombie) {
            zombie.syncRange();
        })
        this._removedZombies.forEach(function(data) {
            data.players.forEach(function(player) {
                if ((player) && (player.name)) {
                    player.call("Zombies:remove",[data.id])
                }
            })
        })
    }
}
/*Syncer*/
setInterval(function() {
    //console.log("sync");
    ZombieManager.syncZombies();
}, 1000 / tick_rate) ZombieManager.newZombie(417.1167907714844, 6480.19091796875, 28.80876350402832) module.exports = Zombie;