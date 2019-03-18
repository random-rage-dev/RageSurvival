var _items = {
    Cloth: {
        type: "Other",
        model: "",
        thickness: 0.15,
        offset: {
            pos: 0,
            rot: 0
        }
    },
    Disinfectant: {
        type: "Medical",
        model: "",
        thickness: 0.15,
        offset: {
            pos: 0,
            rot: 0
        }
    },
    Iodine: {
        type: "Industrial",
        model: "",
        thickness: 0.15,
        offset: {
            pos: 0,
            rot: 0
        }
    },
    Bandage: {
        type: "Medical",
        model: "",
        thickness: 0.15,
        offset: {
            pos: 0,
            rot: 0
        }
    },
    Skirt: {
        type: "Clothing",
        model: "",
        thickness: 0.15,
        offset: {
            pos: 0,
            rot: 0
        }
    }
};


var recipes = {
    "Bandage": [
        {
            input: [
                {
                    item: _items.Cloth,
                    amount: 2
                },
                {
                    item: _items.Disinfectant,
                    amount: 1
                }
            ],
            output: {
                item: _items.Bandage,
                amount: 1
            }
        },
        {
            input: [
                {
                    item: _items.Cloth,
                    amount: 2
                },
                {
                    item: _items.Iodine,
                    amount: 2
                }
            ],
            output: {
                item: _items.Bandage,
                amount: 1
            }
        }
    ],
    "Skirt": [
        {
            input: [
                {
                    item: _items.Cloth,
                    amount: 5
                }
            ],
            output: {
                item: _items.Skirt,
                amount: 1
            }
        }
    ]
};

let Status = {
    SUCCESS: 0,
    FAILED: 1,
    NOT_FOUND: 2,
    INVALID_AMOUNT: 3
};

/*
 * item: Indexname des Items (z.B. Bandage)
 * amount: muss mindestens 1 sein
 * variation: falls es verschiedene rezepte für ein item gibt.
 */
mp.events.add('Crafting:Craft', (player, item, amount, variation=0) => {
    if(!player || !item || !amount) {
        player.call('Crafting:Reply', [Status.FAILED]);
        return;
    }

    if(parseInt(amount) <= 0) {
        player.call('Crafting:Reply', [Status.INVALID_AMOUNT]);
        return;
    }

    if(!recipes[item]) {
        player.call('Crafting:Reply', [Status.NOT_FOUND]);
        return;
    }

    if(recipes[item].length-1 < variation) {
        player.call('Crafting:Reply', [Status.NOT_FOUND]);
        return;
    }

    let recipe = recipes[item][variation];

    let _PlayerHasItems = true;
    let _PlayerHasSpace = true;

    if(_PlayerHasItems && _PlayerHasSpace) {
        // remove input items from inventory
        // add output item to inventory
        player.call('Crafting:Reply', [Status.SUCCESS]);
    }
    player.call('Crafting:Reply', [Status.FAILED]);
});




mp.events.addCommand('craft', (player, _full, item, amount, variation=0) => {
    if(!player || !item || !amount) {
        player.call('Crafting:Reply', [Status.FAILED]);
        return;
    }

    if(parseInt(amount) <= 0) {
        player.call('Crafting:Reply', [Status.INVALID_AMOUNT]);
        return;
    }

    if(!recipes[item]) {
        player.call('Crafting:Reply', [Status.NOT_FOUND]);
        return;
    }

    if(recipes[item].length-1 < variation) {
        player.call('Crafting:Reply', [Status.NOT_FOUND]);
        return;
    }

    let recipe = recipes[item][variation];
    console.log(recipe);
    player.call('Crafting:Reply', [Status.SUCCESS]);
});

module.exports = recipes;