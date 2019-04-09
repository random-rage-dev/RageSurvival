
var natives = require("./natives.js")
var CEFInterface = require("./browser.js").interface;

mp.events.add("Inventory:AddItem", (item) => {
    CEFInterface.call("addItem", item);
});