var Building = new class {
    constructor() {
        this._setup();
    }
    _setup() {
        let self = this;
        self._cObj = null;
        self._maxDist = 10;
        self._state = false;
        mp.events.add("render", e => self._render(e));
    }
    get busy() {
        return this._state;
    }
    cancel() {
        if (this.busy == true) {
            this._cObj.destroy();
            this._cObj = null;
            mp.events.callRemote("Building:Canceled");
            this._state = false;
            mp.canCrouch = true;
        }
    }
    loadObject(model) {
        let self = this;
        self._tempModel = model
        let temp_obj = mp.objects.new(mp.game.joaat(model), mp.vector(mp.players.local.position).sub(0, 0, 10), {
            alpha: 255,
            dimension: 0
        });
        temp_obj.gameObject = true;
        self._cObj = temp_obj;
        self._state = true;
    }
    _getPlaceCoords() {
        let self = this;
        let direction = mp.gameplayCam.getDirection();
        let coords = mp.gameplayCam.getCoord();
        let cam_rot = mp.gameplayCam.getRot(0);
        let farAway = new mp.Vector3((direction.x * self._maxDist) + (coords.x), (direction.y * self._maxDist) + (coords.y), (direction.z * self._maxDist) + (coords.z));
        let result = mp.raycasting.testPointToPoint(coords, farAway, self._cObj.handle, (1 | 16));
        let targetPos = farAway;
        if (result !== undefined) {
            targetPos = mp.vector(result.position);
        }
        return targetPos;
    }
    _render() {
        let self = this;
        if ((self._state) && (self._cObj)) {
            mp.game.controls.disableControlAction(0, 22, true); // SPACE
            mp.game.controls.disableControlAction(0, 16, true); //MWHEEL
            mp.game.controls.disableControlAction(0, 17, true); //MWHEEL
            mp.game.controls.disableControlAction(0, 24, true); //Left Mouse Button
            self._cObj.setCollision(false, false);
            self._cObj.setAlpha(150);
            let rot = self._cObj.getRotation(0);
            let targetPos = self._getPlaceCoords();
            let ground = mp.vector(targetPos).ground2(self._cObj);
            let space_key = mp.game.controls.isDisabledControlPressed(0, 22);
            if (space_key) {
                targetPos = ground;
            }
            if (mp.game.controls.isDisabledControlPressed(0, 16)) {
                rot.z -= 8;
            } else if (mp.game.controls.isDisabledControlPressed(0, 17)) {
                rot.z += 8;
            }
            self._cObj.setRotation(rot.x, rot.y, rot.z, 0, true);
            self._cObj.setCoords(targetPos.x, targetPos.y, targetPos.z, false, false, false, false);
            mp.game.graphics.drawText((ground.dist(targetPos) > 0.001) ? "[NOT PLACEABLE]" : "[PLACEABLE]", [targetPos.x, targetPos.y, targetPos.z], {
                font: 4,
                color: [255, 255, 255, 185],
                scale: [0.25, 0.25],
                outline: true,
                centre: true
            });
            self._renderHelp();
            mp.canCrouch = false;
            let can_place = (ground.dist(targetPos) > 0.001) ? false : true;
            if (mp.game.controls.isDisabledControlPressed(0, 24)) {
                if (can_place == true) {
                    self._place();
                }
            } else if (mp.game.controls.isDisabledControlPressed(0, 25)) {
                self.cancel();
            }
        }
    }
    _place() {
        let self = this;
        if (self._cObj) {
            let rot = self._cObj.getRotation(0);
            let pos = self._cObj.getCoords(false);
            self._cObj.destroy();
            self._cObj = null;
            let obj_data = {
                model: self._tempModel,
                pos: {
                    x: pos.x,
                    y: pos.y,
                    z: pos.z
                },
                rot: {
                    x: rot.x,
                    y: rot.y,
                    z: rot.z
                }
            }
            mp.events.callRemote("Building:Place", JSON.stringify(obj_data));
            mp.canCrouch = true;
        }
        self._state = false;
    }
    _renderHelp() {
        let self = this;
        mp.game.graphics.drawText("[MW DOWN] Rotate Left", [0.4, 0.7], {
            font: 4,
            color: (mp.game.controls.isDisabledControlPressed(0, 16) == true) ? [255, 150, 150, 200] : [255, 255, 255, 200],
            scale: [0.3, 0.3],
            outline: true,
            centre: true
        });
        mp.game.graphics.drawText("[MW UP] Rotate Right", [0.6, 0.7], {
            font: 4,
            color: (mp.game.controls.isDisabledControlPressed(0, 17) == true) ? [255, 150, 150, 200] : [255, 255, 255, 200],
            scale: [0.3, 0.3],
            outline: true,
            centre: true
        });
        mp.game.graphics.drawText("[LMB] Place Object", [0.5, 0.65], {
            font: 4,
            color: [255, 255, 255, 200],
            scale: [0.3, 0.3],
            outline: true,
            centre: true
        });
        mp.game.graphics.drawText("[RMB] Cancel Placement", [0.5, 0.67], {
            font: 4,
            color: [255, 255, 255, 200],
            scale: [0.3, 0.3],
            outline: true,
            centre: true
        });
        mp.game.graphics.drawText("[MOUSE] Change Position", [0.5, 0.7], {
            font: 4,
            color: [255, 255, 255, 200],
            scale: [0.3, 0.3],
            outline: true,
            centre: true
        });
        mp.game.graphics.drawText("[SPACE] Snap to Ground", [0.5, 0.73], {
            font: 4,
            color: (mp.game.controls.isDisabledControlPressed(0, 22) == true) ? [255, 150, 150, 200] : [255, 255, 255, 200],
            scale: [0.3, 0.3],
            outline: true,
            centre: true
        });
    }
}
mp.events.add("Building:Start", (model) => {
    if (Building.busy == false) {
        console.log("loading building object", model);
        Building.loadObject(model);
    }
});
mp.events.add("Building:Cancel", () => {
    if (Building.busy == true) {
        Building.cancel();
    }
});
module.exports = Building;