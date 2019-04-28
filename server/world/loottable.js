var Items = require("./items.js");
var Pickups = require("./pickups.js");
var loot_tiers = [];
/*
 *  Tiers : Industrial
            Residential
            Food
            Other
            Military
            Hospital
            Police
            Beach
            Farm
            Forest
            Craftable
            Land
 */
loot_tiers["Residential"] = {
    "Residential": 70,
    "Industrial": 10,
    "Other": 5,
    "Military": 0,
    "Food": 10,
    "Hospital": 2.5,
    "Police": 2.5,
    "Beach": 0,
    "Farm": 0,
    "Forest": 0,
    "Craftable": 0,
    "Land": 0
};
loot_tiers["Industrial"] = {
    "Residential": 10,
    "Industrial": 70,
    "Other": 5,
    "Military": 0,
    "Food": 5,
    "Hospital": 2.5,
    "Police": 7.5,
    "Beach": 0,
    "Farm": 0,
    "Forest": 0,
    "Craftable": 0,
    "Land": 0
};
loot_tiers["Food"] = {
    "Residential": 15,
    "Industrial": 5,
    "Other": 20,
    "Military": 0,
    "Food": 50,
    "Hospital": 2.5,
    "Police": 7.5,
    "Beach": 0,
    "Farm": 0,
    "Forest": 0,
    "Craftable": 0,
    "Land": 0
};
loot_tiers["Other"] = {
    "Residential": 5,
    "Industrial": 5,
    "Other": 55,
    "Military": 0,
    "Food": 30,
    "Hospital": 2.5,
    "Police": 2.5,
    "Beach": 0,
    "Farm": 0,
    "Forest": 0,
    "Craftable": 0,
    "Land": 0
};
loot_tiers["Military"] = {
    "Residential": 2.5,
    "Industrial": 3.5,
    "Other": 1.5,
    "Military": 55,
    "Food": 10,
    "Hospital": 2.5,
    "Police": 25,
    "Beach": 0,
    "Farm": 0,
    "Forest": 0,
    "Craftable": 0,
    "Land": 0
};
loot_tiers["Hospital"] = {
    "Residential": 2.5,
    "Industrial": 3.5,
    "Other": 1.5,
    "Military": 2.5,
    "Food": 15,
    "Hospital": 72.5,
    "Police": 2.5,
    "Beach": 0,
    "Farm": 0,
    "Forest": 0,
    "Craftable": 0,
    "Land": 0
};
loot_tiers["Police"] = {
    "Residential": 2.5,
    "Industrial": 3.5,
    "Other": 1.5,
    "Military": 2.5,
    "Food": 10,
    "Hospital": 7.5,
    "Police": 72.5,
    "Beach": 0,
    "Farm": 0,
    "Forest": 0,
    "Craftable": 0,
    "Land": 0
};
loot_tiers["Beach"] = {
    "Residential": 2.5,
    "Industrial": 3.5,
    "Other": 1.5,
    "Military": 2.5,
    "Food": 40,
    "Hospital": 7.5,
    "Police": 2.5,
    "Beach": 40,
    "Farm": 0,
    "Forest": 0,
    "Craftable": 0,
    "Land": 0
};
loot_tiers["Farm"] = {
    "Residential": 17.5,
    "Industrial": 3.5,
    "Other": 1.5,
    "Military": 2.5,
    "Food": 20,
    "Hospital": 7.5,
    "Police": 2.5,
    "Beach": 0,
    "Farm": 45,
    "Forest": 0,
    "Craftable": 0,
    "Land": 0
};
loot_tiers["Forest"] = {
    "Residential": 0,
    "Industrial": 0,
    "Other": 1.5,
    "Military": 0,
    "Food": 2.5,
    "Hospital": 0,
    "Police": 0,
    "Beach": 0,
    "Farm": 26,
    "Forest": 70,
    "Craftable": 0,
    "Land": 0
};
loot_tiers["Craftable"] = {
    "Residential": 0,
    "Industrial": 0,
    "Other": 0,
    "Military": 0,
    "Food": 0,
    "Hospital": 0,
    "Police": 0,
    "Beach": 0,
    "Farm": 0,
    "Forest": 0,
    "Craftable": 0,
    "Land": 0
};
loot_tiers["Land"] = {
    "Residential": 0,
    "Industrial": 0,
    "Other": 0,
    "Military": 0,
    "Food": 0,
    "Hospital": 0,
    "Police": 0,
    "Beach": 0,
    "Farm": 0,
    "Forest": 0,
    "Craftable": 0,
    "Land": 0
};
var loot_respawn = [];
/*
 *  Tiers : Industrial
            Residential
            Food
            Other
            Military
            Hospital
            Police
            Beach
            Farm
            Forest
            Craftable
            Land
 */
loot_respawn["Residential"] = 30 * 60 * 1000;
loot_respawn["Industrial"] = 60 * 60 * 1000;
loot_respawn["Food"] = 20 * 60 * 1000;
loot_respawn["Other"] = 40 * 60 * 1000;
loot_respawn["Hospital"] = 40 * 60 * 1000;
loot_respawn["Military"] = 120 * 60 * 1000;
loot_respawn["Police"] = 90 * 60 * 1000;
loot_respawn["Beach"] = 15 * 60 * 1000;
loot_respawn["Farm"] = 45 * 60 * 1000;
loot_respawn["Forest"] = 45 * 60 * 1000;
loot_respawn["Craftable"] = 45 * 60 * 1000;
loot_respawn["Land"] = 45 * 60 * 1000;
var Loottable = class {
    constructor() {
        this._setup();
    }
    _setup() {
        this._idPool = [];
    }
    getRespawnTimeForTier(tier) {
        if (loot_respawn[tier]) {
            return loot_respawn[tier];
        } else {
            return 1000 * 15;
        }
    }
    getItemData(name) {
        console.log("getItemData", name);
        return Items[name];
    }
    getItemCountForSpawn(tier) {
        let self = this;
        /*TODO: Make something better */
        return Math.floor(Math.random() * (8 - 1)) + 1;
    }
    getLootDensity(x, y, z) {
        let p = new mp.Vector3(x, y, z);
    }
    getRarityThreshold(type) {
        let self = this;
        let threshold = loot_tiers[type];
        if (threshold == undefined) threshold = loot_tiers["Industrial"];
        let random_int = Math.floor(Math.random() * (100 - 0));
        type = Object.keys(threshold).reduce(function(k, v) {
            if (typeof k == "number") {
                k += threshold[v];
                if (k >= random_int) {
                    return v;
                } else {
                    return k;
                    1
                }
            }
            return k;
        }, 0)
        return type;
    }
    getRandomItem(item_data) {
        let self = this;
        let item_name = item_data[Math.floor(Math.random() * item_data.length)];
        let item = Items[item_name];
        if (item != undefined) {
            item.name = item_name;
            if (typeof item.amount === "function") {
                item.amount = item.amount();
            } else if (typeof item.amount !== "number") {
                item.amount = 1;
            }
            item.data = {};
            if (item.modifiers != undefined) {
                Object.keys(item.modifiers).forEach(function(key) {
                    let val = item.modifiers[key]();
                    item.data [key]= val;
                })
            }
            /*
            item.data = {
                value: Math.random() * 100
            }*/
        }
        return item;
    }
    getItemsForSpawn(type, count) {
        let self = this;
        let items_for_spawn = [];
        for (var i = 0; i < count; i++) {
            let r_type = self.getRarityThreshold(type);
            let usable_items = Object.keys(Items).filter(function(name) {
                let item = Items[name];
                return item.type == r_type;
            }).shuffle();
            let random_item = self.getRandomItem(usable_items);
            if (random_item != undefined) {
                items_for_spawn.push(random_item);
            }
        }
        return items_for_spawn;
    }
}
module.exports = new Loottable();