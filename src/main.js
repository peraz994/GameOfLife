import '../style.css';
import * as d3 from "d3";
import { GameOfLife } from './data_structures/GameOfLife';
import { Rect } from './data_structures/Rect';
import Renderer from './render/render';

/* CONSTS */
const SVG = d3.select( '#svg-reder-target' );
let SVG_HEIGHT = SVG.node().clientHeight;
let SVG_WIDTH = SVG.node().clientWidth;

/* DATA */
let isPaused = false;
let canMove = false;
let dragged = false;
let game = new GameOfLife();
game.makeCellAlive( { x: 0, y: 0 } ); // STARTING CONFIGURATION:
game.makeCellAlive( { x: 0, y: 1 } ); //
game.makeCellAlive( { x: 1, y: 1 } ); //     *
game.makeCellAlive( { x: 1, y: 2 } ); //   * *
game.makeCellAlive( { x: 2, y: 2 } ); // * *
game.makeCellAlive( { x: 2, y: 3 } ); // *
let numberOfGenerations = 1;
let viewRect = new Rect( {
	x: 0,
	y: 0,
	height: 20,
	aspectRatio: SVG_WIDTH / SVG_HEIGHT
} );

const renderer = new Renderer( { svg: SVG } );
SVG.on( 'mousedown', () => {

	canMove = true;

} );

SVG.on( 'mouseup', ( e ) => {

	canMove = false;


	if ( dragged ) {

		dragged = false;
		return;

	}

	let scX = d3.scaleLinear().domain( [ viewRect.left, viewRect.right ] ).range( [ 0, SVG_WIDTH ] );
	let scY = d3.scaleLinear().domain( [ viewRect.bottom, viewRect.top ] ).range( [ SVG_HEIGHT, 0 ] );

	let [ x, y ] = d3.pointer( e, SVG.node() );
	x = Math.floor( Number( scX.invert( x ) ) );
	y = Math.floor( Number( scY.invert( y ) ) );

	game._isCellAlive( { x, y } ) ? game.makeCellDead( { x, y } ) : game.makeCellAlive( { x, y } );

} );

SVG.on( 'mousemove', ( e ) =>{

	if ( ! canMove ) {

		return;

	}

	const speed = 0.1;
	const dx = e.movementX * speed;
	const dy = e.movementY * speed;

	viewRect.x -= dx;
	viewRect.y += dy;

	dragged = true;

} );

document.addEventListener( 'keypress', ( e ) => {

	switch ( e.key ) {

		case '+':
			zoomIn();
			break;

		case '-':
			zoomOut();
			break;

	}


} );

window.addEventListener( 'resize', () => {

	SVG_HEIGHT = SVG.node().clientHeight;
	SVG_WIDTH = SVG.node().clientWidth;
	viewRect = new Rect( {
		x: viewRect.x,
		y: viewRect.y,
		aspectRatio: SVG_WIDTH / SVG_HEIGHT,
		height: viewRect.height,
	} );


} );

/* FUNCTIONS */
function zoomOut() {

	viewRect = new Rect( {
		x: viewRect.x,
		y: viewRect.y,
		height: viewRect.height + 2,
		aspectRatio: viewRect.aspectRatio
	} );

}

function zoomIn() {

	viewRect = new Rect( {
		x: viewRect.x,
		y: viewRect.y,
		height: viewRect.height - 2,
		aspectRatio: viewRect.aspectRatio
	} );


}

function renderNumberOfGenerations() {

	const element = document.getElementById( 'number-of-generations' );
	element.innerHTML = numberOfGenerations;

}

document.getElementById( 'play-pause-button' ).addEventListener( 'click', () => {

	isPaused = ! isPaused;

} );

// time-speed
document.getElementById( 'time-speed' ).addEventListener( 'change', ( e ) => {

	const t = e.target.valueAsNumber / 100;
	const start = 1;
	const end = 40;
	deltaTime = 1000 / ( start + t * ( end - start ) );

} );
document.getElementById( 'time-speed' ).valueAsNumber = 500 / ( 1000 - 30 );

/**
 * REQUEST ANIMATION FRAME LOOP
 */
let previousTimestamp = 0;
let deltaTime = 500;
function step( timestamp ) {

	renderer.render( game, viewRect );
	renderNumberOfGenerations();

	if ( ! isPaused && ( timestamp - previousTimestamp ) > deltaTime ) {

		game = GameOfLife.next( game );
		previousTimestamp = timestamp;
		numberOfGenerations += 1;

	}

	window.requestAnimationFrame( step );

}

window.requestAnimationFrame( step );

