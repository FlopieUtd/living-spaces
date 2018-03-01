// Variables

const settings = {
	itemWidth: 260,
	gutterSize: 24,
	maxItemHeight: 0,
	maxColumns: 0				// 0 is unlimited
}

const state = {
	screenWidth: 0,
	breakpoints: [],
	adjacentBreakpoints: {
		previous: 0,
		next: 0
	},
	columnAmount: 0,
	columnHeights: [],
}

const content = {
	itemAmount: 27
}

// DOM caching

const header = document.querySelector('.header');
const grid = document.querySelector('.grid');


// Functions

function getScreenWidth () {
	return window.innerWidth;
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

function reset () {
	grid.innerHTML = '';
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
	render(content.items);
}

function render (items) {

	for (i = 0; i < content.itemAmount; i++) {

		const currentImage = {};
		const image = new Image();
		image.src = './images/' + i + '.jpg';

		image.onload = function () {

			// Load image, get dimensions

			currentImage.height = image.height;
			currentImage.width = image.width;
			currentImage.relativeHeight = Math.round(settings.itemWidth / image.width * image.height);

			// Determine column

			const shortestColumn = Math.min(...state.columnHeights);
			const columnIndex = state.columnHeights.indexOf(shortestColumn);
			const offset = columnIndex * settings.itemWidth;

			// Create item

			const itemElement = document.createElement('div');
			itemElement.classList.add('item');

			// Create wrapper

			const wrapper = document.createElement('div');
			wrapper.classList.add('item__wrapper');



			wrapper.style.height = currentImage.relativeHeight + 'px';
			itemElement.style.left = offset + 'px';
			itemElement.style.top = state.columnHeights[columnIndex] + 'px';
			itemElement.style.width = settings.itemWidth + 'px';
			itemElement.style.padding = '0 ' + settings.gutterSize / 2 + 'px ' + settings.gutterSize + 'px';
			state.columnHeights[columnIndex] += currentImage.relativeHeight + settings.gutterSize;		

			// Nest and append to DOM

			wrapper.appendChild(image);
			itemElement.appendChild(wrapper)
			grid.appendChild(itemElement);

		}
	}
}

function rerender () {
	reset();
	render(content.items);
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

// Event Listeners

window.addEventListener('resize', handleResize);
window.addEventListener('orientationchange', handleResize);

init();
