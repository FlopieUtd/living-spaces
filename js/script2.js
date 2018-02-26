const state = {
	itemWidth: 260,
	breakpoints: [],
	screenWidth: 0,
	columnAmount: 0,
	columnHeights: [],
	items: [
		1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,16,17,19,20,21,22,23,24,
	],
}

const grid = document.querySelector('.grid');

function getScreenWidth () {
	return window.innerWidth;
}

function getColumnAmount () {
	return Math.floor((state.screenWidth - 20) / state.itemWidth)
}

function setColumnHeights () {
	for (i = 0; i < state.columnAmount; i++) {
		state.columnHeights.push(0);
	}
}

function getBreakpoints () {
	for (i = 1; i < 11; i++) {
		const breakpoint = i * state.itemWidth + 20;
		state.breakpoints.push(breakpoint) 
	}
}

function reset () {
	grid.innerHTML = '';
	state.columnHeights = [];
}

function renderItems (items) {

	items.forEach(function (item, index) {
		
		const currentImage = {};

		loadImage('./images/' + index + '.jpg');

		function loadImage (imageSource) {
			const image = new Image();
			image.onload = handleImage;

			function handleImage () {
				const lowest = Math.min(...state.columnHeights);
				const columnIndex = state.columnHeights.indexOf(lowest);
				const x = columnIndex * state.itemWidth;
				const itemElement = document.createElement('div');
				itemElement.classList.add('item');
				grid.appendChild(itemElement);

				const wrapperElement = document.createElement('div');
				wrapperElement.classList.add('item__wrapper');
				itemElement.appendChild(wrapperElement);
				itemElement.style.position = 'absolute';
				itemElement.style.left = x + 'px';
				itemElement.style.top = state.columnHeights[columnIndex] + 'px';
				currentImage.imageHeight = image.height;
				currentImage.imageWidth = image.width;
				currentImage.relativeHeight = Math.round(state.itemWidth / image.width * image.height);
				state.columnHeights[columnIndex] += currentImage.relativeHeight + 24;	
				wrapperElement.style.height = currentImage.relativeHeight + 'px';
				wrapperElement.appendChild(image);
			}

		image.src = imageSource;
		}
	})

}

function init () {
	state.screenWidth = getScreenWidth();
	state.columnAmount = getColumnAmount();
	setColumnHeights();
	getBreakpoints();
	renderItems(state.items);
	grid.style.width = state.columnAmount * state.itemWidth + 'px';
}

window.addEventListener('resize', function () {
	state.screenWidth = window.innerWidth;
	state.columnAmount = getColumnAmount();
	grid.style.width = state.columnAmount * state.itemWidth + 'px';
	console.log(window.innerWidth);
})

init();

console.log(state);