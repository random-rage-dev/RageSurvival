var Zombie = class {
    constructor() {
        this._setup();
    }
    _setup() {
        var self = this;
        self._pos = {
            x: mp.players.local.position.x,
            y: mp.players.local.position.y,
            z: mp.players.local.position.z
        };
        self.movementTimer;
        self.syncTimer;
        self._ped = mp.peds.new(mp.game.joaat("ig_abigail"), new mp.Vector3(self._pos.x, self._pos.y, self._pos.z), Math.random(0, 360), function(ped) {}, 0);
        self.init();
        self.blip = mp.blips.new(9, new mp.Vector3(self._pos.x, self._pos.y, self._pos.z), {
            color: 3,
            scale: 0.2,
            alpha: 100,
            drawDistance: 0
        });
        self._task = {};
        self._target = mp.players.local;
    }
    get ped() {
        return this._ped
    }
    get pos() {
        return this._ped.getCoords(true)
    }
    init() {
        var self = this;
        let style = "move_heist_lester";
        self.loadPedAttributes();
        if (!mp.game.streaming.hasClipSetLoaded(style)) {
            mp.game.streaming.requestClipSet(style);
            while (!mp.game.streaming.hasClipSetLoaded(style)) mp.game.wait(0);
        }
        self._ped.setMovementClipset(style, 0.0);
        self.syncTimer = setInterval(function() {
            self.move()
        }, 5000)
    }
    loadPedAttributes() {
        var self = this;
        self._ped.freezePosition(false);
        self._ped.setCanRagdoll(true);
        self._ped.setRagdollOnCollision(true);
        self._ped.setCanRagdollFromPlayerImpact(true);
        self._ped.setCombatAbility(100);
        self._ped.setCombatMovement(3);
        for (var i = 1; i < 64; i += 2) {
            self._ped.setFleeAttributes(i, false);
        }
        self._ped.setFleeAttributes(0, false);
        self._ped.setCombatAttributes(17, true);
        self._ped.setCombatAttributes(16, true);
        self._ped.setInvincible(false);
        self._ped.setCanBeDamaged(true);
        self._ped.setOnlyDamagedByPlayer(false);
        self._ped.setBlockingOfNonTemporaryEvents(true);
    }
    move() {
        var self = this;
        let tPos = self._target.position;
/*        if (self._syncer != mp.players.local) {
            if (self._task.cPos.x != 0) {
                self._ped.setCoords(self._task.cPos.x, self._task.cPos.y, self._task.cPos.z, true, true, true, false);
            }
        }*/
        self._ped.resetRagdollTimer();
        self.blip.setCoords(self._ped.getCoords(true));
        self._ped.clearTasksImmediately();
        self._ped.taskGoToCoordAnyMeans(tPos.x, tPos.y, tPos.z, 5, 0, false, 786603, 0);
        self._ped.taskPutDirectlyIntoMelee(self._target.handle, 0.0, -1.0, 1.0, false);
    }
}
var Zombies = [];
/*
mp.events.add("render", e => {
    if (mp.game.controls.isControlJustPressed(0, 23)) {
        Zombies.push(new Zombie());
    }
    Zombies.forEach(function(zom) {
        mp.game.graphics.drawText("Zombie", [zom.pos.x,zom.pos.y,zom.pos.z], {
            font: 4,
            color: [255, 255, 255, 200],
            scale: [0.3, 0.3],
            outline: true,
            centre: true
        });
    })
});


*/

/*mp.keys.bind(0x09, false, () => {
    new Zombie();
});
*/