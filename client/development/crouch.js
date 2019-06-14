const movementClipSet = "move_ped_crouched";
const strafeClipSet = "move_ped_crouched_strafing";
const clipSetSwitchTime = 0.25;
const loadClipSet = (clipSetName) => {
    mp.game.streaming.requestClipSet(clipSetName);
    while (!mp.game.streaming.hasClipSetLoaded(clipSetName)) mp.game.wait(0);
};
loadClipSet(movementClipSet);
loadClipSet(strafeClipSet);
mp.events.add("entityStreamIn", (entity) => {
    if (entity.type === "player" && entity.getVariable("isCrouched")) {
        entity.setMovementClipset(movementClipSet, clipSetSwitchTime);
        entity.setStrafeClipset(strafeClipSet);
    }
});
mp.events.addDataHandler("isCrouched", (entity, value) => {
    if (entity.type !== "player") return;
    if (value) {
        entity.setMovementClipset(movementClipSet, clipSetSwitchTime);
        entity.setStrafeClipset(strafeClipSet);
    } else {
        entity.resetMovementClipset(clipSetSwitchTime);
        entity.resetStrafeClipset();
    }
});
mp.events.add("render", () => {
    mp.game.controls.disableControlAction(2, 36, true);
    if (mp.game.controls.isDisabledControlJustPressed(2, 36)) {
        if ((mp.canCrouch == true) && (mp.gui.chat.enabled == false) && (mp.ui.ready == true)) {
            mp.events.callRemote("Player:Crouch");
        }
    }
})