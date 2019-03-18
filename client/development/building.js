let placeable_object;
mp.keys.bind(0x58, true, function() {
    if (placeable_object) placeable_object.destroy();
    placeable_object = mp.objects.new(mp.joaat, ("bkr_prop_meth_phosphorus"), mp.vector(mp.players.local.position).sub(0, 0, -1), {
        rotation: mp.vector({
            x: 0,
            y: 0,
            z: 0
        }),
        alpha: 255,
        dimension: 0
    });
});

mp.events.add("render", () => {
    if (placeable_object) {
        let max_dist = 20;
        let direction = mp.gameplayCam.getDirection();
        let coords = mp.gameplayCam.getCoord();
        let farAway = new mp.Vector3((direction.x * max_dist) + (coords.x), (direction.y * max_dist) + (coords.y), (direction.z * max_dist) + (coords.z));
        let result = mp.raycasting.testPointToPoint(coords, farAway, mp.players.local, -1);
        let targetPos = farAway;
        if (result !== undefined) {
            targetPos = result.position;
        }
        let rot = placeable_object.getRotation(0);
        mp.game.controls.disableControlAction(0, 22, true);
        let space_key = mp.game.controls.isDisabledControlPressed(0, 22);
        if (space_key) {
            mp.game.graphics.drawText("Ground", [targetPos.x, targetPos.y, targetPos.z - 0.25], {
                font: 4,
                color: [255, 255, 255, 185],
                scale: [0.3, 0.3],
                outline: true,
                centre: true
            });

            placeable_object.placeOnGroundProperly();
            rot = placeable_object.getRotation(0);
            targetPos = placeable_object.getCoords(false);
        }
        mp.game.graphics.drawText("Object", [targetPos.x, targetPos.y, targetPos.z], {
            font: 4,
            color: [255, 255, 255, 185],
            scale: [0.3, 0.3],
            outline: true,
            centre: true
        });
        mp.game.controls.disableControlAction(0, 16, true);
        mp.game.controls.disableControlAction(0, 17, true);
        if (mp.game.controls.isDisabledControlPressed(0, 16)) {
            console.log("Down");
            placeable_object.setRotation(rot.x, rot.y, rot.z - 5, 0, false);
        } else if (mp.game.controls.isDisabledControlPressed(0, 17)) {
            console.log("Up");
            placeable_object.setRotation(rot.x, rot.y, rot.z + 5, 0, true);
        }
        placeable_object.setCoords(targetPos.x, targetPos.y, targetPos.z, false, false, false, false);
    }
});