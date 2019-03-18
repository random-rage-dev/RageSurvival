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
function pointingAt() {
    let distance = 10;
    direction = mp.gameplayCam.getDirection();
    coords = mp.gameplayCam.getCoord();
    const farAway = new mp.Vector3((direction.x * distance) + (coords.x), (direction.y * distance) + (coords.y), (direction.z * distance) + (coords.z));
    const result = mp.raycasting.testPointToPoint(coords, farAway, mp.players.local, -1);
    if (result === undefined) {
        return undefined;
    }
    return result;
}



mp.events.add("render", () => {
    let rot = mp.players.local.getRotation(0);
    if (placeable_object) {
        let max_dist = 20;
        let direction = mp.gameplayCam.getDirection();
        let coords = mp.gameplayCam.getCoord();
        let farAway = new mp.Vector3((direction.x * distance) + (coords.x), (direction.y * distance) + (coords.y), (direction.z * distance) + (coords.z));
        let result = mp.raycasting.testPointToPoint(coords, farAway, mp.players.local, -1);
        let targetPos = farAway;
        if (result !== undefined) {
            targetPos = result.position;
        }
        mp.game.controls.disableControlAction(0, 22, true);
        let space_key = mp.game.controls.isDisabledControlJustPressed(0, 22);
        if (space_key) {
            mp.game.graphics.drawText("Ground", [targetPos.x, targetPos.y, targetPos.z - 0.25], {
                font: 4,
                color: [255, 255, 255, 185],
                scale: [0.3, 0.3],
                outline: true,
                centre: true
            });
        }
        mp.game.graphics.drawText("Object", [targetPos.x, targetPos.y, targetPos.z], {
            font: 4,
            color: [255, 255, 255, 185],
            scale: [0.3, 0.3],
            outline: true,
            centre: true
        });
        placeable_object.setCoords(targetPos.x, targetPos.y, targetPos.z, false, false, false, false);
    }
});