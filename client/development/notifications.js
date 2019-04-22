var Notifications = new class {
    constructor() {
        let self = this;
        this._renderObjects = [];
        this._smoothing = 1 / 120;
        mp.events.add("render", () => {
            self.render();
        });
    }
    render() {
        let self = this;
        self._renderObjects.forEach(function(frame, i) {
            let sVector = mp.vector(frame.start);
            let eVector = mp.vector(frame.end);
            let new_TargetPos = sVector.lerp(eVector, frame.t);


            frame.color[3] = 200 * (1 - (frame.t/1.4))

            mp.game.graphics.drawText(frame.text, [new_TargetPos.x, new_TargetPos.y, new_TargetPos.z], {
                font: 4,
                color: frame.color,
                scale: [0.3, 0.3],
                outline: true,
                centre: true
            });
            frame.t += self._smoothing;
            if ((frame.t >= 1) || (frame.color[3] < 0)){
                self._renderObjects.splice(i, 1);
            }
        })
    }
    notify3D(x,y,z,tx,ty,tz, text = "NO", color = [255, 255, 255]) {
        this._renderObjects.push({
            start:new mp.Vector3(x,y,z),
            end:new mp.Vector3(tx,ty,tz),
            t:0,
            text:text,
            color:color
        })
    }
}
module.exports = Notifications;
