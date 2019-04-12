
var natives = require("./natives.js")
var CEFInventory = require("./browser.js").inventory;

mp.events.add("Inventory:AddItem", (item) => {
    CEFInventory.call("addItem", item);
});