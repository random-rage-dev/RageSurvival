let item_pdw = new Item("combatpdw", 4, 2);
let item_parachute = new Item("parachute", 2, 3);
let item_hatchet = new Item("hatchet", 2, 4);

let inventory = new Inventory($('#inventory'), 122);


let offset = { x: 0, y: 0 };
function ItemDropEvent(event, ui) {
    ui.helper.data('dropped', true);

    let target = $(event.target);

    let index = inventory.element.children().index(target);
    let coords = inventory.getCoords(index);
    index = inventory.getIndex(coords.x - offset.x, coords.y - offset.y);
    coords = inventory.getCoords(index);

    let width = ui.draggable.data('width');
    let height = ui.draggable.data('height');

    ui.draggable.css({
        left: 0,
        top: 0
    });

    if(coords.x + width > inventory.slotsPerRow || coords.x < 0 || coords.y < 0 || !inventory.isFree(coords.x - offset.x, coords.y - offset.y, width, height)) {
        console.log(event.target);
        return;
    }

    console.log(coords.x);

    ui.draggable.detach().appendTo("#inventory > div:nth-child(" + (index+1) + ")");

    $(ui.draggable).find('img').css({
        left: 0,
        top: 0
    });

    inventory.clearSlot(ui.draggable.data('x'), ui.draggable.data('y'), width, height);

    ui.draggable.data('x', coords.x);
    ui.draggable.data('y', coords.y);

    inventory.fillSlot(coords.x, coords.y, width, height);
}

function ItemEquipEvent(event, ui) {
    ui.draggable.detach().appendTo($(event.target));

    inventory.clearSlot($(ui.draggable).data('x'), $(ui.draggable).data('y'), $(ui.draggable).data('width'), $(ui.draggable).data('height'));

    let styleImg = {};
    switch($(ui.draggable).data('name')) {
        case 'combatpdw':
            styleImg = {
                width: '120%',
                height: 'auto',
                top: 40,
                left: -5,
                'transform': 'rotate(-45deg)'
            };
            break;
        case 'parachute':
            styleImg = {
                width: 'auto',
                height: '95%',
                top: 5,
                left: 15
            };
            break;
        case 'hatchet':
            styleImg = {
                width: 'auto',
                height: '100%',
                top: 0,
                left: 40,
                'transform': 'rotate(45deg)'
            };
            break;
    }

    $(ui.draggable).find('img').css(styleImg);
    $(event.target).find('p').hide();
}

$(function() {
    inventory.addItem(item_pdw);
    inventory.addItem(item_parachute);
    // Wird nicht angezeigt. IsFree ist false
    inventory.addItem(item_hatchet);

    let lastCoords = null;
    let width, height;

    let first = true;

    $(".item").draggable({
        start: function(event, ui) {
            ui.helper.data('dropped', false);
            width = $(event.target).data('width');
            height = $(event.target).data('height');

            $(event.target).css({
                pointerEvents: 'none'
            });

            let lastSlot = -1;
            lastCoords = {
                x: $(event.target).data('x'),
                y: $(event.target).data('y')
            };

            inventory.clearSlot(lastCoords.x - offset.x, lastCoords.y - offset.y, width, height);

            $('.slot').mousemove(function(e) {
                let index = inventory.element.children().index($(e.target));
                if(first) {
                    let offsetCoords = inventory.getCoords(index);
                    offset = Inventory.GetOffset(lastCoords.x, lastCoords.y, offsetCoords.x, offsetCoords.y);
                    first = false;
                }
                if(index === lastSlot)
                    return;

                inventory.clearSlot(lastCoords.x - offset.x, lastCoords.y - offset.y, width, height, true);
                let coords = inventory.getCoords(index);
                if(!inventory.isFree(coords.x - offset.x, coords.y - offset.y, width, height)) {
                    return;
                }


                inventory.fillSlot(
                    coords.x - offset.x,
                    coords.y - offset.y,
                    width,
                    height,
                    true
                );


                lastCoords = coords;
            });
        },
        stop: function(event, ui) {
            first = true;

            // if dropped outside of inventory
            if(!ui.helper.data('dropped')) {
                inventory.clearSlot(lastCoords.x - offset.x, lastCoords.y - offset.y, width, height, true);
                $(this).css({top: 0, left: 0});
                // drop item, etc...
            }

            console.log($(event.target).parent().hasClass('slot'));
            if($(event.target).parent().hasClass('slot'))
                $(this).find('img').css({'transform': 'rotate(0)'});

            $('.item').css('pointer-events', 'all');

            // unbind the mousemove event
            $('.slot').unbind();
            offset = { x: 0, y: 0 };
        }
    });

    $(".slot").droppable({
        accept: '.item',
        tolerance: 'pointer',
        activeClass: 'droppable-highlight',
        drop: ItemDropEvent,
    });

    $(".equip-slot").droppable({
        accept: '.item',
        tolerance: 'pointer',
        activeClass: 'droppable-highlight',
        drop: ItemEquipEvent,
    });

    $('.quickslot').droppable({
        accept: '.item',
        tolerance: 'pointer',
        activeClass: 'droppable-highlight',
        drop: ItemEquipEvent
    });



    $(".slot").click(function() {
        let index = inventory.element.children().index($(this));
        console.log(index);
        let coords = inventory.getCoords(index);
        console.log(coords.x + ":" + coords.y);
        console.log(inventory.getIndex(coords.x, coords.y));
    });
});

/*
 * RESISTANCE
 */

enum Resistances {
    HEAT,
    COLD,
    IMPACT,
    SLASH,
    PUNCTURE,
    ELECTRICITY,
    RADIATION
}

class Resistance {
    static set(resistance: Resistances, value: number) {
        $('[data-resistance="' + resistance + '"]').find('p').text(value);
    }

    static get(resistance: Resistances) {
        return $('[data-resistance="' + resistance + '"]').find('p').text();
    }
}

function ui_toggle(show) {
    let selector = $('#user-interface');
    show ? selector.show() : selector.hide();
}


// EXAMPLES
Resistance.set(Resistances.HEAT, 0);
Resistance.set(Resistances.COLD, 0);
Resistance.set(Resistances.IMPACT, 0);
Resistance.set(Resistances.SLASH, 0);
Resistance.set(Resistances.PUNCTURE, 0);
Resistance.set(Resistances.ELECTRICITY, 0);
Resistance.set(Resistances.RADIATION, 0);

function addItem(item) {
    inventory.addItem(item);
}


