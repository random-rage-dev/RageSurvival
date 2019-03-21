var MongoDB = require("../libs/mongodb.js")
var Buildings = MongoDB.getBuildingModel();
/*Building Class*/
mp.events.addCommand("build", (player, model = "No name") => {
    console.log("model", mp.joaat(model));
    player.notify(`Building:Start: ~w~${model}`);
    player.call("Building:Start", [model])
});
mp.events.add("Building:Place", function(player, data) {
    console.log("Building:Place", data);
    data = JSON.parse(data);
    mp.objects.new(data.model, mp.vector(data.pos), {
        rotation: mp.vector(data.rot),
        alpha: 255,
        dimension: 0
    });
});