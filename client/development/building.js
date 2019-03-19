let placeable_object;
mp.keys.bind(0x58, true, function() {
    if (placeable_object) {
        placeable_object.setCollision(true, true);
        placeable_object.setAlpha(255)
    }
    console.log("place");
    let temp_obj = mp.objects.new(mp.game.joaat("xm_prop_x17_filecab_01a"), mp.vector(mp.players.local.position).sub(0, 0, 10), {
        alpha: 255,
        dimension: 0
    });
    temp_obj.gameObject = true;
    placeable_object = temp_obj;
});

function checkNearbyProbs(obj, x, y, z, rz) {
    let center = mp.vector({
        x: x,
        y: y,
        z: z
    }).add(0, 0, 1);
    let left = center.findRot(rz, 0.4, 90);
    let right = center.findRot(rz, 0.4, 270);
    mp.game.graphics.drawLine(center.x, center.y, center.z, left.x, left.y, left.z, 255, 0, 0, 255);
    mp.game.graphics.drawLine(center.x, center.y, center.z, right.x, right.y, right.z, 0, 255, 0, 255);
    let result = mp.raycasting.testPointToPoint(center, left, placeable_object.handle, 16);
    let result1 = mp.raycasting.testPointToPoint(center, right, placeable_object.handle, 16);
    mp.game.graphics.drawText(result != undefined ? (typeof result.entity == "object") : "false", [left.x, left.y, left.z], {
        font: 4,
        color: [255, 255, 255, 185],
        scale: [0.3, 0.3],
        outline: true,
        centre: true
    });
    mp.game.graphics.drawText(result1 != undefined ? (typeof result1.entity == "object") : "false", [right.x, right.y, right.z], {
        font: 4,
        color: [255, 255, 255, 185],
        scale: [0.3, 0.3],
        outline: true,
        centre: true
    });
}
mp.events.add("render", () => {
    if (placeable_object) {
        placeable_object.setCollision(false, true);
        placeable_object.setAlpha(150)

        mp.game.graphics.drawText("[MW DOWN] Rotate Left", [0.4,0.7], {
            font: 4,
            color: [255, 255, 255, 200],
            scale: [0.3, 0.3],
            outline: true,
            centre: true
        });
        mp.game.graphics.drawText("[MW UP] Rotate Right", [0.6,0.7], {
            font: 4,
            color: [255, 255, 255, 200],
            scale: [0.3, 0.3],
            outline: true,
            centre: true
        });
        mp.game.graphics.drawText("[MOUSE] Change Position", [0.5,0.7], {
            font: 4,
            color: [255, 255, 255, 200],
            scale: [0.3, 0.3],
            outline: true,
            centre: true
        });








        let max_dist = 10;
        let direction = mp.gameplayCam.getDirection();
        let coords = mp.gameplayCam.getCoord();
        let cam_rot = mp.gameplayCam.getRot(0);
        let farAway = new mp.Vector3((direction.x * max_dist) + (coords.x), (direction.y * max_dist) + (coords.y), (direction.z * max_dist) + (coords.z));
        let result = mp.raycasting.testPointToPoint(coords, farAway, placeable_object.handle, 1);
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
        }
        
        mp.game.controls.disableControlAction(0, 16, true);
        mp.game.controls.disableControlAction(0, 17, true);
        if (mp.game.controls.isDisabledControlPressed(0, 16)) {
            rot.z -= 5;
        } else if (mp.game.controls.isDisabledControlPressed(0, 17)) {
            rot.z += 5;
        }
        placeable_object.setRotation(rot.x, rot.y, rot.z, 0, true);
        placeable_object.setCoords(targetPos.x, targetPos.y, targetPos.z, false, false, false, false);
        checkNearbyProbs(placeable_object, targetPos.x, targetPos.y, targetPos.z, rot.z);
    }
});