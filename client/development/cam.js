class CamManager {
    constructor() {
        this._setup();
    }
    _setup(url) {
        this.game_cam = mp.cameras.new('gameplay');
        this.fov = 60;
        this.pos = new mp.Vector3(0, 0, 0);
        this.cam = mp.cameras.new('default', this.pos, new mp.Vector3(0, 0, 0), this.fov);
        this.pointAt = new mp.Vector3(0, 0, 0);
    }
    activate(enable = true) {
        this.cam.setActive(enable);
        mp.game.cam.renderScriptCams(enable, false, 0, true, false);
    }
    blur(enable = true, ms = 1) {
        if (enable == true) {
            mp.game.graphics.transitionToBlurred(ms);
        } else {
            mp.game.graphics.transitionFromBlurred(ms);
        }
    }
    hideHud(hidden = true) {
            mp.game.ui.displayHud(!hidden);
            mp.game.ui.displayRadar(!hidden);
            mp.game.ui.setMinimapVisible(!hidden)
    }
    setPos(vector) {
        this.cam.setCoord(vector.x, vector.y, vector.z);
        this.pos = new mp.Vector3(vector.x, vector.y, vector.z);
    }
    pointAt(vector) {
        this.cam.pointAtCoord(vector.x, vector.y, vector.z);
        this.pointAt = new mp.Vector3(vector.x, vector.y, vector.z);
    }
    setFOV(fov = 90) {
        this.cam.setFov(fov);
    }
    smoothTo(x, y, z, tx, ty, tz, duration = 1000) {
        this.cam_new = mp.cameras.new('default', this.pos, new mp.Vector3(x, y, z), this.fov);
        this.cam_new.pointAtCoord(tx, ty, tz);
        this.cam_new.setActiveWithInterp(this.cam, duration, 0, 0);
        this.cam.destroy();
        this.cam = this.cam_new;
    }
}
module.exports = new CamManager();