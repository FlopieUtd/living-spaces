// Variables

const settings = {
	itemWidth: 260,
	gutterSize: 24,
	maxItemHeight: 0,
	maxColumns: 0,															// 0 is unlimited
	itemAmount: 43,
	imagePath: 'interiors',
}

const state = {
	screenWidth: 0,
	breakpoints: [],
	adjacentBreakpoints: {
		previous: 0,
		next: 0,
	},
	columnAmount: 0,
	columnHeights: [],
	items: [],
	bodyHeight: 0,
	itemsReady: 0,
}

// DOM caching

const body = document.querySelector('body');
const header = document.querySelector('.header');
const grid = document.querySelector('.grid');
const fullSizeContainer = document.querySelector('.full-size');
const fullSizeClose = document.querySelector('.full-size__close');
const fullSizeImage = document.querySelector('.full-size-image');
const gridLoader = document.querySelector('.grid-loader');
const fullSizeLoader = document.querySelector('.full-size-loader');

// Functions

function getScreenWidth () {
	return window.innerWidth;
}

function setBodyHeight () {
	state.bodyHeight = Math.max(...state.columnHeights);
	body.style.height = state.bodyHeight + 'px';
}

function setColumnAmount () {
	return Math.floor((state.screenWidth - 20)/ settings.itemWidth);
}

function initiateColumnHeights () {
	for (i = 0; i < state.columnAmount; i++) {
		state.columnHeights.push(0);
	}
}

function getBreakpoints () {
	for (i = 1; i < (settings.maxColumns == 0 ? 20 : settings.maxColumns); i++) {
		const breakpoint = (i * settings.itemWidth) + 20;
		state.breakpoints.push(breakpoint);
	}
}

function getAdjacentBreakpoints (currentScreenWidth, breakpoints) {

	function getClosestDown (test, array) {
	  let num = result = 0;
	  for(let i = 0; i < array.length; i++) {
	    num = array[i];
	    if (num <= test) { result = num; }
	  }
	  return result;
	}

	function getClosestUp (test, array) {
		let num = result = 0;
		for(let i = array.length; i > 0; i--) {
			num = array[i]
			if (num >= test) { result = num }
		}
		return result
	}

	state.adjacentBreakpoints.previous = getClosestDown(currentScreenWidth, breakpoints);
	state.adjacentBreakpoints.next = getClosestUp(currentScreenWidth, breakpoints);
}

function setGridWidth () {
	grid.style.width = state.columnAmount * settings.itemWidth + 'px';
	header.style.width = state.columnAmount * settings.itemWidth + 'px';
}

function setMaxItemHeight () {
	settings.maxItemHeight = settings.itemWidth * 2;
}

function reset () {
	state.columnHeights = [];
	initiateColumnHeights();
	getAdjacentBreakpoints(state.screenWidth, state.breakpoints);
}

function init () {
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

function renderItems (itemAmount) {
	for (let i = 0; i < itemAmount; i++) {

		const currentImage = {};
		const image = new Image();
		image.src = './images/items/' + settings.imagePath + '/thumb/' + i + '.jpg';
		state.items.push({
			id: i,
		});

		image.onload = function () {

			// Load image, get dimensions

			currentImage.height = image.height;
			currentImage.width = image.width;
			Math.round(settings.itemWidth / image.width * image.height) > settings.maxItemHeight ? currentImage.relativeHeight = settings.maxItemHeight : currentImage.relativeHeight = Math.round(settings.itemWidth / image.width * image.height);

			// Create wrapper

			const wrapper = document.createElement('div');
			wrapper.classList.add('item__wrapper');
			wrapper.style.height = currentImage.relativeHeight + 'px';

			// Create item

			const itemElement = document.createElement('div');
			itemElement.classList.add('item');
			itemElement.style.width = settings.itemWidth + 'px';
			itemElement.style.padding = '0 ' + settings.gutterSize / 2 + 'px ' + settings.gutterSize + 'px';
			itemElement.style.opacity = 1;
			itemElement.dataset.id = i;
			itemElement.addEventListener('click', openFullSize);
	
			// Nest and append to DOM

			wrapper.appendChild(image);
			itemElement.appendChild(wrapper);
			grid.appendChild(itemElement);

			state.itemsReady++;
			if (state.itemsReady == settings.itemAmount) {
				positionItems(state.items);
			}
		}
	}
}

function positionItems (items) {
	items.forEach(function (item) {

		const element = document.querySelector('[data-id="' + item.id + '"]');

		function position () {
			if (element != null) {
	 			const columnIndex = state.columnHeights.indexOf(Math.min(...state.columnHeights));
				const offsetX = columnIndex * settings.itemWidth;
				const offsetY = state.columnHeights[columnIndex];
				state.columnHeights[columnIndex] += element.clientHeight;	
				element.style.transform = 'translate(' + offsetX + 'px, ' + offsetY + 'px)';				
			} else {
				setTimeout(function(){position();},50)
			}
		}
		position();
	});
	grid.style.opacity = '1';
	setBodyHeight();
}

function reset () {
	state.columnHeights = [];
	initiateColumnHeights();
	getAdjacentBreakpoints(state.screenWidth, state.breakpoints);
}

function rerender () {
	reset();
	positionItems(state.items);
}

function handleResize () {

	const newScreenWidth = window.innerWidth;

	state.screenWidth = getScreenWidth();
	state.columnAmount = setColumnAmount();
	setGridWidth();

	if (newScreenWidth < state.adjacentBreakpoints.previous || newScreenWidth > state.adjacentBreakpoints.next ) {
		rerender();
	}
}

function openFullSize (e) {

	fullSizeLoader.style.display = 'flex';
	const currentItem = e.target.closest('.item').dataset.id;
	fullSizeImage.src = './images/items/' + settings.imagePath + '/full-size/' + currentItem + '.jpg';
	fullSizeImage.onload = function () {
		fullSizeLoader.style.display = 'none';
		fullSizeImage.style.opacity = '1';
	}

	fullSizeContainer.style.display = 'block';
	document.documentElement.style.overflowY = 'hidden';
}

function closeFullSize () {
	fullSizeContainer.style.display = 'none';
	fullSizeImage.style.opacity = '0';
	document.documentElement.style.overflowY = 'scroll';
}

// Event Listeners

window.addEventListener('resize', handleResize);
window.addEventListener('orientationchange', handleResize);
fullSizeClose.addEventListener('click', closeFullSize);

init();

