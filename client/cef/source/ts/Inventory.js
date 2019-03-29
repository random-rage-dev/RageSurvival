var Item = /** @class */ (function () {
    function Item(name, width, height) {
        this.name = name;
        this.width = width;
        this.height = height;
    }
    return Item;
}());
var Inventory = /** @class */ (function () {
    function Inventory(element, slots) {
        this.element = element;
        this.slots = slots;
        this.slotsPerRow = this.element.css('grid-template-columns').split(' ').length;
        this.init();
    }
    Inventory.prototype.init = function () {
        for (var i = 0; i < this.slots; i++) {
            this.element.append('<div class="slot"></div>');
        }
    };
    Inventory.prototype.setItem = function (item, x, y, flip) {
        if (flip === void 0) { flip = false; }
        var width = item.width;
        var height = item.height;
        if (flip) {
            width = item.height;
            height = item.width;
        }
        if (this.isFree(x, y, width, height)) {
            for (var i = x; i < x + width; i++) {
                for (var j = y; j < y + height; j++) {
                    this.element.children().eq(this.getIndex(i, j)).addClass('used');
                }
            }
            var html = '<div class="item item' + width + 'x' + height + '">'
                + '<img class="item' + width + 'x' + height + '" src="../../source/img/' + item.name + '.png"' + (flip ? ' class="flipped"' : '') + '>'
                + '</div>';
            var element = this.element.children().eq(this.getIndex(x, y)).append($(html)
                .data('width', width)
                .data('height', height)
                .data('x', x)
                .data('y', y));
            return element ? element : false;
        }
        return false;
    };
    Inventory.prototype.addItem = function (item) {
        var width = item.width;
        var height = item.height;
        for (var i = 0; i < this.slots; i++) {
            var coords = this.getCoords(i);
            if (this.isFree(coords.x, coords.y, width, height)) {
                this.setItem(item, coords.x, coords.y);
                return {
                    x: coords.x,
                    y: coords.y
                };
            }
        }
        return false;
    };
    Inventory.prototype.fillSlot = function (x, y, width, height, dragged) {
        if (dragged === void 0) { dragged = false; }
        for (var i = x; i < x + width; i++)
            for (var j = y; j < y + height; j++)
                this.element.children().eq(this.getIndex(i, j)).addClass(dragged ? 'used-drag' : 'used');
    };
    Inventory.prototype.clearSlot = function (x, y, width, height, dragged) {
        if (dragged === void 0) { dragged = false; }
        for (var i = x; i < x + width; i++)
            for (var j = y; j < y + height; j++)
                this.element.children().eq(this.getIndex(i, j)).removeClass(dragged ? 'used-drag' : 'used');
    };
    Inventory.prototype.isFree = function (x, y, width, height) {
        for (var i = x; i < x + width; i++)
            for (var j = y; j < y + height; j++)
                if (this.element.children().eq(this.getIndex(i, j)).hasClass('used') || this.getIndex(i, j) >= this.slots)
                    return false;
        return (x + width <= this.slotsPerRow);
    };
    Inventory.prototype.getIndex = function (x, y) {
        return y * this.slotsPerRow + x;
    };
    Inventory.prototype.getCoords = function (index) {
        return {
            x: index % this.slotsPerRow,
            y: Math.floor(index / this.slotsPerRow)
        };
    };
    Inventory.GetOffset = function (originX, originY, x, y) {
        return {
            x: x - originX,
            y: y - originY
        };
    };
    return Inventory;
}());
