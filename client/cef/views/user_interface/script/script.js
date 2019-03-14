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
    slots: null,

    Generate: function(slots) {
        for (let i = 0; i < slots; i++) {
            Inventory.selector.append('<div class="slot"></div>');
        }
        Inventory.slots = slots;
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
            for (let i = x; i < x + width; i++) {
                for (let j = y; j < y + height; j++) {
                    Inventory.selector.children().eq(Inventory.GetIndex(i, j)).addClass('used');
                }
            }
            Inventory.selector.children().eq(Inventory.GetIndex(x, y)).append($('<img>',{
                src: '../../source/img/' + item.name + '.png',
                class: 'item item' + width + 'x' + height
                })
                .data('width', width)
                .data('height', height)
                .data('x', x)
                .data('y', y));
        } else {
            // hinweis
            return false;
        }
    },

    FillSlot: function(x, y, width, height) {
        for (let i = x; i < x + width; i++)
            for (let j = y; j < y + height; j++)
                Inventory.selector.children().eq(Inventory.GetIndex(i, j)).addClass('used');
    },

    ClearSlot: function(x, y, width, height) {
        for (let i = x; i < x + width; i++)
            for (let j = y; j < y + height; j++)
                Inventory.selector.children().eq(Inventory.GetIndex(i, j)).removeClass('used');
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
            x: colPos,
            y: rowPos
        };
    }
};

function ItemDropEvent(event, ui) {
    ui.helper.data('dropped', true);

    let target = $(event.target);

    let index = Inventory.selector.children().index(target);
    let coords = Inventory.GetCoords(index);

    let width = ui.draggable.data('width');
    let height = ui.draggable.data('height');

    ui.draggable.css({
        left: 0,
        top: 0
    });

    if(coords.x + width > Inventory.width || coords.x < 0 || coords.y < 0) {
        console.log(event.target);
        return;
    }

    console.log(coords.x);

    ui.draggable.detach().appendTo(target);

    Inventory.ClearSlot(ui.draggable.data('x'), ui.draggable.data('y'), width, height);

    ui.draggable.data('x', coords.x);
    ui.draggable.data('y', coords.y);

    Inventory.FillSlot(coords.x, coords.y, width, height);
}

function ItemDragEvent(event, ui) {

}

$(function() {
    Inventory.Generate(122);
    Inventory.SetItem(item_pdw, 6, 0);
    Inventory.SetItem(item_parachute, 1, 2,false);
    // Wird nicht angezeigt. IsFree ist false
    Inventory.SetItem(item_hatchet, 3, 3, false);

    $(".item").draggable({
        start: function(event, ui) {
            ui.helper.data('dropped', false);
        },
        stop: function(event, ui) {
            if(!ui.helper.data('dropped')) {

            }
        }
    });

    $(".slot").droppable({
        accept: '.item',
        drop: ItemDropEvent,
    });

    $(".slot").click(function() {
        let index = Inventory.selector.children().index($(this));
        console.log(index);
        let coords = Inventory.GetCoords(index);
        console.log(coords.x + ":" + coords.y);
        console.log(Inventory.GetIndex(coords.x, coords.y));
    });
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