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
            Craftbar
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
    "Craftbar": 0,
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
    "Craftbar": 0,
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
    "Craftbar": 0,
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
    "Craftbar": 0,
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
    "Craftbar": 0,
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
    "Craftbar": 0,
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
    "Craftbar": 0,
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
    "Craftbar": 0,
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
    "Craftbar": 0,
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
    "Craftbar": 0,
    "Land": 0
};
loot_tiers["Craftbar"] = {
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
    "Craftbar": 0,
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
    "Craftbar": 0,
    "Land": 0
};

function uniqueNumber() {
    var date = Date.now();
    if (date <= uniqueNumber.previous) {
        date = ++uniqueNumber.previous;
    } else {
        uniqueNumber.previous = date;
    }
    return date;
}
uniqueNumber.previous = 0;
var Loottable = class {
    constructor() {
        this._setup();
    }
    _setup() {
        this._idPool = [];
    }
    getID() {
        return uniqueNumber();
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
                }
            }
            return k;
        }, 0)
        return type;
    }
    getRandomItem(items) {
        let self = this;
        let random_int = Math.floor(Math.random() * (100 - 0));
        let item = items[Math.floor(Math.random() * items.length)];
        return item;
    }
    getItemsForSpawn(type, count) {
        let self = this;
        let items_for_spawn = [];
        for (var i = 0; i < count; i++) {
            let r_type = self.getRarityThreshold(type);
            let usable_items = Items.filter(function(item) {
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