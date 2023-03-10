import * as d3 from "d3";
import { GameOfLife } from '../data_structures/GameOfLife';
import { Rect } from '../data_structures/Rect';
import Renderer from '../render/render';

export default function gameOfLifePage() {

	// https://www.youtube.com/watch?v=yw-j-4xYAN4
	const isPlaying = true;
	const root = document.createElement( 'div' );
	root.innerHTML = `
		<div style="min-height: 100vh; display: flex; flex-direction: column;">
        	<div style="padding: 0 1em; font-size: 0.65rem; display: flex; justify-content: space-between; color: white; background-color: black; border: 3px solid white;">
				<div>
					<p>WORLD:</p>
					<p>TO 4 BLOCKS</p>
				</div>
				<div>
					<p>ITERATION:</p>
					<p id="number-of-generations"></p>
				</div>
				<div>
					<p>SPEED:</p>
					<input class="slider" type="range" id="time-speed" min="0" max="100">
				</div>
				<div style="display: flex; align-items: center;">
					<div style="background: transaprent; border: 0.15rem solid white;" id="play-pause-button">
						<svg id="play" xmlns="http://www.w3.org/2000/svg" style="display: none;" fill="white" height="2rem" width="2rem" viewBox="0 0 48 48"><path d="M16 37.85v-28l22 14Z"/></svg>
						<svg id="pause" xmlns="http://www.w3.org/2000/svg"  fill="white" height="2rem" width="2rem" viewBox="0 0 48 48"><path d="M28.25 38V10H36v28ZM12 38V10h7.75v28Z"/></svg>
					</div>
				</div>
			</div>
        	<svg id="svg-reder-target"  style="width:100vw; flex-grow: 1;"></svg>
		</div>
    `;


	/* CONSTS */
	setTimeout( () => {

		const s = root.querySelector( '#svg-reder-target' );
		const SVG = d3.select( s );
		let SVG_HEIGHT = SVG.node().clientHeight; // getBoundingClientRect().height
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
			height: 25,
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

		window.addEventListener( 'keypress', ( e ) => {

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

			const element = root.querySelector( '#number-of-generations' );
			element.innerHTML = numberOfGenerations;

		}

		root.querySelector( '#play-pause-button' ).addEventListener( 'click', function () {

			isPaused = ! isPaused;
			const play = document.getElementById( 'play' );
			play.style.display = ! isPaused ? 'none' : 'initial';
			const pause = document.getElementById( 'pause' );
			pause.style.display = isPaused ? 'none' : 'initial';

		} );

		// time-speed
		root.querySelector( '#time-speed' ).addEventListener( 'change', ( e ) => {

			const t = e.target.valueAsNumber / 100;
			const start = 1;
			const end = 40;
			deltaTime = 1000 / ( start + t * ( end - start ) );

		} );
		root.querySelector( '#time-speed' ).valueAsNumber = 500 / ( 1000 - 30 );

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

	}, 0 );

	return root;

}

