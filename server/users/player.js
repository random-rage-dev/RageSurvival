var MongoDB = require("../libs/mongodb.js")
var User = MongoDB.getUserModel();
var Inventory = MongoDB.getInventoryModel();
var md5 = require("md5");
var async = require("async");

var Player = class {

    constructor(player) {  
        this._setup(player);
    }
    _setup(player) {
        var self = this;
        self._player = player;
        self._loggedIn = false;
        self._spawnedTimestamp = 0;
        self._inventory = [];
        self._username = "";
        self._playtime = 0;
        self._warns = 0;
        self._userId = 0;
        self._skin = 'mp_m_freemode_01';
        self._death = 0;
        self._health = 100;
        self._armor = 100;
        self._storage = {};
    }
    log(...args) {
        console.log("Account:Log", args)
    }
    error(...args) {
        console.error("Account:Error", args)
    }
    set storage(data) {
        this._storage = data;
    }
    get storage() {
        return this._storage;
    }
    get id() {
        return this._userId
    }
    get loggedIn() {
        return this._loggedIn;
    }
    get player() {
        return this._player;
    }
    save() {
        let self = this;
        return new Promise(function(fulfill, reject) {
            if ((self._loggedIn == true) && (self._player)) {
                User.updateOne({
                    user_id: self._userId
                }, {
                    warns: self._warns // Change stuff later
                }, function(err, numberAffected, rawResponse) {
                    if (!err) {
                        self.log("Succesfully saved data", self._username)
                        if (self._player) {
                            self._player.call("Notifications:New", [{
                                title: "Save",
                                titleSize: "16px",
                                message: "Succesfully saved your Account Data",
                                messageColor: 'rgba(0,0,0,.8)',
                                position: "bottomRight",
                                close: false
                            }])
                        }
                        return fulfill("Succesfully saved data", self._username);
                    } else {
                        self.error("Account:Save Fail", err)
                        return reject("Failed saving player data");
                    }
                });
            } else {
                return fulfill("No need to save, not logged in")
            }
        })
    }
    isDead() {
        return this._death;
    }
    killed(victim, weapon, teamkill) {
        let self = this;
        self._player.call("Notifications:New", [{
            title: "Kill",
            titleSize: "16px",
            message: "You killed " + victim.name + " ( EXP: " + addExp + " )",
            messageColor: 'rgba(0,0,0,.8)',
            position: "bottomCenter",
            close: false
        }])
    }
    death(killer, weapon, reason) {
        let self = this;
        setTimeout(function() {
                    self.spawn();
                }, 1000);
    }
    spawn() {
        var self = this;
        self._player.spawn(new mp.Vector3(1964.2689208984375, 3739.28271484375, 32.33523178100586));
        self._player.model = mp.joaat(self._skin);
        self._player.heading = 90;
        self._health = 100;
        self._armor = 25;
        self._player.health = 100 + self._health;
        self._player.armour = self._armor;
        self._damage = [];
        self._death = 0;
        self._player.setVariable("spawned", true)
        self._player.setVariable("invincible", true)
        self._player.alpha = 255;
        self._player.call("Cam:Hide")
        self._player.call("Player:Spawn");
        self._spawnedTimestamp = Date.now();
    }
    hit(hitter, weapon, bone) {
        var self = this;
        if (self._loggedIn == true) {
            if ((Date.now() - self._spawnedTimestamp) / 1000 > 15) {
                if ((self._health > 0) && (self.isDead() == 0)) {
                    let mul = 1;
                    //if (bone != undefined) {
                    //    mul = Damage.getBoneMul(bone);
                    //}
                    let damage = 0// Math.floor(Damage.getWeaponDamage(weapon) * (mul || 1));
                    
                    hitter.player.call("Combat:HitEntity")
                } else {
                    if ((self.isDead() == 0)) {
                        self.death(hitter, weapon);
                    }
                }
            }
        }
    }
    fireWeapon(id, ammo) {
        var self = this;
        if (id != 0) {
            // self.exp(15);
            let wIndex = self._weapons.findIndex(weapon => {
                return weapon.id == id;
            });
            if (wIndex == -1) {
                //self.error(Number(id), "Weapon Cheat", self._player.name)
                //self._player.removeWeapon(Number(id));
            }
        }
    }
    /* Inventory */
    loadInventory() {
        let self = this;
        Inventory.find({
            owner_type: "player",
            owner_id:self._userId
        }, async function(err, arr) {
            if (arr.length) {
                let cInventory = arr;
                self._inventory = [];
                mp.events.call("Player:Inventory", self._player,self._inventory)
                self.spawn();
            } else {
                self.error("Account:Inventory", "Failed loading player inventory")
            }
        }).lean()
    }
    hasItem(name,amount) {

    }
    giveItem(name,amount) {

    }
    removeItem(name,amount) {
        
    }
    /* Inventory */
    load(username) {
        var self = this;
        self._username = username;
        self._player.call("Account:HideLogin")
        self._loggedIn = true;
        User.find({
            name: self._username
        }, async function(err, arr) {
            if (arr.length) {
                let cUser = arr[0];
                self._playtime = cUser.playtime;
                self._warns = cUser.warns;
                self._userId = cUser.user_id;
                //self.spawn();
                self._player.setVariable("user_id", self._userId)
                self._player.setVariable("loggedIn", true);
                self._player.setVariable("spawned", false)
                self._player.call("Account:LoginDone")
                //self._player.call("Cam:Hide")
                self.log("loaded player data for", self._player.name)
                console.log(self._player)
                mp.events.call("Player:Loaded", self._player)
                self.loadInventory();
                self.spawn();
            } else {
                self.error("Account:Load", "Failed loading player data")
            }
        }).lean()
    }
    register(name, password_hash, salt) {
        var self = this;
        User.find({
            name: name
        }, async function(err, arr) {
            if (err) return console.log("error", err);
            if ((arr) && (arr.length)) {
                self._player.call("Account:Alert", ["Username already exsits"])
            } else {
                let hwid = self._player.serial
                let social_club = self._player.socialClub;
                let hash = password_hash;
                let UserCount = await User.find({});
                User.create({
                    user_id: UserCount.length,
                    name: name,
                    hwid: hwid,
                    social_clib: social_club,
                    password: password_hash,
                    salt: salt,
                }, function(err, rV) {
                    if (err) {
                        self._player.call("Account:Alert", ["Username already exsits"])
                        return console.log(err)
                    };
                    console.log("account created")
                    self.load(name);
                    // saved!
                });
            }
        });
    }
    login(username, password) {
        var self = this;
        self.log("Login request")
        User.find({
            name: username
        }, async function(err, arr) {
            if (arr.length) {
                let lUser = arr[0];
                let hash = md5(password + "|" + lUser.salt);
                if (hash == lUser.password) {
                    self.load(username)
                } else {
                    self.error("Account:Alert", "Password Wrong")
                    self._player.call("Account:Alert", ["Password Wrong"])
                }
            } else {
                console.log("Account:Alert", "Account does not exists")
                self._player.call("Account:Alert", ["Account does not exists"])
            }
        });
    }
}
module.exports = Player;