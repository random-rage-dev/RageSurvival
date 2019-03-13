"use strict";
let test_item = {
    name: "Pistol",
    img: "../../../../source/img/weapon_combatpdw.png",
    width: 3,
    height: 2
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
        let width = item.width
        let height = item.height;
        if (flip) {
            console.log("flip",flip);
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
        } else {
            // hinweis
        }
    },
    IsFree: function(x, y, width, height) {
        //Vertikale überprüfung hinzufügen
        for (let i = x; i < x + width; i++)
            for (let j = y; j < y + height; j++)
                if (Inventory.selector.children().eq(Inventory.GetIndex(i, j)).hasClass('used')) return false;
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
    Inventory.Generate(120);
    Inventory.SetItem(test_item, 7, 0);
    Inventory.SetItem(test_item, 1, 2,true);
    // Wird nicht angezeigt. IsFree ist false
    Inventory.SetItem(test_item, 2, 3);
});