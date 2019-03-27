class Item {
    name: string;
    width: number;
    height: number;
    constructor(name: string, width: number, height: number) {
        this.name = name;
        this.width = width;
        this.height = height;
    }
}

class Inventory {
    readonly element: JQuery;
    private readonly slots: number;
    readonly slotsPerRow: number;

    constructor (element: JQuery, slots: number) {
        this.element = element;
        this.slots = slots;
        this.slotsPerRow = this.element.css('grid-template-columns').split(' ').length;

        this.init();
    }

    private init() {
        for(let i = 0; i < this.slots; i++) {
            this.element.append('<div class="slot"></div>');
        }
    }

    setItem(item: Item, x: number, y: number, flip=false): JQuery | boolean {
        let width: number = item.width;
        let height: number = item.height;

        if(flip) {
            width = item.height;
            height = item.width;
        }

        if(this.isFree(x, y, width, height)) {
            for (let i = x; i < x + width; i++) {
                for (let j = y; j < y + height; j++) {
                    this.element.children().eq(this.getIndex(i, j)).addClass('used');
                }
            }

            let html = '<div class="item item' + width + 'x' + height + '">'
                + '<img class="item' + width + 'x' + height + '" src="../../source/img/' + item.name + '.png"' + (flip ? ' class="flipped"' : '') + '>'
                + '</div>';

            let element = this.element.children().eq(this.getIndex(x, y)).append($(html)
                .data('width', width)
                .data('height', height)
                .data('x', x)
                .data('y', y));

            return element ? element : false;
        }
        return false;
    }

    addItem(item: Item): Vector2D | boolean {
        let width: number = item.width;
        let height: number = item.height;

        for(let i = 0; i < this.slots; i++) {
            let coords = this.getCoords(i);
            if(this.isFree(coords.x, coords.y, width, height)) {
                this.setItem(item, coords.x, coords.y);
                return {
                    x: coords.x,
                    y: coords.y
                };
            }
        }
        return false;
    }

    fillSlot(x: number, y: number, width: number, height: number, dragged=false) {
        for (let i = x; i < x + width; i++)
            for (let j = y; j < y + height; j++)
                this.element.children().eq(this.getIndex(i, j)).addClass(dragged ? 'used-drag' : 'used');
    }

    clearSlot(x: number, y: number, width: number, height: number, dragged=false) {
        for (let i = x; i < x + width; i++)
            for (let j = y; j < y + height; j++)
                this.element.children().eq(this.getIndex(i, j)).removeClass(dragged ? 'used-drag' : 'used');
    }

    isFree(x: number, y: number, width: number, height: number) {
        for (let i = x; i < x + width; i++)
            for (let j = y; j < y + height; j++)
                if (this.element.children().eq(this.getIndex(i, j)).hasClass('used') || this.getIndex(i, j) >= this.slots)
                    return false;
        return (x + width <= this.slotsPerRow);
    }

    getIndex(x: number, y: number): number {
        return y * this.slotsPerRow + x;
    }

    getCoords(index: number): Vector2D {
        return {
            x: index % this.slotsPerRow,
            y: Math.floor(index / this.slotsPerRow)
        }
    }

    static GetOffset(originX: number, originY: number, x: number, y: number): Vector2D {
        return {
            x: x - originX,
            y: y - originY
        };
    }
}

interface Vector2D {
    x: number;
    y: number;
}

interface Vector3D extends Vector2D {
    z: number;
}