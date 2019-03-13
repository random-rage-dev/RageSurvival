"use strict";
let item_pdw = {
    name: "combatpdw",
    width: 4,
    height: 2
};

let item_hatchet = {
    name: "hatchet",
    width: 2,
    height: 4
};

let item_parachute = {
    name: "parachute",
    width: 2,
    height: 3
};

let Inventory = {
    selector: $("#inventory"),
    width: null,

    Generate: function(slots) {
        for (let i = 0; i < slots; i++) {
            console.log(i);
            Inventory.selector.append('<div class="slot"></div>');
        }
        Inventory.width = $('#inventory').css('grid-template-columns').split(' ').length;
    },

    SetItem: function(item, x, y, flip = false) {
        let width = item.width;
        let height = item.height;
        if (flip) {
            width = item.height;
            height = item.width;
        }

        if (Inventory.IsFree(x, y, width, height)) {
            console.log(Inventory.GetIndex(x, y));
            for (let i = x; i < x + width; i++) {
                for (let j = y; j < y + height; j++) {
                    Inventory.selector.children().eq(Inventory.GetIndex(i, j)).addClass('used');
                }
            }
            Inventory.selector.children().eq(Inventory.GetIndex(x, y)).addClass("item item" + width + "x" + height + " " + item.name);
        } else {
            // hinweis
            return false;
        }
    },

    IsFree: function(x, y, width, height) {
        //Vertikale überprüfung hinzufügen
        for (let i = x; i < x + width; i++)
            for (let j = y; j < y + height; j++)
                if (Inventory.selector.children().eq(Inventory.GetIndex(i, j)).hasClass('used'))
                    return false;
        return (x + width <= Inventory.width);
    },

    GetIndex: function(x, y) {
        return y * Inventory.width + x;
    },

    GetCoords: function(index) {
        let rowPos = Math.floor(index / Inventory.width);
        let colPos = index % Inventory.width;
        return {
            x: rowPos,
            y: colPos
        };
    }
};

$(function() {
    Inventory.Generate(122);
    Inventory.SetItem(item_pdw, 6, 0);
    Inventory.SetItem(item_parachute, 1, 2,false);
    // Wird nicht angezeigt. IsFree ist false
    Inventory.SetItem(item_hatchet, 3, 3, false);

    $(".slot").droppable({
        accept: ".item"
    });

    $(".item").draggable();
});

/* Aktuell nutze ich pseudo-elements um die Itembilder anzuzeigen.
 * Es wird etwas benötigt womit man pseudo-elements bearbeiten kann.
 * Ein möglicher Workaround wäre das variable hinzufügen von <style>-tags in den head:
 *      $('head').append('<style> .item4x2.combatpdw::before {background: url(...) no-repeat; } </style');
 *
 * Andere Möglichkeit wäre alles ins Stylesheet zu packen. Wäre dann aber "hardcoded" und
 * müsste bei neuen Items angepasst werden.
 *
 *
 */