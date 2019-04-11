mp.events.add("render", () => {
    let pPos = mp.localPlayer.position;
    mp.vehicles.forEachInStreamRange(function(veh, id) {
        let dist = mp.vector(veh.position).dist(pPos);
        if (dist < 5) {
            mp.game.graphics.drawText("veh\n" + JSON.stringify(veh.getVariable("components")), [veh.position.x, veh.position.y, veh.position.z], {
                font: 4,
                color: [255, 255, 255, 185],
                scale: [0.3, 0.3],
                outline: true,
                centre: true
            });
        }
        let components = veh.getVariable("components")
        /* Front Left*/
        //veh.setTyreBurst(0, true, 100);
        //veh.setTyreBurst(1, true, 100);
    });
});