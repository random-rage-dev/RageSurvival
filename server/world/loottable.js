var Items = require("./items.js");
var Loottable = class {
    constructor() {
        this._setup();
    }
    _setup() {
        var self = this;
    }
    getItemCountForSpawn(tier) {
        let self = this;
        /*TODO: Make something better */
        return Math.random() > 0.5 ? 1 : 2;
    }
    getItemsForSpawn(tier, count) {
    	let items_for_spawn = [];
        let items_for_tier = Items.filter(function(item) {
            return item.tier == tier;
        })
        for (var i = 0; i < count; i++) {
        	let random_item = items_for_tier[Math.floor(Math.random() * items_for_tier.length)];
        	console.log("random item",random_item)
        	items_for_spawn.push(random_item);
        }
        return items_for_spawn;
       
    }
}
module.exports = new Loottable();