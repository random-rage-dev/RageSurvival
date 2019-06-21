var equipment = {
	"Hatchet": {
		type: "melee",
		hash: "weapon_hatchet"
	},
	"Pump Shotgun": {
		hash: "weapon_pumpshotgun",
		ammo: "12 Gauge Shells"
	},
	"Micro SMG": {
		hash: "weapon_microsmg",
		ammo: "9mm Bullets"
	},
	"Assault Rifle": {
		hash: "weapon_assaultrifle",
		ammo: "5.56m Bullets"
	},
	"Small Backpack": {
		drawable: 41,
		w: 10,
		h: 14
	},
	"Light Armor": {
		drawable: {
			"Male": 1,
			"Female": 1
		}
	},
	"Heavy Armor": {
		drawable: {
			"Male": 15,
			"Female": 17
		}
	}
}
module.exports = equipment;