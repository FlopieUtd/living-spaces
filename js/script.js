// Closest polyfill

if (!Element.prototype.matches)
    Element.prototype.matches = Element.prototype.msMatchesSelector || 
                                Element.prototype.webkitMatchesSelector;

if (!Element.prototype.closest)
    Element.prototype.closest = function(s) {
        var el = this;
        if (!document.documentElement.contains(el)) return null;
        do {
            if (el.matches(s)) return el;
            el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1); 
        return null;
    };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// Variables

var settings = {
	itemWidth: 260,
	gutterSize: 24,
	maxItemHeight: 0,
	maxColumns: 0, // 0 is unlimited
	itemAmount: 43,
	imagePath: 'interiors'
};

var state = {
	screenWidth: 0,
	breakpoints: [],
	adjacentBreakpoints: {
		previous: 0,
		next: 0
	},
	columnAmount: 0,
	columnHeights: [],
	items: [],
	bodyHeight: 0,
	itemsReady: 0

	// DOM caching

};var body = document.querySelector('body');
var header = document.querySelector('.header');
var grid = document.querySelector('.grid');
var fullSizeContainer = document.querySelector('.full-size');
var fullSizeClose = document.querySelector('.full-size__close');
var fullSizeImage = document.querySelector('.full-size-image');
var gridLoader = document.querySelector('.grid-loader');
var fullSizeLoader = document.querySelector('.full-size-loader');

// Functions

function getScreenWidth() {
	return window.innerWidth;
}

function setBodyHeight() {
	state.bodyHeight = Math.max.apply(Math, _toConsumableArray(state.columnHeights));
	body.style.height = state.bodyHeight + 'px';
}

function setColumnAmount() {
	return Math.floor((state.screenWidth - 20) / settings.itemWidth);
}

function initiateColumnHeights() {
	for (i = 0; i < state.columnAmount; i++) {
		state.columnHeights.push(0);
	}
}

function getBreakpoints() {
	for (i = 1; i < (settings.maxColumns == 0 ? 20 : settings.maxColumns); i++) {
		var breakpoint = i * settings.itemWidth + 20;
		state.breakpoints.push(breakpoint);
	}
}

function getAdjacentBreakpoints(currentScreenWidth, breakpoints) {

	function getClosestDown(test, array) {
		var num = result = 0;
		for (var _i = 0; _i < array.length; _i++) {
			num = array[_i];
			if (num <= test) {
				result = num;
			}
		}
		return result;
	}

	function getClosestUp(test, array) {
		var num = result = 0;
		for (var _i2 = array.length; _i2 > 0; _i2--) {
			num = array[_i2];
			if (num >= test) {
				result = num;
			}
		}
		return result;
	}

	state.adjacentBreakpoints.previous = getClosestDown(currentScreenWidth, breakpoints);
	state.adjacentBreakpoints.next = getClosestUp(currentScreenWidth, breakpoints);
}

function setGridWidth() {
	grid.style.width = state.columnAmount * settings.itemWidth + 'px';
	header.style.width = state.columnAmount * settings.itemWidth + 'px';
}

function setMaxItemHeight() {
	settings.maxItemHeight = settings.itemWidth * 2;
}

function reset() {
	state.columnHeights = [];
	initiateColumnHeights();
	getAdjacentBreakpoints(state.screenWidth, state.breakpoints);
}

function init() {
	state.screenWidth = getScreenWidth();
	state.columnAmount = setColumnAmount();
	getBreakpoints();
	getAdjacentBreakpoints(state.screenWidth, state.breakpoints);
	initiateColumnHeights();
	setGridWidth();
	setMaxItemHeight();
	renderItems(settings.itemAmount);
	gridLoader.style.display = 'none';
}

function renderItems(itemAmount) {
	var _loop = function _loop(_i3) {

		var currentImage = {};
		var image = new Image();
		image.src = './images/items/' + settings.imagePath + '/thumb/' + _i3 + '.jpg';
		state.items.push({
			id: _i3
		});

		image.onload = function () {

			// Load image, get dimensions

			currentImage.height = image.height;
			currentImage.width = image.width;
			Math.round(settings.itemWidth / image.width * image.height) > settings.maxItemHeight ? currentImage.relativeHeight = settings.maxItemHeight : currentImage.relativeHeight = Math.round(settings.itemWidth / image.width * image.height);

			// Create wrapper

			var wrapper = document.createElement('div');
			wrapper.classList.add('item__wrapper');
			wrapper.style.height = currentImage.relativeHeight + 'px';

			// Create item

			var itemElement = document.createElement('div');
			itemElement.classList.add('item');
			itemElement.style.width = settings.itemWidth + 'px';
			itemElement.style.padding = '0 ' + settings.gutterSize / 2 + 'px ' + settings.gutterSize + 'px';
			itemElement.style.opacity = 1;
			itemElement.dataset.id = _i3;
			itemElement.addEventListener('click', openFullSize);

			// Nest and append to DOM

			wrapper.appendChild(image);
			itemElement.appendChild(wrapper);
			grid.appendChild(itemElement);

			state.itemsReady++;
			if (state.itemsReady == settings.itemAmount) {
				positionItems(state.items);
			}
		};
	};

	for (var _i3 = 0; _i3 < itemAmount; _i3++) {
		_loop(_i3);
	}
}

function positionItems(items) {
	items.forEach(function (item) {

		var element = document.querySelector('[data-id="' + item.id + '"]');

		function position() {
			if (element != null) {
				var columnIndex = state.columnHeights.indexOf(Math.min.apply(Math, _toConsumableArray(state.columnHeights)));
				var offsetX = columnIndex * settings.itemWidth;
				var offsetY = state.columnHeights[columnIndex];
				state.columnHeights[columnIndex] += element.clientHeight;
				element.style.transform = 'translate(' + offsetX + 'px, ' + offsetY + 'px)';
			} else {
				setTimeout(function () {
					position();
				}, 50);
			}
		}
		position();
	});
	grid.style.opacity = '1';
	setBodyHeight();
}

function reset() {
	state.columnHeights = [];
	initiateColumnHeights();
	getAdjacentBreakpoints(state.screenWidth, state.breakpoints);
}

function rerender() {
	reset();
	positionItems(state.items);
}

function handleResize() {

	var newScreenWidth = window.innerWidth;

	state.screenWidth = getScreenWidth();
	state.columnAmount = setColumnAmount();
	setGridWidth();

	if (newScreenWidth < state.adjacentBreakpoints.previous || newScreenWidth > state.adjacentBreakpoints.next) {
		rerender();
	}
}

function openFullSize(e) {

	fullSizeLoader.style.display = 'flex';
	var currentItem = e.target.closest('.item').dataset.id;
	fullSizeImage.src = './images/items/' + settings.imagePath + '/full-size/' + currentItem + '.jpg';
	fullSizeImage.onload = function () {
		fullSizeLoader.style.display = 'none';
		fullSizeImage.style.opacity = '1';
	};

	fullSizeContainer.style.display = 'block';
	document.documentElement.style.overflowY = 'hidden';
}

function closeFullSize() {
	fullSizeContainer.style.display = 'none';
	fullSizeImage.style.opacity = '0';
	document.documentElement.style.overflowY = 'scroll';
}

// Event Listeners

window.addEventListener('resize', handleResize);
window.addEventListener('orientationchange', handleResize);
fullSizeClose.addEventListener('click', closeFullSize);

init();