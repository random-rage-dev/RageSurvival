var animations = {};


var Animations = new class{
	constructor() {
		this._preparedAnimations = [];
	}
	loadAnim(shortcut,dict,name) {
		this._preparedAnimations[shortcut] = {dict:dict,name:name};
	}
	send(player) {
		let self = this;
		let allAnims = Object.keys(this._preparedAnimations).map(function(e) {
			return {
				dict:self._preparedAnimations[e].dict,
				name:self._preparedAnimations[e].name
			}
		})
		player.call("Sync:PrepareAnim",[allAnims])
	}
	getAnim(name) {
		return this._preparedAnimations[name] || undefined;
	}

}

Animations.loadAnim("Mining","amb@world_human_hammering@male@base","base")
Animations.loadAnim("Drinking","mp_player_intdrink", "loop_bottle")
Animations.loadAnim("Eating","mp_player_inteat@burger", "mp_player_int_eat_burger")
Animations.loadAnim("Drop","pickup_object", "putdown_low")

module.exports = Animations;