var Items = require("./items.js");
var loot_tiers = [];
/*
 *  Tiers : Residential,Industrial,Farm,Military,Other,Food,...
 */
loot_tiers["Residential"] = {
    "Residential": 70,
    "Industrial": 5,
    "Farm": 3.5,
    "Military": 1.5,
    "Other": 5,
    "Food": 15
};
var Loottable = class {
    constructor() {
        this._setup();
    }
    _setup() {}
    getItemCountForSpawn(tier) {
        let self = this;
        /*TODO: Make something better */

        return Math.floor(Math.random() * (6 - 0));
    }
    getRarityThreshold(tier) {
        let self = this;
        let threshold = loot_tiers[tier];
        if (threshold == undefined) threshold = {
            "Residential": 70,
            "Industrial": 5,
            "Farm": 3.5,
            "Military": 1.5,
            "Other": 5,
            "Food": 15
        };
        let random_int = Math.floor(Math.random() * (100 - 0));
        tier = Object.keys(threshold).reduce(function(k, v) {
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
        return tier;
    }
    getRandomItem(items) {
        let self = this;
        return items[Math.floor(Math.random() * items.length)]
    }
    getItemsForSpawn(tier, count) {
        let self = this;
        let items_for_spawn = [];
        for (var i = 0; i < count; i++) {
            let r_tier = self.getRarityThreshold(tier);
            let usable_items = Items.filter(function(item) {
                return item.tier == r_tier;
            })
            let random_item = self.getRandomItem(usable_items);
            if (random_item != undefined) {
                items_for_spawn.push(random_item);
            }
        }
        return items_for_spawn;
    }
}
module.exports = new Loottable();