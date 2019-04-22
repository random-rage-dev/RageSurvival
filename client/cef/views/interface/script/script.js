var isToggledInto = false;
var style = getComputedStyle(document.body);
const cell_size = parseInt(style.getPropertyValue('--cell_size').replace("px", ""));
const padding = parseInt(style.getPropertyValue('--padding').replace("px", ""));
var mouseDown = 0;
var shiftDown = 0;
var controlDown = 0;
document.body.onmousedown = function() {
	mouseDown = 1;
}
document.body.onmouseup = function() {
	mouseDown = 0;
}
$(window).keydown(function(e) {
	if (e.originalEvent.key == "Control") {
		controlDown = 1;
	}
	if (e.originalEvent.key == "Shift") {
		shiftDown = 1;
	}
});
$(window).keyup(function(e) {
	if (e.originalEvent.key == "Control") {
		controlDown = 0;
	}
	if (e.originalEvent.key == "Shift") {
		shiftDown = 0;
	}
});
var ItemStorageHandler = new class {
	constructor() {
		this._container = [];
	}
	register(id, source) {
		this._container[id] = {
			source: source,
			items: []
		}
	}
	moveItem(source, target) {
		console.log("moveItem", source, target)
		let sInv = this._container[source].source.inventory().map(function(item) {
			let rr = item;
			let width = (item.width) * cell_size;
			let height = (item.height) * cell_size;
			rr.flipped = false;
			if (item.scale != undefined) {
				if (width > item.scale.width) {
					rr.flipped = true;
				}
				if (height > item.scale.height) {
					rr.flipped = true;
				}
			}
			return rr;
		});;
		console.log("source Inv", sInv)
		let tInv = this._container[target].source.inventory().map(function(item) {
			let rr = item;
			let width = (item.width) * cell_size;
			let height = (item.height) * cell_size;
			rr.flipped = false;
			if (item.scale != undefined) {
				if (width > item.scale.width) {
					rr.flipped = true;
				}
				if (height > item.scale.height) {
					rr.flipped = true;
				}
			}
			return rr;
		});
		console.log("traget Inv", tInv)
		this._container[source].items = sInv;
		this._container[target].items = tInv;
		this.update(source, target);
	}
	update(source, target) {
		mp.trigger("Inventory:Transfer", JSON.stringify({
			id: source,
			items: this._container[source].items
		}), JSON.stringify({
			id: target,
			items: this._container[target].items
		}));
	}
}
var DragHandler = new class {
	constructor() {
		this._setup();
	}
	_setup() {
		var self = this;
		self._sampleItem = $("#dragitem")
		self._sampleShadow = $("#dragShadow")
		self._item_data = null;
		self._item_data_old = null;
		self._dragging = false;
		self._offset = {
			top: 0,
			left: 0
		}
		self._orientation = "normal";
		self._registeredTargets = [];
		self._lastTarget = null;
		self._originSource = null;
		self._dragSource = null;
		$(window).mousemove(function(event) {
			if (isToggledInto == false) return;
			window.requestAnimationFrame(function() {
				self.move(event);
			});
		});
		$(window).mouseup(function(event) {
			if (isToggledInto == false) return;
			self.mouseup(event)
		});
		$(window).on('contextmenu', function(event) {
			if (isToggledInto == false) return;
			event.preventDefault();
			console.log("context");
			self.flip(event);
		});
	}
	clear() {
		var self = this;
		self._dragging = false;
		$(self._sampleItem).css({
			'width': "0px",
			'height': "0px",
			'height': "0px",
			'top': "0px",
			'left': "0px",
			'opacity': 0
		});
		$(self._sampleItem).find("img").css({
			'width': "0px",
			'height': "0px",
			'top': "0px",
			'left': "0px",
			'opacity': 0
		});
		$(self._sampleShadow).css({
			'width': "0px",
			'height': "0px",
			'opacity': 0
		});
		$(self._sampleItem).removeClass("smooth");
	}
	refreshStorages() {
		let self = this;
		Object.keys(self._registeredTargets).forEach(function(key) {
			self._registeredTargets[key].source.render();
		});
	}
	flip(event) {
		let self = this;
		if (self._dragging == true) {
			let height = $(self._sampleItem).width();
			let width = $(self._sampleItem).height();
			$(self._sampleItem).css({
				'width': width + "px",
				'height': height + "px"
			});
			let width_cell = self._item_data.height;
			let height_cell = self._item_data.width;
			if (width_cell != height_cell) {
				self._item_data.height = height_cell;
				self._item_data.width = width_cell;
				let oLeft = self._offset.left;
				let oTop = self._offset.top;
				self._offset.top = oLeft;
				self._offset.left = oTop;
				if (self._defaultScale != undefined) {
					$(self._sampleItem).find("img").css({
						'width': self._defaultScale.width + "px",
						'height': self._defaultScale.height + "px"
					});
					let class_n = "";
					if (self._defaultScale != undefined) {
						if (width > self._defaultScale.width) {
							class_n = "flip drag";
						}
						if (height > self._defaultScale.height) {
							class_n = "flip vert drag";
						}
					}
					$(self._sampleItem).find("img").attr("class", class_n)
				}
			}
			self.move(event);
		}
	}
	move(event) {
		var self = this;
		if (self._dragging == true) {
			$("#debug_point").css({
				top: (event.clientY) + 'px',
				left: (event.clientX) + 'px',
				'opacity': 1
			});
			$(self._sampleItem).css({
				top: (event.clientY - self._offset.top) + 'px',
				left: (event.clientX - self._offset.left) + 'px',
				'opacity': 1
			});
			if ($(self._sampleItem).hasClass("smooth") == false) {
				$(self._sampleItem).addClass("smooth");
			}
			self.shadow(event);
			self.mouseenter(event);
			if (mouseDown <= 0) {
				self.mouseup(event);
			}
		}
	}
	mouseenter(event) {
		var self = this;
		if (self._dragging) {
			let isInArea = undefined;
			Object.keys(self._registeredTargets).forEach(function(key) {
				let bounds = $("#" + key).find(".grid")[0].getBoundingClientRect();
				if ((event.clientY >= bounds.top) && (event.clientY <= bounds.bottom)) {
					if ((event.clientX >= bounds.left) && (event.clientX <= bounds.right)) {
						isInArea = key;
					}
				}
			});
			if (isInArea != undefined) {
				if (self._registeredTargets[isInArea]) {
					self._lastTarget = self._registeredTargets[isInArea].source;
				}
			}
		}
	}
	mouseup(event) {
		var self = this;
		if (event.which != 1) return false;
		if (self._dragging) {
			if (self._lastTarget != undefined) {
				let slot = self._lastTarget.getSlotByAbsolute((event.clientY - self._offset.top), (event.clientX - self._offset.left))
				if (slot != undefined) {
					if (self._lastTarget.isFree({
							cell: $(slot).data("cell"),
							row: $(slot).data("row"),
							width: self._item_data.width,
							height: self._item_data.height
						}) == true) {
						let fullCount = self._item_data.item.amount;
						if ((controlDown == 0) && (shiftDown == 0)) {
							if (self._lastTarget.addItemBySlot($(slot).data("cell"), $(slot).data("row"), self._item_data.width, self._item_data.height, Object.assign(self._item_data, {
									scale: self._defaultScale
								})) == true) {
								ItemStorageHandler.moveItem(self._originSource._selector.prop("id"), self._lastTarget._selector.prop("id"))
								self.clear();
							} else {
								self.returnToOrigin();
							}
						} else if ((controlDown == 1) && (fullCount >= 2)) {
							let itemBackup = JSON.parse(JSON.stringify(self._item_data.item));
							let half = self._item_data.item.amount / 2;
							let toGive = Math.floor(half);
							let tempItemData = {
								cell: self._item_data.cell,
								height: self._item_data.height,
								item: itemBackup,
								row: self._item_data.row,
								scale: self._item_data.scale,
								width: self._item_data.width
							}
							tempItemData.item.id = "NEW";
							tempItemData.item.amount = toGive;
							if (self._lastTarget.addItemBySlot($(slot).data("cell"), $(slot).data("row"), self._item_data.width, self._item_data.height, Object.assign(tempItemData, {
									scale: self._defaultScale
								})) == true) {
								self._item_data.item.amount = fullCount - toGive;
								self.returnToOrigin();
								ItemStorageHandler.moveItem(self._originSource._selector.prop("id"), self._lastTarget._selector.prop("id"))
								self.clear();
							} else {
								self.returnToOrigin();
							}
						} else if ((shiftDown == 1) && (fullCount >= 2)) {
							let itemBackup = JSON.parse(JSON.stringify(self._item_data.item));
							let toGive = 1;
							let tempItemData = {
								cell: self._item_data.cell,
								height: self._item_data.height,
								item: itemBackup,
								row: self._item_data.row,
								scale: self._item_data.scale,
								width: self._item_data.width
							}
							tempItemData.item.id = "NEW";
							tempItemData.item.amount = toGive;
							if (self._lastTarget.addItemBySlot($(slot).data("cell"), $(slot).data("row"), self._item_data.width, self._item_data.height, Object.assign(tempItemData, {
									scale: self._defaultScale
								})) == true) {
								self._item_data.item.amount = fullCount - toGive;
								self.returnToOrigin();
								ItemStorageHandler.moveItem(self._originSource._selector.prop("id"), self._lastTarget._selector.prop("id"))
								self.clear();
							} else {
								self.returnToOrigin();
							}
						} else {
							self.returnToOrigin();
						}
					} else {
						/* Check amount transfer*/
						let targetItem = self._lastTarget.getItemInSlot($(slot).data("cell"), $(slot).data("row")).item;
						let tItem = targetItem.item;
						console.log(tItem.name, self._item_data.item.name);
						console.log(tItem.name == self._item_data.item.name);
						if (tItem.name == self._item_data.item.name) {
							console.log(tItem.amount, "<", tItem.max_stack, tItem.amount < tItem.max_stack);
							if (tItem.amount < tItem.max_stack) {
								let top = $(slot).offset().top;
								let left = $(slot).offset().left;
								let color = "rgba(0,0,150,0.2)";
								console.log("set colors");
								if (tItem.amount + self._item_data.item.amount <= tItem.max_stack) {
									color = "rgba(150,0,0,0.5)"
									console.log("smaller");
									self._lastTarget.editItem($(slot).data("cell"), $(slot).data("row"), {
										amount: tItem.amount + self._item_data.item.amount
									})
									self.clear();
									ItemStorageHandler.moveItem(self._originSource._selector.prop("id"), self._lastTarget._selector.prop("id"))
								} else if (tItem.amount + self._item_data.item.amount > tItem.max_stack) {
									color = "rgba(0,150,0,0.5)"
									console.log("bigger");
									let total = tItem.amount + self._item_data.item.amount;
									self._lastTarget.editItem($(slot).data("cell"), $(slot).data("row"), {
										amount: tItem.max_stack
									})
									self._item_data.item.amount = (total - tItem.max_stack);
									self.returnToOrigin();
									ItemStorageHandler.moveItem(self._originSource._selector.prop("id"), self._lastTarget._selector.prop("id"))
								} else {
									self.returnToOrigin();
								}
							} else {
								self.returnToOrigin();
							}
						}
					}
				} else {
					self.returnToOrigin();
				}
			} else {
				self.returnToOrigin();
			}
		}
	}
	returnToOrigin() {
		let self = this;
		if (self._originSource != undefined) {
			if (self._originSource.addItemBySlot(self._item_data_old.cell, self._item_data_old.row, self._item_data_old.width, self._item_data_old.height, Object.assign(self._item_data, {
					scale: self._defaultScale
				})) == true) {
				self.clear();
			}
		}
	}
	isDragging() {
		return (this._dragging || this._busy);
	}
	isDraggable(item) {
		if (!self._dragging) {
			return true;
		}
		return false;
	}
	deleteDropable(selector) {
		selector = selector.replace("#", "");
		console.log("deleteDropable", selector)
		if (this._registeredTargets[selector]) {
			console.log("dropable exists and is registered");
			this._registeredTargets[selector] = null;
			delete this._registeredTargets[selector];
		}
	}
	registerDropable(source, selector) {
		selector = selector.replace("#", "");
		if (!this._registeredTargets[selector]) {
			$("#" + selector).addClass("dropable")
			this._registeredTargets[selector] = {
				source: source
			};
		}
	}
	Handle(event, item, origin) {
		let self = this;
		console.log("receive Handle Job")
		let cursor = {
			top: event.clientY,
			left: event.clientX
		}
		let offset_top = cursor.top - $(item).offset().top;
		let offset_left = cursor.left - $(item).offset().left;
		if (self._dragging == false) {
			self._originSource = origin;
			self._offset.top = offset_top;
			self._offset.left = offset_left;
			let Item_data = $(item).data("item");
			self._defaultScale = $(item).find("img").data("default");
			self._item_data = Item_data;
			self._item_data_old = Item_data;
			let aClass = "";
			let width = (self._item_data.width) * cell_size;
			let height = (self._item_data.height) * cell_size;
			let old_width = width;
			let old_height = height;
			let class_n = "";
			$(self._sampleItem).css({
				'width': width + "px",
				'height': height + "px",
				'opacity': 0,
				'overflow:': 'hidden'
			});
			if (self._item_data.scale != undefined) {
				if (width > self._item_data.scale.width) {
					class_n = "flip drag";
					old_width = self._item_data.scale.width;
					old_height = self._item_data.scale.height;
				}
				if (height > self._item_data.scale.height) {
					class_n = "flip vert drag";
					old_width = self._item_data.scale.width;
					old_height = self._item_data.scale.height;
				}
			}
			$(self._sampleItem).css({
				top: (event.clientY - self._offset.top) + 'px',
				left: (event.clientX - self._offset.left) + 'px'
			});
			self._sampleItem.html(`<img style="opacity:0;" class="${aClass}" id="dragItemImage" src="${self._item_data.item.image}"></img>`);
			$($(self._sampleItem).find("img")).bind("load", function() {
				$(self._sampleItem).find("img").attr("class", class_n)
				$(self._sampleItem).find("img").css({
					'width': old_width + "px",
					'height': old_height + "px",
					'opacity': 1,
				});
				$(self._sampleItem).css({
					'opacity': 1
				});
			})
			self._dragging = true;
		}
	}
	shadow(event) {
		let self = this;
		if (self._lastTarget != undefined) {
			let slot = self._lastTarget.getSlotByAbsolute((event.clientY - self._offset.top), (event.clientX - self._offset.left))
			if (slot != undefined) {
				if (self._lastTarget.isFree({
						cell: $(slot).data("cell"),
						row: $(slot).data("row"),
						width: self._item_data.width,
						height: self._item_data.height
					}) == true) {
					let top = $(slot).offset().top;
					let left = $(slot).offset().left;
					$(self._sampleShadow).css({
						top: top + 'px',
						left: left + 'px',
						"background": "rgba(0,0,0,0.2)",
						'opacity': 1
					});
					$(self._sampleShadow).css({
						'width': self._item_data.width * cell_size + "px",
						'height': self._item_data.height * cell_size + "px"
					});
					console.log("slot", $(slot));
				} else {
					let targetItem = self._lastTarget.getItemInSlot($(slot).data("cell"), $(slot).data("row")).item;
					let tItem = targetItem.item;
					if (tItem.name == self._item_data.item.name) {
						if (tItem.amount < tItem.max_stack) {
							let top = $(slot).offset().top;
							let left = $(slot).offset().left;
							let color = "rgba(0,0,255,1)";
							if (tItem.amount + self._item_data.item.amount <= tItem.max_stack) {
								color = "rgba(0,150,0,0.3)"
							}
							if (tItem.amount + self._item_data.item.amount > tItem.max_stack) {
								color = "rgba(0,150,0,0.3)"
							}
							$(self._sampleShadow).css({
								top: top + 'px',
								left: left + 'px',
								"background": color,
								'opacity': 1
							});
							$(self._sampleShadow).css({
								'width': self._item_data.width * cell_size + "px",
								'height': self._item_data.height * cell_size + "px"
							});
						}
					} else {
						$(self._sampleShadow).css({
							'width': "0px",
							'height': "0px",
							'top': "0px",
							'left': "0px",
							'opacity': 0
						});
					}
					/**/
				}
			} else {
				$(self._sampleShadow).css({
					'width': "0px",
					'height': "0px",
					'top': "0px",
					'left': "0px",
					'opacity': 0
				});
			}
		}
	}
}
var Storage = class {
	constructor(selector, options) {
		let self = this;
		this._rawSelector = selector;
		this._selector = $(selector);
		if (typeof options == "object") {
			self._top = options.top || 0;
			self._left = options.left || 0;
		}
		this._rows = $(selector).data("rows");
		this._cells = $(selector).data("cells");
		this._inventory = [];
		this._oldInventory = [];
		this.fill();
		this.render();
		DragHandler.registerDropable(this, this._rawSelector)
		ItemStorageHandler.register(selector.replace("#", ""), self);
		/*Drag Events*/
		self._repos_offset = {
			top: 0,
			left: 0
		}
		$(selector).on('mousedown', ".headline", function(event) {
			if (isToggledInto == false) return;
			let cursor = {
				top: event.clientY,
				left: event.clientX
			}
			let offset_top = cursor.top - $(event.currentTarget).offset().top;
			let offset_left = cursor.left - $(event.currentTarget).offset().left;
			self._repos_offset.top = offset_top;
			self._repos_offset.left = offset_left;
			$(document).find(".storage").each(function(t, e) {
				$(e).css({
					"z-index": 0
				})
			})
			$(self._selector).css({
				"z-index": 15
			})
			self.dragStorage();
		});
		$(selector).on('mousedown', ".item, img", function(event) {
			if (isToggledInto == false) return;
			event.preventDefault();
			let cTarget = event.currentTarget;
			if ($(event.currentTarget).hasClass("item") == false) {
				cTarget = $(event.currentTarget).parents(".item")[0];
			}
			if (cTarget) {
				let lEvent = function(event) {
					if (DragHandler.isDraggable(cTarget) == true) {
						let data = $(cTarget).data("item");
						DragHandler.Handle(event, cTarget, self);
						self.removeItemBySlot(data.cell, data.row);
						self.render()
						$(window).unbind("mousemove", lEvent)
					}
				}
				$(window).mousemove(lEvent);
			}
		});
	}
	clear() {
		this._inventory = [];
	}
	remove() {
		$(this._selector).remove();
		console.log("REMOVE");
		DragHandler.deleteDropable(this._rawSelector)
	}
	moveWindow(top, left) {
		let self = this;
		self._top = top;
		self.left = left;
		self._selector.css({
			'top': self._top + "px",
			'left': self.left + "px"
		})
	}
	dragStorage() {
		let self = this;
		let lEvent = function(event) {
			window.requestAnimationFrame(function() {
				self._top = (event.clientY - self._repos_offset.top);
				self.left = (event.clientX - self._repos_offset.left)
				self._selector.css({
					'top': self._top + "px",
					'left': self.left + "px"
				})
				if (self._selector.attr("id") == "inventory") {
					mp.trigger("Inventory:Drag", JSON.stringify({
						'top': self._top,
						'left': self.left
					}));
				}
				if (mouseDown <= 0) {
					$(window).unbind("mousemove", lEvent)
				};
			});
		}
		$(window).mousemove(lEvent);
	}
	get slots() {
		return this._rows * this._cells;
	}
	inventory() {
		return this._inventory;
	}
	editItem(gCell, gRow, new_item_data) {
		let self = this;
		let slot = self.getItemInSlot(gCell, gRow);
		if (slot.index > -1) {
			console.log("INVENTORY EDIT ITEM");
			console.log(JSON.stringify(self._inventory[slot.index]));
			console.log("NEW", JSON.stringify(new_item_data));
			let itemRef = this._inventory[slot.index];
			let nItem = Object.assign(itemRef.item, new_item_data)
			itemRef.item = nItem;
			console.log("itemRef.item", itemRef);
			this._inventory.splice(slot.index, 1);
			this._inventory.push({
				cell: itemRef.cell,
				row: itemRef.row,
				width: itemRef.width,
				height: itemRef.height,
				item: itemRef.item,
				scale: itemRef.scale
			})
			console.log(this._inventory);
			console.log("INVENTORY RENDER");
			self.render();
		}
	}
	fill() {
		this._selector.find(".grid").html("");
		let width = (this._cells * cell_size) + (padding * 2);
		let height = (this._rows * cell_size) + (padding * 2);
		this._selector.width(width);
		for (var row = 0; row < this._rows; row++) {
			for (var cell = 0; cell < this._cells; cell++) {
				this._selector.find(".grid").append("<div class='cell' data-cell='" + cell + "' data-row='" + row + "' ></div>")
			}
		}
	}
	getSlot(cell, row) {
		return $(this._selector.find(".grid")).find(`.cell[data-row='${row}'][data-cell='${cell}']`)
	}
	getSlotByAbsolute(top, left) {
		let cells = $(this._selector.find(".grid")).find('.cell').toArray();
		let cell = cells.find(function(slot) {
			let offset = $(slot).offset();
			let wh = {
				width: $(slot).width(),
				height: $(slot).height()
			};
			if ((top >= offset.top) && (top <= (offset.top + wh.height))) {
				if ((left >= offset.left) && (left <= (offset.left + wh.width))) {
					return true;
				}
			}
			return false;
		});
		return cell;
	}
	getAbsoluteBySlot(gCell, gRow) {
		let slot = $(this._selector.find(".grid")).find(`.cell[data-row='${gRow}'][data-cell='${gCell}']`);
		if (slot != undefined) {
			if ($(slot).length) {
				return {
					top: $(slot)[0].offsetTop,
					left: $(slot)[0].offsetLeft
				}
			}
		}
		return false;
	}
	getItemInSlot(gCell, gRow) {
		let slot = $(this._selector.find(".grid")).find(`.cell[data-row='${gRow}'][data-cell='${gCell}']`);
		if (slot != undefined) {
			let item = this._inventory.findIndex(function(cell_data) {
				for (var row = cell_data.row; row < (cell_data.row + cell_data.height); row++) {
					for (var cell = cell_data.cell; cell < (cell_data.cell + cell_data.width); cell++) {
						if ((cell == gCell) && (row == gRow)) {
							return true;
						}
					}
				}
				return false;
			})
			if (this._inventory[item] != undefined) {
				return {
					index: item,
					item: this._inventory[item]
				};
			}
		}
		return false;
	}
	getNextFreeSlot(width, height) {
		let nextSlot = undefined;
		for (var row = 0; row < this._rows; row++) {
			for (var cell = 0; cell < this._cells; cell++) {
				if (nextSlot == undefined) {
					if (this.isFree({
							cell: cell,
							row: row,
							width: width,
							height: height
						}) == true) {
						nextSlot = {
							cell: cell,
							row: row,
							width: width,
							height: height,
							flipped: false
						}
					} else if (this.isFree({
							cell: cell,
							row: row,
							width: height,
							height: width
						}) == true) {
						nextSlot = {
							cell: cell,
							row: row,
							width: height,
							height: width,
							flipped: true
						}
					}
				}
			}
		}
		if (nextSlot != undefined) {
			let sSlot = this.getSlot(nextSlot.cell, nextSlot.row);
			console.log("nextSlot", nextSlot);
		}
		return nextSlot
	}
	isFree(gCell, gRow) {
		let self = this;
		if (typeof gCell == "object") {
			let iData = gCell;
			let Free = true;
			for (var row = iData.row; row < (iData.row + iData.height); row++) {
				for (var cell = iData.cell; cell < (iData.cell + iData.width); cell++) {
					if (this.isFree(cell, row) == false) {
						Free = false;
					}
					if (cell >= self._cells) {
						Free = false;
					}
				}
				if (row >= self._rows) {
					Free = false;
				}
			}
			return Free;
		} else {
			let occupied = this._inventory.findIndex(function(cell_data) {
				for (var row = cell_data.row; row < (cell_data.row + cell_data.height); row++) {
					for (var cell = cell_data.cell; cell < (cell_data.cell + cell_data.width); cell++) {
						if ((cell == gCell) && (row == gRow)) {
							return true;
						}
					}
				}
				return false;
			})
			if (occupied == -1) {
				return true;
			} else {
				return false;
			}
		}
	}
	addItemBySlot(gCell, gRow, gWidth, gHeight, data, flipped = false) {
		console.log("addItemBySlot", gCell, gRow, gWidth, gHeight, data, flipped);
		console.log("typeof data", typeof data);
		if (typeof data == "string") {
			data = JSON.parse(data);
		}
		console.log(data);
		if (flipped == true) {
			data.scale = {};
			data.scale.width = gHeight * cell_size;
			data.scale.height = gWidth * cell_size;
		}
		if (this.isFree({
				cell: gCell,
				row: gRow,
				width: gWidth,
				height: gHeight
			}) == true) {
			let scale = undefined;
			if (data.scale) {
				scale = data.scale;
				data.scale = undefined;
			}
			if (data.item) {
				data = data.item;
			}
			console.log("addItembySlot", data);
			this._inventory.push({
				cell: gCell,
				row: gRow,
				width: gWidth,
				height: gHeight,
				item: data,
				scale: scale
			})
			this.render()
			return true;
		} else {
			return false;
		}
	}
	removeItemBySlot(gCell, gRow) {
		let itemIndex = this._inventory.findIndex(function(cell_data) {
			for (var row = cell_data.row; row < (cell_data.row + cell_data.height); row++) {
				for (var cell = cell_data.cell; cell < (cell_data.cell + cell_data.width); cell++) {
					if ((cell == gCell) && (row == gRow)) {
						return true;
					}
				}
			}
			return false;
		})
		if (itemIndex > -1) {
			let data = this._inventory[itemIndex];
			this._inventory.splice(itemIndex, 1)
			this.fill();
			return data;
		}
		return false;
	}
	render() {
		let self = this;
		self._selector.css({
			'top': self._top + "px",
			'left': self.left + "px"
		})
		console.log("self._inventory", self._inventory);
		console.log("self._oldInventory", self._oldInventory);
		let cells = $(this._selector.find(".grid")).find('.cell').toArray();
		let toRemove = self._oldInventory.filter(function(item) {
			let iIndex = self._inventory.findIndex(function(d) {
				return (d.cell == item.cell) && (d.row == item.row) && (d.width == item.width) && (d.height == item.height) && (d.item.amount == item.item.amount);
			})
			return iIndex == -1;
		})
		let toAdd = self._inventory.filter(function(item) {
			let iIndex = self._oldInventory.findIndex(function(d) {
				return (d.cell == item.cell) && (d.row == item.row) && (d.width == item.width) && (d.height == item.height) && (d.item.amount == item.item.amount);
			})
			return iIndex == -1 && self._inventory[iIndex] == undefined;
		})
		console.log("toRemove", toRemove);
		console.log("toAdd", toAdd);
		toRemove.forEach(function(item) {
			let remove = self._selector.find(".items").find(`.item[data-cell='${item.cell}'][data-row='${item.row}']`);
			if (remove != undefined) {
				$(remove).remove()
			}
		})
		toAdd.forEach(function(item) {
			let abs = self.getAbsoluteBySlot(item.cell, item.row);
			let a = $(`<div data-cell=${item.cell} data-row=${item.row} data-item='${JSON.stringify(item)}' class='item' style='top:${abs.top}px;left:${abs.left}px'></div>`);
			let width = (item.width) * cell_size;
			let height = (item.height) * cell_size;
			let img = item.item.image
			let old_width = width;
			let old_height = height;
			let class_n = "";
			if (item.scale != undefined) {
				if (width > item.scale.width) {
					class_n = "flip";
					old_width = item.scale.width;
					old_height = item.scale.height;
				}
				if (height > item.scale.height) {
					class_n = "flip vert";
					old_width = item.scale.width;
					old_height = item.scale.height;
				}
			}
			console.log("AMOUNT", item.item.amount);
			$(a).html(`<div class='amount'>${item.item.amount}</div><img class="${class_n}" data-default=${JSON.stringify({width:old_width,height:old_height})} src="${img}"></img>`)
			a.height(height)
			a.width(width)
			let x = self._selector.find(".items").append(a);
			$($(a).find("img")).bind("load", function() {
				$(a).addClass("loaded");
				let w = $(a).find("img").width();
				let h = $(a).find("img").height();
				if ((w <= old_width) && (h <= old_height)) {
					let padding_w = (width - w);
					let padding_h = (height - h);
					$(a).find("img").css({
						'max-width': old_width + "px",
						'max-height': old_height + "px",
						'top': (padding_h / 2) + "px",
						'left': (padding_w / 2) + "px"
					});
				} else {
					$(a).find("img").css({
						'max-width': old_width + "px",
						'max-height': old_height + "px",
						'width': width + "px",
						'height': height + "px"
					});
				}
			})
		})
		this._oldInventory = JSON.parse(JSON.stringify(this._inventory));
	};
}
var nonStandartContainer = [];
var storageContainers = [];

function show() {
	$("body").css({
		"opacity": "1"
	});
	DragHandler.refreshStorages();
	isToggledInto = true;
}

function hide() {
	$("body").css({
		"opacity": "0"
	});
	isToggledInto = false;
	Object.keys(nonStandartContainer).forEach(function(id) {
		if (nonStandartContainer[id]) {
			nonStandartContainer[id].remove();
			nonStandartContainer[id] = undefined;
			delete nonStandartContainer[id];
		}
	})
}

function setPos(container, top, left) {
	if (storageContainers["#" + container]) {
		storageContainers["#" + container].moveWindow(top, left);
	};
}

function clear(container) {
	if (storageContainers["#" + container]) {
		let Unit = storageContainers["#" + container];
		Unit.clear();
	}
}

function addItem(container, gCell, gRow, gWidth, gHeight, gData, flipped = false) {
	if (storageContainers["#" + container]) {
		let Unit = storageContainers["#" + container];
		if (Unit.isFree({
				cell: gCell,
				row: gRow,
				width: gWidth,
				height: gHeight
			})) {
			Unit.addItemBySlot(gCell, gRow, gWidth, gHeight, gData, flipped)
		} else {
			let getFree = Unit.getNextFreeSlot(gWidth, gHeight);
			if (getFree != undefined) {
				Unit.addItemBySlot(getFree.cell, getFree.row, getFree.width, getFree.height, gData, getFree.flipped)
			}
		}
	}
}

function initialize(config) {
	console.log("config", config)
	var Inventory = new Storage("#inventory", {
		top: config["inventory"].top || 0,
		left: config["inventory"].left || 0,
	});
	storageContainers["#inventory"] = Inventory;
	/*Inventory.addItemBySlot(0, 0, 4, 2, {
		name: "CompactRifle",
		image: "../../source/img/weapon_compactrifle.png"
	})
	Inventory.addItemBySlot(6, 0, 4, 2, {
		name: "CompactRifle",
		image: "../../source/img/weapon_compactrifle.png"
	})
	let next_slot = Inventory.getNextFreeSlot(4, 2)
	Inventory.addItemBySlot(next_slot.cell, next_slot.row, next_slot.width, next_slot.height, {
		name: "CompactRifle",
		image: "../../source/img/weapon_compactrifle.png"
	}, next_slot.flipped)*/
	show();
}

function addStorageContainer(headline, selector, config, cells, rows, items) {
	console.log($("#" + selector).length)
	if ($("#" + selector).length == 0) {
		let container = `<div id="${selector}" class="storage" data-cells="${cells}" data-rows="${rows}" style="display: block;">
						    <div class="headline">${headline}</div>
						    <div class="grid"></div>
						    <div class="items">
						    </div>
						</div>`
		$(container).appendTo(document.body);
		var StorageUnit = new Storage("#" + selector, {
			top: config.top || 0,
			left: config.left || 0,
		});
		storageContainers["#" + selector] = StorageUnit;
		nonStandartContainer["#" + selector] = StorageUnit;
		items.forEach(function(item) {
			console.log("Item to add", item);
			let gCell = item.cell;
			let gRow = item.row;
			let gWidth = item.width;
			let gHeight = item.height;
			let gData = item.item;
			if (StorageUnit.isFree({
					cell: gCell,
					row: gRow,
					width: gWidth,
					height: gHeight
				})) {
				StorageUnit.addItemBySlot(gCell, gRow, gWidth, gHeight, gData)
			} else {
				let getFree = StorageUnit.getNextFreeSlot(gWidth, gHeight);
				if (getFree != undefined) {
					StorageUnit.addItemBySlot(getFree.cell, getFree.row, getFree.width, getFree.height, gData, getFree.flipped)
				}
			}
		})
	}
}
rpc.register('isBusy', function() {
	return mouseDown == 1;
});
rpc.register('doesFitInto', function(options) {
	if (storageContainers["#" + options.what]) {
		return storageContainers["#" + options.what].getNextFreeSlot(options.w, options.h)
	}
	return undefined;
});
$(document).ready(function(event) {
	mp.trigger("Inventory:Ready");
});