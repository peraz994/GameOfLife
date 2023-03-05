import * as d3 from "d3";
import { GameOfLife } from '../data_structures/GameOfLife';
import { Rect } from '../data_structures/Rect';
import Renderer from '../render/render';

export default function gameOfLifePage() {

	// https://www.youtube.com/watch?v=yw-j-4xYAN4
	const isPlaying = true;
	let modal;
	const root = document.createElement( 'div' );
	root.innerHTML = `
		<div style="min-height: 100vh; display: flex; flex-direction: column;">
        	<div style="padding: 0 0.4em; font-size: 0.65rem; display: flex; gap: 3em; color: white; background-color: black; border: 3px solid white;">
				<div style="padding-right: 1.5em;">
					<p>WORLD:</p>
					<p>TO 4 BLOCKS</p>
				</div>
				<div style="padding-right: 1.5em;">
					<p>GENERATION:</p>
					<p id="number-of-generations"></p>
				</div>
				<div>
					<p>ALIVE CELLS:</p>
					<p id="number-of-alive-cells">-//-</p>
				</div>

				<div style="margin-left: auto;">
					<p>SPEED:</p>
					<input class="slider" type="range" id="time-speed" min="0" max="100">
				</div>


				<div class="button" style="display: flex; gap: 0.35em; align-items: center; display: grid; grid-template-columns: 1fr 1fr; align-self: center; padding: 0.35em 0;">
					<div class="button" style="background: transaprent; border: 0.075rem solid white;" id="play-pause-button">
						<svg id="play" xmlns="http://www.w3.org/2000/svg" style="display: none;" fill="white" height="1.35rem" width="1.35rem" viewBox="0 0 48 48"><path d="M16 37.85v-28l22 14Z"/></svg>
						<svg id="pause" xmlns="http://www.w3.org/2000/svg"  fill="white" height="1.35rem" width="1.35rem" viewBox="0 0 48 48"><path d="M28.25 38V10H36v28ZM12 38V10h7.75v28Z"/></svg>
					</div>

					<div class="button" style="background: transaprent; border: 0.075rem solid white;" id="reset-button">
						<svg fill="white" height="1.35rem" width="1.35rem" viewBox="0 0 48 48">
							<path d="M23.85 42q-7.45 0-12.65-5.275T6 23.95h3q0 6.25 4.3 10.65T23.85 39q6.35 0 10.75-4.45t4.4-10.8q0-6.2-4.45-10.475Q30.1 9 23.85 9q-3.4 0-6.375 1.55t-5.175 4.1h5.25v3H7.1V7.25h3v5.3q2.6-3.05 6.175-4.8Q19.85 6 23.85 6q3.75 0 7.05 1.4t5.775 3.825q2.475 2.425 3.9 5.675Q42 20.15 42 23.9t-1.425 7.05q-1.425 3.3-3.9 5.75-2.475 2.45-5.775 3.875Q27.6 42 23.85 42Zm6.4-9.85-7.7-7.6v-10.7h3v9.45L32.4 30Z"/>
						</svg>
					</div>

					<div class="button" style="background: transaprent; border: 0.075rem solid white;" id="change-world-button">
						<svg fill="white" height="1.35rem" width="1.35rem" viewBox="0 0 48 48">
							<path d="m30.6 42-13.15-4.65L8.5 40.9q-.85.45-1.675-.05Q6 40.35 6 39.35v-27.9q0-.65.375-1.15.375-.5.975-.75L17.45 6l13.15 4.6 8.9-3.55q.85-.4 1.675.075Q42 7.6 42 8.6v28.25q0 .55-.375.95-.375.4-.925.6Zm-1.7-3.75V13l-9.8-3.3v25.25Zm3 0L39 35.9V10.3L31.9 13ZM9 37.65l7.1-2.7V9.7L9 12.05ZM31.9 13v25.25ZM16.1 9.7v25.25Z"/>
						</svg>
					</div>

					<div class="button" style="background: transaprent; border: 0.075rem solid white;" id="help-button">
						<svg fill="white" height="1.35rem" width="1.35rem" viewBox="0 0 48 48">
							<path d="M21.55 31.5q.05-3.6.825-5.25.775-1.65 2.925-3.6 2.1-1.9 3.225-3.525t1.125-3.475q0-2.25-1.5-3.75t-4.2-1.5q-2.6 0-4 1.475T17.9 14.95l-4.2-1.85q1.1-2.95 3.725-5.025T23.95 6q5 0 7.7 2.775t2.7 6.675q0 2.4-1.025 4.35-1.025 1.95-3.275 4.1-2.45 2.35-2.95 3.6t-.55 4Zm2.4 12.5q-1.45 0-2.475-1.025Q20.45 41.95 20.45 40.5q0-1.45 1.025-2.475Q22.5 37 23.95 37q1.45 0 2.475 1.025Q27.45 39.05 27.45 40.5q0 1.45-1.025 2.475Q25.4 44 23.95 44Z"/>
						</svg>
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
		let numberOfCellsAlive = 6;
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

		document.getElementById( 'change-world-button' ).addEventListener( 'click', () => {

			alert( 'CHANGE MAP CLICKED' );

		} );

		document.getElementById( 'reset-button' ).addEventListener( 'click', () => {

			alert( 'RESET CLICKED' );

		} );

		document.getElementById( 'help-button' ).addEventListener( 'click', () => {

			//alert( 'https://www.youtube.com/watch?v=yw-j-4xYAN4' );
			modal = document.createElement( 'div' );
			modal.innerHTML = `
				<div style="position: fixed; top: 0%; right: 0%; bottom: 0%; left: 0%; opacity: 50%; background: black;">
				</div>
				<div style="padding: 0.5rem 0.5rem; background: black; position: fixed; top: 50%; right: 20%; left: 20%; transform: translateY(-50%); border: 0.3rem solid white; color: white; font-size: 0.8rem;">
					<div  style="text-align: end;">
						<span id="modal-close">X<span>
					</div>
					<div style="display: flex; flex-direction: column; justify-content: space-between; color: white; font-size: 0.8rem;">
						<div>
							<h3 style="margin-top: 0;">Desktop controls:</h3>
							<ul style="list-style-type: none;">
								<li>To move press mouse and move.</li>
								<li>To zoom move mouse wheel.</li>
							</ul>
						</div>

						<div>
							<h3 style="margin-top: 2em;">Mobile controls:</h3>
							<ul style="list-style-type: none;">
								<li>To move press mouse and move.</li>
								<li>To zoom move mouse wheel.</li>
							</ul>
						</div>

						<div style="text-align: center; margin-top: 7em;">
							>> <a class="link" style="color: white; text-decoration: none;" target='_blank' href="https://youtu.be/yw-j-4xYAN4?t=12&cc_load_policy=1">Press for game explanation</a> &#60;&#60;
						</div>
					</div>
				</div>
			`;
			document.body.append( modal );
			document.getElementById( 'modal-close' ).addEventListener( 'click', () => {

				modal.remove();
				modal = null;

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

		function renderNumberOfCellsAlive() {

			const element = root.querySelector( '#number-of-alive-cells' );
			element.innerHTML = numberOfCellsAlive;

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

			numberOfCellsAlive = 0;
			game.forEachAlive( () => {

				numberOfCellsAlive += 1;

			} );
			renderNumberOfCellsAlive();

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

