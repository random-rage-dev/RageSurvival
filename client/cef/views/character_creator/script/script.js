var values = [];
values["father"] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 42, 43, 44];
values["mother"] = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 45];
const fatherNames = ["Benjamin", "Daniel", "Joshua", "Noah", "Andrew", "Juan", "Alex", "Isaac", "Evan", "Ethan", "Vincent", "Angel", "Diego", "Adrian", "Gabriel", "Michael", "Santiago", "Kevin", "Louis", "Samuel", "Anthony", "Claude", "Niko", "John"];
const motherNames = ["Hannah", "Aubrey", "Jasmine", "Gisele", "Amelia", "Isabella", "Zoe", "Ava", "Camila", "Violet", "Sophia", "Evelyn", "Nicole", "Ashley", "Gracie", "Brianna", "Natalie", "Olivia", "Elizabeth", "Charlotte", "Emma", "Misty"];
values["blemishes"] = ["None", "Measles", "Pimples", "Spots", "Break Out", "Blackheads", "Build Up", "Pustules", "Zits", "Full Acne", "Acne", "Cheek Rash", "Face Rash", "Picker", "Puberty", "Eyesore", "Chin Rash", "Two Face", "T Zone", "Greasy", "Marked", "Acne Scarring", "Full Acne Scarring", "Cold Sores", "Impetigo"];
values["facial_hair"] = ["None", "Light Stubble", "Balbo", "Circle Beard", "Goatee", "Chin", "Chin Fuzz", "Pencil Chin Strap", "Scruffy", "Musketeer", "Mustache", "Trimmed Beard", "Stubble", "Thin Circle Beard", "Horseshoe", "Pencil and 'Chops", "Chin Strap Beard", "Balbo and Sideburns", "Mutton Chops", "Scruffy Beard", "Curly", "Curly & Deep Stranger", "Handlebar", "Faustic", "Otto & Patch", "Otto & Full Stranger", "Light Franz", "The Hampstead", "The Ambrose", "Lincoln Curtain"];
values["eyebrows"] = ["None", "Balanced", "Fashion", "Cleopatra", "Quizzical", "Femme", "Seductive", "Pinched", "Chola", "Triomphe", "Carefree", "Curvaceous", "Rodent", "Double Tram", "Thin", "Penciled", "Mother Plucker", "Straight and Narrow", "Natural", "Fuzzy", "Unkempt", "Caterpillar", "Regular", "Mediterranean", "Groomed", "Bushels", "Feathered", "Prickly", "Monobrow", "Winged", "Triple Tram", "Arched Tram", "Cutouts", "Fade Away", "Solo Tram"];
values["ageing"] = ["None", "Crow's Feet", "First Signs", "Middle Aged", "Worry Lines", "Depression", "Distinguished", "Aged", "Weathered", "Wrinkled", "Sagging", "Tough Life", "Vintage", "Retired", "Junkie", "Geriatric"];
/*EXTEND MAKEUP*/
values["makeup"] = ["None", "Smoky Black", "Bronze", "Soft Gray", "Retro Glam", "Natural Look", "Cat Eyes", "Chola", "Vamp", "Vinewood Glamour", "Bubblegum", "Aqua Dream", "Pin Up", "Purple Passion", "Smoky Cat Eye", "Smoldering Ruby", "Pop Princess"];
values["blush"] = ["None", "Full", "Angled", "Round", "Horizontal", "High", "Sweetheart", "Eighties"];
values["complexion"] = ["None", "Rosy Cheeks", "Stubble Rash", "Hot Flush", "Sunburn", "Bruised", "Alchoholic", "Patchy", "Totem", "Blood Vessels", "Damaged", "Pale", "Ghostly"];
values["sundamage"] = ["None", "Uneven", "Sandpaper", "Patchy", "Rough", "Leathery", "Textured", "Coarse", "Rugged", "Creased", "Cracked", "Gritty"];
values["lipstick"] = ["None", "Color Matte", "Color Gloss", "Lined Matte", "Lined Gloss", "Heavy Lined Matte", "Heavy Lined Gloss", "Lined Nude Matte", "Liner Nude Gloss", "Smudged", "Geisha"];
values["freckles"] = ["None", "Cherub", "All Over", "Irregular", "Dot Dash", "Over the Bridge", "Baby Doll", "Pixie", "Sun Kissed", "Beauty Marks", "Line Up", "Modelesque", "Occasional", "Speckled", "Rain Drops", "Double Dip", "One Sided", "Pairs", "Growth"];
values["chesthair"] = ["None", "Natural", "The Strip", "The Tree", "Hairy", "Grisly", "Ape", "Groomed Ape", "Bikini", "Lightning Bolt", "Reverse Lightning", "Love Heart", "Chestache", "Happy Face", "Skull", "Snail Trail", "Slug and Nips", "Hairy Arms"];
values["eyeColor"] = ["Green", "Emerald", "Light Blue", "Ocean Blue", "Light Brown", "Dark Brown", "Hazel", "Dark Gray", "Light Gray", "Pink", "Yellow", "Purple", "Blackout", "Shades of Gray", "Tequila Sunrise", "Atomic", "Warp", "ECola", "Space Ranger", "Ying Yang", "Bullseye", "Lizard", "Dragon", "Extra Terrestrial", "Goat", "Smiley", "Possessed", "Demon", "Infected", "Alien", "Undead", "Zombie"];
values["maxHairColor"] = 64;
values["maxBlushColor"] = 27;
values["maxLipstickColor"] = 32;
const featureNames = ["Nose Width", "Nose Bottom Height", "Nose Tip Length", "Nose Bridge Depth", "Nose Tip Height", "Nose Broken", "Brow Height", "Brow Depth", "Cheekbone Height", "Cheekbone Width", "Cheek Depth", "Eye Size", "Lip Thickness", "Jaw Width", "Jaw Shape", "Chin Height", "Chin Depth", "Chin Width", "Chin Indent", "Neck Width"];
const hairList = [
    // male
    [{
        ID: 0,
        Name: "Close Shave",
        Collection: "mpbeach_overlays",
        Overlay: "FM_Hair_Fuzz"
    }, {
        ID: 1,
        Name: "Buzzcut",
        Collection: "multiplayer_overlays",
        Overlay: "NG_M_Hair_001"
    }, {
        ID: 2,
        Name: "Faux Hawk",
        Collection: "multiplayer_overlays",
        Overlay: "NG_M_Hair_002"
    }, {
        ID: 3,
        Name: "Hipster",
        Collection: "multiplayer_overlays",
        Overlay: "NG_M_Hair_003"
    }, {
        ID: 4,
        Name: "Side Parting",
        Collection: "multiplayer_overlays",
        Overlay: "NG_M_Hair_004"
    }, {
        ID: 5,
        Name: "Shorter Cut",
        Collection: "multiplayer_overlays",
        Overlay: "NG_M_Hair_005"
    }, {
        ID: 6,
        Name: "Biker",
        Collection: "multiplayer_overlays",
        Overlay: "NG_M_Hair_006"
    }, {
        ID: 7,
        Name: "Ponytail",
        Collection: "multiplayer_overlays",
        Overlay: "NG_M_Hair_007"
    }, {
        ID: 8,
        Name: "Cornrows",
        Collection: "multiplayer_overlays",
        Overlay: "NG_M_Hair_008"
    }, {
        ID: 9,
        Name: "Slicked",
        Collection: "multiplayer_overlays",
        Overlay: "NG_M_Hair_009"
    }, {
        ID: 10,
        Name: "Short Brushed",
        Collection: "multiplayer_overlays",
        Overlay: "NG_M_Hair_013"
    }, {
        ID: 11,
        Name: "Spikey",
        Collection: "multiplayer_overlays",
        Overlay: "NG_M_Hair_002"
    }, {
        ID: 12,
        Name: "Caesar",
        Collection: "multiplayer_overlays",
        Overlay: "NG_M_Hair_011"
    }, {
        ID: 13,
        Name: "Chopped",
        Collection: "multiplayer_overlays",
        Overlay: "NG_M_Hair_012"
    }, {
        ID: 14,
        Name: "Dreads",
        Collection: "multiplayer_overlays",
        Overlay: "NG_M_Hair_014"
    }, {
        ID: 15,
        Name: "Long Hair",
        Collection: "multiplayer_overlays",
        Overlay: "NG_M_Hair_015"
    }, {
        ID: 16,
        Name: "Shaggy Curls",
        Collection: "multiplayer_overlays",
        Overlay: "NGBea_M_Hair_000"
    }, {
        ID: 17,
        Name: "Surfer Dude",
        Collection: "multiplayer_overlays",
        Overlay: "NGBea_M_Hair_001"
    }, {
        ID: 18,
        Name: "Short Side Part",
        Collection: "multiplayer_overlays",
        Overlay: "NGBus_M_Hair_000"
    }, {
        ID: 19,
        Name: "High Slicked Sides",
        Collection: "multiplayer_overlays",
        Overlay: "NGBus_M_Hair_001"
    }, {
        ID: 20,
        Name: "Long Slicked",
        Collection: "multiplayer_overlays",
        Overlay: "NGHip_M_Hair_000"
    }, {
        ID: 21,
        Name: "Hipster Youth",
        Collection: "multiplayer_overlays",
        Overlay: "NGHip_M_Hair_001"
    }, {
        ID: 22,
        Name: "Mullet",
        Collection: "multiplayer_overlays",
        Overlay: "NGInd_M_Hair_000"
    }, {
        ID: 24,
        Name: "Classic Cornrows",
        Collection: "mplowrider_overlays",
        Overlay: "LR_M_Hair_000"
    }, {
        ID: 25,
        Name: "Palm Cornrows",
        Collection: "mplowrider_overlays",
        Overlay: "LR_M_Hair_001"
    }, {
        ID: 26,
        Name: "Lightning Cornrows",
        Collection: "mplowrider_overlays",
        Overlay: "LR_M_Hair_002"
    }, {
        ID: 27,
        Name: "Whipped Cornrows",
        Collection: "mplowrider_overlays",
        Overlay: "LR_M_Hair_003"
    }, {
        ID: 28,
        Name: "Zig Zag Cornrows",
        Collection: "mplowrider2_overlays",
        Overlay: "LR_M_Hair_004"
    }, {
        ID: 29,
        Name: "Snail Cornrows",
        Collection: "mplowrider2_overlays",
        Overlay: "LR_M_Hair_005"
    }, {
        ID: 30,
        Name: "Hightop",
        Collection: "mplowrider2_overlays",
        Overlay: "LR_M_Hair_006"
    }, {
        ID: 31,
        Name: "Loose Swept Back",
        Collection: "mpbiker_overlays",
        Overlay: "MP_Biker_Hair_000_M"
    }, {
        ID: 32,
        Name: "Undercut Swept Back",
        Collection: "mpbiker_overlays",
        Overlay: "MP_Biker_Hair_001_M"
    }, {
        ID: 33,
        Name: "Undercut Swept Side",
        Collection: "mpbiker_overlays",
        Overlay: "MP_Biker_Hair_002_M"
    }, {
        ID: 34,
        Name: "Spiked Mohawk",
        Collection: "mpbiker_overlays",
        Overlay: "MP_Biker_Hair_003_M"
    }, {
        ID: 35,
        Name: "Mod",
        Collection: "mpbiker_overlays",
        Overlay: "MP_Biker_Hair_004_M"
    }, {
        ID: 36,
        Name: "Layered Mod",
        Collection: "mpbiker_overlays",
        Overlay: "MP_Biker_Hair_005_M"
    }, {
        ID: 72,
        Name: "Flattop",
        Collection: "mpgunrunning_overlays",
        Overlay: "MP_Gunrunning_Hair_M_000_M"
    }, {
        ID: 73,
        Name: "Military Buzzcut",
        Collection: "mpgunrunning_overlays",
        Overlay: "MP_Gunrunning_Hair_M_001_M"
    }],
    // female
    [{
        ID: 0,
        Name: "Close Shave",
        Collection: "mpbeach_overlays",
        Overlay: "FM_Hair_Fuzz"
    }, {
        ID: 1,
        Name: "Short",
        Collection: "multiplayer_overlays",
        Overlay: "NG_F_Hair_001"
    }, {
        ID: 2,
        Name: "Layered Bob",
        Collection: "multiplayer_overlays",
        Overlay: "NG_F_Hair_002"
    }, {
        ID: 3,
        Name: "Pigtails",
        Collection: "multiplayer_overlays",
        Overlay: "NG_F_Hair_003"
    }, {
        ID: 4,
        Name: "Ponytail",
        Collection: "multiplayer_overlays",
        Overlay: "NG_F_Hair_004"
    }, {
        ID: 5,
        Name: "Braided Mohawk",
        Collection: "multiplayer_overlays",
        Overlay: "NG_F_Hair_005"
    }, {
        ID: 6,
        Name: "Braids",
        Collection: "multiplayer_overlays",
        Overlay: "NG_F_Hair_006"
    }, {
        ID: 7,
        Name: "Bob",
        Collection: "multiplayer_overlays",
        Overlay: "NG_F_Hair_007"
    }, {
        ID: 8,
        Name: "Faux Hawk",
        Collection: "multiplayer_overlays",
        Overlay: "NG_F_Hair_008"
    }, {
        ID: 9,
        Name: "French Twist",
        Collection: "multiplayer_overlays",
        Overlay: "NG_F_Hair_009"
    }, {
        ID: 10,
        Name: "Long Bob",
        Collection: "multiplayer_overlays",
        Overlay: "NG_F_Hair_010"
    }, {
        ID: 11,
        Name: "Loose Tied",
        Collection: "multiplayer_overlays",
        Overlay: "NG_F_Hair_011"
    }, {
        ID: 12,
        Name: "Pixie",
        Collection: "multiplayer_overlays",
        Overlay: "NG_F_Hair_012"
    }, {
        ID: 13,
        Name: "Shaved Bangs",
        Collection: "multiplayer_overlays",
        Overlay: "NG_F_Hair_013"
    }, {
        ID: 14,
        Name: "Top Knot",
        Collection: "multiplayer_overlays",
        Overlay: "NG_M_Hair_014"
    }, {
        ID: 15,
        Name: "Wavy Bob",
        Collection: "multiplayer_overlays",
        Overlay: "NG_M_Hair_015"
    }, {
        ID: 16,
        Name: "Messy Bun",
        Collection: "multiplayer_overlays",
        Overlay: "NGBea_F_Hair_000"
    }, {
        ID: 17,
        Name: "Pin Up Girl",
        Collection: "multiplayer_overlays",
        Overlay: "NGBea_F_Hair_001"
    }, {
        ID: 18,
        Name: "Tight Bun",
        Collection: "multiplayer_overlays",
        Overlay: "NG_F_Hair_007"
    }, {
        ID: 19,
        Name: "Twisted Bob",
        Collection: "multiplayer_overlays",
        Overlay: "NGBus_F_Hair_000"
    }, {
        ID: 20,
        Name: "Flapper Bob",
        Collection: "multiplayer_overlays",
        Overlay: "NGBus_F_Hair_001"
    }, {
        ID: 21,
        Name: "Big Bangs",
        Collection: "multiplayer_overlays",
        Overlay: "NGBea_F_Hair_001"
    }, {
        ID: 22,
        Name: "Braided Top Knot",
        Collection: "multiplayer_overlays",
        Overlay: "NGHip_F_Hair_000"
    }, {
        ID: 23,
        Name: "Mullet",
        Collection: "multiplayer_overlays",
        Overlay: "NGInd_F_Hair_000"
    }, {
        ID: 25,
        Name: "Pinched Cornrows",
        Collection: "mplowrider_overlays",
        Overlay: "LR_F_Hair_000"
    }, {
        ID: 26,
        Name: "Leaf Cornrows",
        Collection: "mplowrider_overlays",
        Overlay: "LR_F_Hair_001"
    }, {
        ID: 27,
        Name: "Zig Zag Cornrows",
        Collection: "mplowrider_overlays",
        Overlay: "LR_F_Hair_002"
    }, {
        ID: 28,
        Name: "Pigtail Bangs",
        Collection: "mplowrider2_overlays",
        Overlay: "LR_F_Hair_003"
    }, {
        ID: 29,
        Name: "Wave Braids",
        Collection: "mplowrider2_overlays",
        Overlay: "LR_F_Hair_003"
    }, {
        ID: 30,
        Name: "Coil Braids",
        Collection: "mplowrider2_overlays",
        Overlay: "LR_F_Hair_004"
    }, {
        ID: 31,
        Name: "Rolled Quiff",
        Collection: "mplowrider2_overlays",
        Overlay: "LR_F_Hair_006"
    }, {
        ID: 32,
        Name: "Loose Swept Back",
        Collection: "mpbiker_overlays",
        Overlay: "MP_Biker_Hair_000_F"
    }, {
        ID: 33,
        Name: "Undercut Swept Back",
        Collection: "mpbiker_overlays",
        Overlay: "MP_Biker_Hair_001_F"
    }, {
        ID: 34,
        Name: "Undercut Swept Side",
        Collection: "mpbiker_overlays",
        Overlay: "MP_Biker_Hair_002_F"
    }, {
        ID: 35,
        Name: "Spiked Mohawk",
        Collection: "mpbiker_overlays",
        Overlay: "MP_Biker_Hair_003_F"
    }, {
        ID: 36,
        Name: "Bandana and Braid",
        Collection: "multiplayer_overlays",
        Overlay: "NG_F_Hair_003"
    }, {
        ID: 37,
        Name: "Layered Mod",
        Collection: "mpbiker_overlays",
        Overlay: "MP_Biker_Hair_006_F"
    }, {
        ID: 38,
        Name: "Skinbyrd",
        Collection: "mpbiker_overlays",
        Overlay: "MP_Biker_Hair_004_F"
    }, {
        ID: 76,
        Name: "Neat Bun",
        Collection: "mpgunrunning_overlays",
        Overlay: "MP_Gunrunning_Hair_F_000_F"
    }, {
        ID: 77,
        Name: "Short Bob",
        Collection: "mpgunrunning_overlays",
        Overlay: "MP_Gunrunning_Hair_F_001_F"
    }]
];
var CharacterCreator = new class {
    constructor() {
        let self = this;
        this.parents = {
            fatherIndex: 0,
            motherIndex: 0,
            resemblance: 0,
            tone: 50
        }
        this.gender = "Male";
        this.ageing = 0;
        this.ageing_opacity = 100;
        this.blemishes = 0;
        this.blemishes_opacity = 100;
        this.facial_hair = 0;
        this.facial_hair_color = 0;
        this.facial_hair_opacity = 100;
        this.eyebrows = 0;
        this.eyebrows_color = 0;
        this.eyebrows_opacity = 100;
        this.makeup = 0;
        this.makeup_opacity = 100;
        this.blush = 0;
        this.blush_color = 0;
        this.blush_opacity = 100;
        this.complexion = 0;
        this.complexion_opacity = 100;
        this.sundamage = 0;
        this.sundamage_opacity = 100;
        this.lipstick = 0;
        this.lipstick_opacity = 100;
        this.freckles = 0;
        this.freckles_opacity = 100;
        this.chesthair = 0;
        this.chesthair_color = 0;
        this.chesthair_opacity = 100;
        this.eyeColor = 0;
        this.hair = 0;
        this.hair_color = 0;
        this.hair_highlight_color = 0;
        this.facialFeatures = [];
        featureNames.forEach(function(name, i) {
            self.facialFeatures[i] = 0.5;
        });
    }
    update(type) {
        let self = this;
        console.log("update", type);
        if (type.indexOf("color") > -1) {
            $("#" + type + "Value").html(this[type]);
        }
        if ((this[type] != undefined) && (type != "gender") && (type != "hair")) {
            if (values[type] != undefined) {
                $("#" + type + "Value").html(values[type][this[type]]);
            }
        }
        if (type == "hair" || type == "gender") {
            let gender = this.gender == "Male" ? 0 : 1;
            console.log("g", gender);
            console.log("h", hairList[gender][this.hair].Name);
            $("#" + "hairValue").html(hairList[gender][this.hair].Name);
        }
        if (type == "gender") {
            $("#" + type).html(this.gender);
        }
        if (type == "fatherIndex" || type == "motherIndex") {
            let names = (type == "fatherIndex") ? fatherNames : motherNames;
            $("#" + type).html(names[this.parents[type]]);
        }
        //Character:Update
        let CharData = {
            fatherIndex: this.parents.fatherIndex,
            motherIndex: this.parents.motherIndex,
            resemblance: this.parents.resemblance,
            tone: this.parents.tone,
            gender: this.gender,
            ageing: this.ageing,
            ageing_opacity: this.ageing_opacity,
            blemishes: this.blemishes,
            blemishes_opacity: this.blemishes_opacity,
            facial_hair: this.facial_hair,
            facial_hair_color: this.facial_hair_color,
            facial_hair_opacity: this.facial_hair_opacity,
            eyebrows: this.eyebrows,
            eyebrows_color: this.eyebrows_color,
            eyebrows_opacity: this.eyebrows_opacity,
            makeup: this.makeup,
            makeup_opacity: this.makeup_opacity,
            blush: this.blush,
            blush_color: this.blush_color,
            blush_opacity: this.blush_opacity,
            complexion: this.complexion,
            complexion_opacity: this.complexion_opacity,
            sundamage: this.sundamage,
            sundamage_opacity: this.sundamage_opacity,
            lipstick: this.lipstick,
            lipstick_opacity: this.lipstick_opacity,
            freckles: this.freckles,
            freckles_opacity: this.freckles_opacity,
            chesthair: this.chesthair,
            chesthair_color: this.chesthair_color,
            chesthair_opacity: this.chesthair_opacity,
            eyeColor: this.eyeColor,
            hair: hairList[this.gender == "Male" ? 0 : 1][this.hair].ID,
            hair_color: this.hair_color,
            hair_highlight_color: this.hair_highlight_color,
            facial: Object.keys(self.facialFeatures).map(function(i) {
                return {
                    index: i,
                    val: self.facialFeatures[i]
                }
            })
        }
        mp.trigger("Character:Update", JSON.stringify(CharData));
    }
    save() {
        let self = this;
        let CharData = {
            fatherIndex: this.parents.fatherIndex,
            motherIndex: this.parents.motherIndex,
            resemblance: this.parents.resemblance,
            tone: this.parents.tone,
            gender: this.gender,
            ageing: this.ageing,
            ageing_opacity: this.ageing_opacity,
            blemishes: this.blemishes,
            blemishes_opacity: this.blemishes_opacity,
            facial_hair: this.facial_hair,
            facial_hair_color: this.facial_hair_color,
            facial_hair_opacity: this.facial_hair_opacity,
            eyebrows: this.eyebrows,
            eyebrows_color: this.eyebrows_color,
            eyebrows_opacity: this.eyebrows_opacity,
            makeup: this.makeup,
            makeup_opacity: this.makeup_opacity,
            blush: this.blush,
            blush_color: this.blush_color,
            blush_opacity: this.blush_opacity,
            complexion: this.complexion,
            complexion_opacity: this.complexion_opacity,
            sundamage: this.sundamage,
            sundamage_opacity: this.sundamage_opacity,
            lipstick: this.lipstick,
            lipstick_opacity: this.lipstick_opacity,
            freckles: this.freckles,
            freckles_opacity: this.freckles_opacity,
            chesthair: this.chesthair,
            chesthair_color: this.chesthair_color,
            chesthair_opacity: this.chesthair_opacity,
            eyeColor: this.eyeColor,
            hair: hairList[this.gender == "Male" ? 0 : 1][this.hair].ID,
            hair_color: this.hair_color,
            hair_highlight_color: this.hair_highlight_color,
            facial: Object.keys(self.facialFeatures).map(function(i) {
                return {
                    index: i,
                    val: self.facialFeatures[i]
                }
            })
        }
        mp.trigger("Character:Save", JSON.stringify(CharData));
    }
    slide(type, val) {
        if (type == "resemblance" || type == "tone") {
            this.parents[type] = val
        }
        if (type.indexOf("_opacity") > -1) {
            this[type] = val;
        }
        if (type.indexOf("FacialFeature") > -1) {
            let index = type.replace("FacialFeature_", ""); //this.facialFeatures;
            this.facialFeatures[index] = (val - 50)
        }
        this.update(type)
    }
    next(type, colors) {
        console.log(type);
        console.log("this[type]", this[type]);
        console.log("colors", colors);
        if ((this[type] != undefined) && (colors != undefined) && (type != "gender")) {
            let max_index = colors == "hair" ? values["maxHairColor"] : colors == "blush" ? values["maxBlushColor"] : values["maxLipstickColor"];
            console.log("COLOR", max_index)
            if (this[type] + 1 <= max_index) {
                this[type] += 1;
                this.update(type);
            } else {
                this[type] = max_index;
            }
        }
        if (type == "hair") {
            let gender = this.gender == "Male" ? 0 : 1;
            let cHair = this.hair;
            let max_index = hairList[gender].length;
            if (cHair + 1 <= max_index) {
                this.hair += 1;
                this.update(type);
            } else {
                this.hair = max_index;
            }
        };
        if ((this[type] != undefined) && (type != "gender") && (type != "hair")) {
            if (values[type] != undefined) {
                let m = values[type].length;
                console.log("MAX", m);
                if ((this[type] + 1) < m) {
                    console.log(this[type] + 1);
                    this[type] += 1;
                    console.log("m", m)
                    console.log("this[type]", this[type])
                    this.update(type);
                }
            }
        }
        if (type == "gender") {
            if (this.gender == "Male") {
                this.gender = "Female";
                this.update(type)
            }
        }
        if (type == "fatherIndex" || type == "motherIndex") {
            let names = (type == "fatherIndex") ? fatherNames : motherNames;
            let cur = this.parents[type];
            let next = values[type.replace("Index", "")][cur + 1];
            if (next != undefined) {
                console.log("cur", values[type.replace("Index", "")][cur]);
                console.log("next", next);
                this.parents[type] = cur + 1;
                if (this.parents[type] >= names.length - 1) this.parents[type] = names.length - 1;
                this.update(type)
            }
        }
    }
    prev(type) {
        if (type == "hair") {
            let gender = this.gender == "Male" ? 0 : 1;
            let cHair = this.hair;
            let max_index = hairList[gender].length;
            if (cHair - 1 >= 0) {
                this.hair -= 1;
                this.update(type);
            } else {
                this.hair = 0;
            }
        };
        if ((this[type] != undefined) && (type != "gender") && (type != "hair")) {
            if ((this[type] - 1) >= 0) {
                this[type] -= 1;
                this.update(type);
            }
        }
        if (type == "gender") {
            if (this.gender == "Female") {
                this.gender = "Male";
                this.update(type)
            }
        }
        if (type == "fatherIndex" || type == "motherIndex") {
            let names = (type == "fatherIndex") ? fatherNames : motherNames;
            let cur = this.parents[type];
            let prev = values[type.replace("Index", "")][cur - 1];
            if (prev != undefined) {
                this.parents[type] = cur - 1;
                if (this.parents[type] <= 0) this.parents[type] = 0;
                this.update(type)
            }
        }
    }
}
$("#create_button").on("click", function(e) {
    CharacterCreator.save()
})
var SliderManager = new class {
    constructor() {
        let self = this;
        this._offset;
        this._currentSlider;
        this._target;
        this._mouseDown = false;
        $(window).mousemove(function(event) {
            self.update(event);
        });
        $(window).mouseup(function(event) {
            self.mouseup(event);
        });
    }
    mouseup(e) {
        this._target = null;
        this._currentSlider = null;
        this._offset = null;
        this._offset.width = null;
        this._mouseDown = false;
    }
    update(e) {
        let self = this;
        if (self._mouseDown && e.pageX >= self._offset.left && e.pageX <= (self._offset.left + self._offset.width)) {
            if (self._target) {
                let val = Math.round(((e.pageX - self._offset.left) / self._offset.width) * 100);
                self._target.val(val);
                CharacterCreator.slide(self._currentSlider, val);
            }
        }
    }
    start(slider, target) {
        this._target = $(target);
        this._currentSlider = slider;
        this._offset = $(target).offset();
        this._offset.width = $(target).width();
        this._mouseDown = true;
    }
}

/*SLIDER END*/
$(".group").on("click", function() {
    let f = $(this).attr("for");
    $("#" + f).show();
    let height = 0;
    $("#" + f).find(".group_div").each(function(i, div) {
        height += $(div).outerHeight()
    })
    $(".group_content").each(function(i, div) {
        if ($("#" + f)[0] != $(div)[0]) {
            if ($($(div)[0]).height() > 0) {
                $($(div)[0]).animate({
                    height: 0
                }, {
                    duration: 100,
                    specialEasing: {
                        width: "linear",
                        height: "linear"
                    }
                })
            }
        }
    })
    if ($("#" + f).height() != 0) {
        $("#" + f).animate({
            height: 0
        }, {
            duration: 100,
            specialEasing: {
                width: "linear",
                height: "linear"
            }
        })
    } else {
        $("#" + f).animate({
            height: height
        }, {
            duration: 100,
            specialEasing: {
                width: "linear",
                height: "linear"
            }
        })
    }
})