var Items = require("./items.js");
var loot_tiers = [];
/*
 *  Tiers : Residential,Industrial,Farm,Military,Other,Food,...
 */
loot_tiers["Residential"] = {
    "Residential": 80,
    "Industrial": 5,
    "Farm": 3.5,
    "Military": 1.5,
    "Other": 5,
    "Food": 5
};
var Loottable = class {
    constructor() {
        this._setup();
    }
    _setup() {}
    getItemCountForSpawn(tier) {
        let self = this;
        /*TODO: Make something better */
        return Math.random() > 0.5 ? 2 : 6;
    }
    getRarityThreshold(tier) {
        let self = this;
        let threshold = loot_tiers[tier];
        let random_int = getRandomInt(0, 100);
        let tier = Object.keys(threshold).reduce(function(k, v) {
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
    getItemsForSpawn(tier, count) {
        let items_for_spawn = [];
        for (var i = 0; i < count; i++) {
            let r_tier = self.getRarityThreshold(tier);
            let usable_items = Items.filter(function(item) {
                return item.tier == r_tier;
            })
            let random_item = usable_items[Math.floor(Math.random() * usable_items.length)];
            console.log("random item", random_item)
            items_for_spawn.push(random_item);
        }
        return items_for_spawn;
    }
}
module.exports = new Loottable();