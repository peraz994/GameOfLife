import './style.css';
import * as d3 from "d3";
import { curveLinear } from 'd3';
import { GameOfLife } from './GameOfLife';
import { Rect } from './Rect';

function playground() {


	document.getElementById( 'app' ).innerHTML = `
	<table>
		<tr><td></td></tr>
		<tr><td></td></tr>
		<tr><td></td></tr>
		<tr><td></td></tr>
	</table>

	<svg width="600" height="300"></svg>
	`;

	const svg = d3.select( 'svg' );
	console.log( svg.select( 'circle' ) );
	console.log( svg.selectAll( 'circle' ) );

}

async function makeDemo3() {

	const data = await d3.csv( "data.csv" );

	const svg = d3.select( "svg" );
	const pxX = svg.attr( "width" );
	const pxY = svg.attr( "height" );
	const axisWidth = '45';

	const makeScale = function ( accessor, range ) {

		return d3.scaleLinear()
			.domain( d3.extent( data, accessor ) )
			.range( range ).nice();

	};

	const scX = makeScale( d => d[ "x" ], [ axisWidth, pxX - axisWidth ] );
	const scY1 = makeScale( d => d[ "y1" ], [ pxY - axisWidth, axisWidth ] );
	const scY2 = makeScale( d => d[ "y2" ], [ pxY - axisWidth, axisWidth ] );
	const drawData = function ( g, accessor, curve ) {

		g.selectAll( "circle" ).data( data ).enter()
			.append( "circle" )
			.attr( "r", 5 )
			.attr( "cx", d => scX( d[ "x" ] ) )
			.attr( "cy", accessor );

		const lnMkr = d3.line().curve( curve )
			.x( d => scX( d[ "x" ] ) ).y( accessor );
		g.append( "path" ).attr( "fill", "none" )
			.attr( "d", lnMkr( data ) );

	};

	const g1 = svg.append( "g" );
	const g2 = svg.append( "g" );

	drawData( g1, d => scY1( d[ "y1" ] ), d3.curveStep );
	drawData( g2, d => scY2( d[ "y2" ] ), d3.curveNatural );

	const g1LineColor = 'cyan';
	const g2LineColor = 'red';

	g1.selectAll( "circle" ).attr( "fill", "green" );
	g1.selectAll( "path" ).attr( "stroke", g1LineColor );
	g2.selectAll( "circle" ).attr( "fill", "blue" );
	g2.selectAll( "path" ).attr( "stroke", g2LineColor );

	let axMkr = d3.axisRight( scY1 );
	axMkr( svg.append( "g" ).attr( 'color', g1LineColor ) );
	axMkr = d3.axisLeft( scY2 );
	svg.append( "g" ).attr( 'color', g2LineColor )
		.attr( "transform", "translate(" + pxX + ",0)" )
		.call( axMkr );
	svg.append( "g" ).attr( 'color', 'orange' ).call( d3.axisTop( scX ) )
		.attr( "transform", "translate(0," + pxY + ")" );

	svg.append( 'text' )
		.text( '>>> Two data sets <<<' )
		.attr( 'fill', 'rebeccapurple' )
		.attr( 'x', pxX / 2 - 80 )
		.attr( 'y', axisWidth / 2 )
		.style( 'text-decoration', 'underline' );

}

function makeKeys() {

	const ds1 = [[ "Mary", 1 ], [ "Jane", 4 ], [ "Anne", 2 ]];
	const ds2 = [[ "Anne", 5 ], [ "Jane", 3 ]];

	const scX = d3.scaleLinear().domain( [ 0, 6 ] )
		.range( [ 50, 300 ] );
	const scY = d3.scaleLinear().domain( [ 0, 3 ] ).range( [ 50, 150 ] );

	let j = - 1;
	let k = - 1;

	const svg = d3.select( 'svg' );


	svg.selectAll( 'text' )
		.data( ds1 ).enter().append( 'text' )
		.attr( 'x', '20' ).attr( 'y', () => scY( ++ j ) ).text( d => d[ 0 ] );


	svg.selectAll( 'circle' ).data( ds1 ).enter().append( 'circle' )
		.attr( 'r', 5 ).attr( 'fill', 'red' )
		.attr( 'cx', d => scX( d[ 1 ] ) )
		.attr( 'cy', () => scY( ++ k ) - 5 );


	svg.on( 'click', () => {

		const cs = svg.selectAll( 'circle' ).data( ds2, d => d[ 0 ] );
		cs.transition().duration( 1000 ).attr( 'cx', d => scX( d[ 1 ] ) );
		cs.exit().attr( 'fill', 'blue' );

	} );

}

function makeUpdate() {

	let ds1 = [[ 2, 3, 'green' ], [ 1, 2, 'red' ],
		[ 2, 1, 'blue' ], [ 3, 2, 'yellow' ]];
	let ds2 = [[ 1, 1, 'red' ], [ 3, 3, 'black' ],
		[ 1, 3, 'lime' ], [ 3, 1, 'blue' ]];

	const scX = d3.scaleLinear().domain( [ 1, 3 ] ).range( [ 100, 200 ] );
	const scY = d3.scaleLinear().domain( [ 1, 3 ] ).range( [ 50, 100 ] );

	const svg = d3.select( 'svg' );

	svg.on( 'click', () => {

		[ ds1, ds2 ] = [ ds2, ds1 ];

		let cs = svg.selectAll( 'circle' ).data( ds1, d => d[ 2 ] );

		cs.exit().remove();

		cs = cs.enter().append( 'circle' )
			.attr( 'r', 5 ).attr( 'fill', d => d[ 2 ] )
			.merge( cs );

		cs.attr( 'cx', d => scX( d[ 0 ] ) )
			.attr( 'cy', d => scY( d[ 1 ] ) );

	} );

	svg.dispatch( 'click' );

}

function makeSort() {

	const data = [ 'Jan', 'Anne', 'Marry' ];

	const ul = document.createElement( 'ul' );
	ul.className = '#sort';
	document.body.appendChild( ul );

	const ls = d3.select( ul );
	ls.selectAll( 'li' ).data( data ).enter().append( 'li' )
		.text( d => d );

	let once;
	ls.on( 'mouseenter', function () {

		if ( once ) {

			return;

		}

		once = 1;
		ls.insert( 'li', ':nth-child(2)' )
			.datum( 'Lucy' ).text( 'Lucy' );
		ls.insert( 'li', ':first-child' )
			.datum( 'Lisa' ).text( 'Lisa' );

	} );

	ls.on( 'click', () => {

		ls.selectAll( 'li' ).sort( ( a, b ) => a < b ? - 1 : b < a ? 1 : 0 );

	} );

}

function coordPixels( selector ) {

	const txt = d3.select( selector ).append( 'text' );
	const svg = d3.select( selector ).attr( 'cursor', 'crosshair' )
		.on( 'mousemove', ( event ) => {

			const pt = d3.pointer( event, svg.node() );
			txt.attr( 'x', 18 + pt[ 0 ] ).attr( 'y', 6 + pt[ 1 ] )
				.text( `${pt[ 0 ]},${pt[ 1 ]}` );

		} );

}

function example42() {

	async function makeBrush() {

		document.getElementById( 'app' ).innerHTML = `
		<svg id='brush1' width="600" height="300" style='margin-bottom: 40px;'></svg>
		<svg id='brush2' width="600" height="300"></svg>
		`;

		const data = await d3.csv( 'dense.csv' );

		const svg1 = d3.select( '#brush1' );
		const svg2 = d3.select( '#brush2' );

		const sc1 = d3.scaleLinear().domain( [ 0, 10, 50 ] ).range( [ 'lime', 'yellow', 'red' ] );
		const sc2 = d3.scaleLinear().domain( [ 0, 10, 50 ] ).range( [ 'lime', 'yellow', 'blue' ] );

		const cs1 = drawCircles( svg1, data, d => d[ 'A' ], d => d[ 'B' ], sc1 );
		const cs2 = drawCircles( svg2, data, d => d[ 'A' ], d => d[ 'C' ], sc2 );

		svg1.call( installHandlers2, data, cs1, cs2, sc1, sc2 );

	}

	function drawCircles( svg, data, accX, accY, sc ) {

		const color = sc( Infinity );
		return svg.selectAll()
				  .data( data )
				  .enter()
				  .append( 'circle' )
				  .attr( 'r', 5 ).attr( 'cx', accX ).attr( 'cy', accY )
				  .attr( 'fill', color ).attr( 'fill-opacity', 0.4 );

	}

	function installHandlers( svg, data, cs1, cs2, sc1, sc2 ) {

		svg.attr( 'cursor', 'crosshair' )
		   .on( 'mousemove', function ( e ) {

				const pt = d3.pointer( e );

				cs1.attr( 'fill', function ( d, i ) {

					const dx = pt[ 0 ] - d3.select( this ).attr( 'cx' );
					const dy = pt[ 1 ] - d3.select( this ).attr( 'cy' );
					const r = Math.hypot( dx, dy );

					data[ i ][ 'r' ] = r;
					return sc1( r );

				} );

				cs2.attr( 'fill', ( d, i ) => sc2( data[ i ][ 'r' ] ) );

		   } )
		   .on( 'mouseleave', function () {

				cs1.attr( 'fill', sc1( Infinity ) );
				cs2.attr( 'fill', sc2( Infinity ) );

		   } );

	}

	function installHandlers2( svg, data, cs1, cs2, sc1, sc2 ) {

		const cursor = svg.append( 'circle' ).attr( 'r', 50 )
						  .attr( 'fill', 'none' ).attr( 'stroke', 'black' )
						  .attr( 'stroke-width', 10 ).attr( 'stroke-opacity', 0.1 )
						  .attr( 'visibility', 'hidden' );

		const hotzone = svg.append( 'rect' ).attr( 'cursor', 'none' )
						   .attr( 'x', 50 ).attr( 'y', 50 )
						   .attr( 'width', 200 ).attr( 'height', 200 )
						   .attr( 'visibility', 'hidden' )
						   .attr( 'pointer-events', 'all' );

		hotzone.on( 'mouseenter', function () {

			cursor.attr( 'visibility', 'visible' );

		} );

		hotzone.on( 'mousemove', function ( e ) {

			const pt = d3.pointer( e );
			cursor.attr( 'cx', pt[ 0 ] ).attr( 'cy', pt[ 1 ] );

			cs1.attr( 'fill', function ( d, i ) {

				const dx = pt[ 0 ] - d3.select( this ).attr( 'cx' );
				const dy = pt[ 1 ] - d3.select( this ).attr( 'cy' );
				const r = Math.hypot( dx, dy );

				data[ i ][ 'r' ] = r;
				return sc1( r );

			} );

			cs2.attr( 'fill', ( d, i ) => sc2( data[ i ][ 'r' ] ) );

		} );

		hotzone.on( 'mouseleave', function () {

			cursor.attr( 'visibility', 'hidden' );
			cs1.attr( 'fill', sc1( Infinity ) );
			cs2.attr( 'fill', sc2( Infinity ) );

		} );

	}

	makeBrush();

}

function makeDragDrop() {

	document.getElementById( 'app' ).innerHTML = `
	<svg id="dragdrop" width="600px" height="200px">
		<circle cx="100" cy="100" r="20" fill="red"></circle>
		<circle cx="200" cy="100" r="20" fill="green"></circle>
		<circle cx="300" cy="100" r="20" fill="blue"></circle>
	</svg>
	`;

	function myImplementation() {

		const svg = d3.select( '#dragdrop' );
		const cs = svg.selectAll( 'circle' );


		cs.on( 'mousedown', function () {

			d3.select( this ).datum( true );

		} );

		cs.on( 'mouseup', function () {

			d3.select( this ).datum( false );

		} );

		svg.on( 'mousemove', function ( e ) {

			const pt = d3.pointer( e );
			const sc = cs.filter( d => d );

			sc.attr( 'cx', d => pt[ 0 ] );
			sc.attr( 'cy', d => pt[ 1 ] );

		} );

	}

	function bookImplementation() {

		let widget, color;

		const drag = d3.drag()
			.on( 'start', function () {

				color = d3.select( this ).attr( 'fill' );
				widget = d3.select( this ).attr( 'fill', 'lime' );

			} )
			.on( 'drag', function ( e ) {

				const pt = d3.pointer( e );
				widget.attr( 'cx', pt[ 0 ] ).attr( 'cy', pt[ 1 ] );

			} )
			.on( 'end', function () {

				widget.attr( 'fill', 'orange' );
				widget = undefined;

			} );

		drag( d3.select( '#dragdrop' ).selectAll( 'circle' ) );

	}

	bookImplementation();

}

function makeStagger() {

	document.getElementById( 'app' ).innerHTML = `
	<svg id="stagger" width="600px" height="300px">
	</svg>
	`;

	let ds1 = [ 2, 1, 3, 5, 7, 8, 9, 9, 9, 8, 7, 5, 3, 1, 2 ];
	let ds2 = [ 8, 9, 8, 7, 5, 3, 2, 1, 2, 3, 5, 7, 8, 9, 8 ];
	const n = ds1.length, mx = d3.max( [ ...ds1, ...ds2 ] );

	const svg = d3.select( '#stagger' );

	const scX = d3.scaleLinear().domain( [ 0, n ] ).range( [ 50, 550 ] );
	const scY = d3.scaleLinear().domain( [ 0, mx ] ).range( [ 250, 50 ] );

	svg.selectAll( 'line' ).data( ds1 ).enter().append( 'line' )
		.attr( 'stroke', 'red' ).attr( 'stroke-width', 20 )
		.attr( 'x1', ( d, i ) => scX( i ) ).attr( 'y1', scY( 0 ) )
		.attr( 'x2', ( d, i ) => scX( i ) ).attr( 'y2', d => scY( d ) );

	svg.on( 'click', () => {

		[ ds1, ds2 ] = [ ds2, ds1 ];

		svg.selectAll( 'line' ).data( ds1 )
			.transition().duration( 500 ).delay( ( d, i ) => 100 * i )
			.attr( 'y2', d => scY( d ) );

	} );

}

function makeLissajous() {

	document.getElementById( 'app' ).innerHTML = `
	<svg width='300px' height='300px' id="lissajous"></svg>
	`;

	const svg = d3.select( '#lissajous' );

	const a = 3.2, b = 5.9;
	const omega = 2 * Math.PI / 10000;
	let phi;

	let crrX = 150 + 100, crrY = 150 + 0;
	let prvX = crrX, prvY = crrY;

	const timer = d3.timer( function ( t ) {

		phi = omega * t;

		crrX = 150 + 100 * Math.cos( a * phi );
		crrY = 150 + 100 * Math.sin( b * phi );

		svg.selectAll( 'line' )
			.each( function () {

				this.bogusOpacity *= .95;

			} )
			.attr( 'stroke-opacity', function () {

				return this.bogusOpacity;

			} )
			.filter( function () {

				return this.bogusOpacity < 0.1;

			} )
			.remove();

		svg.append( 'line' )
			.each( function () {

				this.bogusOpacity = 1.0;

			} )
			.attr( 'x1', prvX ).attr( 'y1', prvY )
			.attr( 'x2', crrX ).attr( 'y2', crrY )
			.attr( 'stroke', 	'green' ).attr( 'stroke-width', 2 );

		prvX = crrX;
		prvY = crrY;


		if ( t > 120e3 ) {

			timer.stop();

		}

	} );

}

function makeVoters() {

	document.getElementById( 'app' ).innerHTML = `
	<svg width='300px' height='300px' id="voters"></svg>
	`;

	const n = 50, w = 300 / n, dt = 20, svg = d3.select( '#voters' );

	const data = d3.range( n * n )
		.map( d => ( {
			x: d % n,
			y: Math.floor( d / n ),
			val: Math.random()
		} ) );

	const sc = d3.scaleQuantize()
		.range( [ 'white', 'red', 'black' ] );


	svg.selectAll( 'rect' ).data( data )
		.enter()
		.append( 'rect' )
		.attr( 'x', d => d.x * w )
		.attr( 'y', d => d.y * w )
		.attr( 'width', w - 1 )
		.attr( 'height', w - 1 )
		.attr( 'fill', d => sc( d.val ) );

	function update() {

		const nbs = [[ 0, 1 ], [ 0, - 1 ], [ 1, 0 ], [ - 1, 0 ],
			[ 1, 1 ], [ 1, - 1 ], [ - 1, 1 ], [ - 1, - 1 ]];

		return d3.shuffle( d3.range( n * n ) ).map( i => {

			const nb = nbs[ nbs.length * Math.random() | 0 ];
			const x = ( data[ i ].x + nb[ 0 ] + n ) % n;
			const y = ( data[ i ].y + nb[ 1 ] + n ) % n;
			data[ i ].val = data[ y * n + x ].val;

		} );

	}

	d3.interval( function () {

		update();
		svg.selectAll( 'rect' ).data( data )
			.transition().duration( dt ).delay( ( d, i ) => i * 0.25 * dt / ( n * n ) )
			.attr( 'fill', d => sc( d.val ) );

	} );

}


function makeSymbols() {

	document.getElementById( 'app' ).innerHTML = `
	<svg width='600px' height='300px' id="symbols"></svg>
	`;

	function arrow() {

		return "M0 0 L16 0 M8 4 L16 0 L8 -4";

	}

	const data = [
		{ "x": 40, "y": 0, "val": "A" },
		{ "x": 80, "y": 30, "val": "A" },
		{ "x": 120, "y": - 10, "val": "B" },
		{ "x": 160, "y": 15, "val": "A" },
		{ "x": 200, "y": 0, "val": "C" },
		{ "x": 240, "y": 10, "val": "B" }
	];

	const svg = d3.select( '#symbols' );

	const scY = d3.scaleLinear().domain( [ - 10, 30 ] ).range( [ 240, 40 ] );
	const scR = d3.scaleOrdinal().domain( [ 'A', 'B', 'C' ] ).range( [ 0, 60, 120 ] );

	const symMkr = d3.symbol().size( 81 ).type( d3.symbolDiamond2 );


	svg.append( 'g' )
		.selectAll( 'path' )
		.data( data )
		.enter()
		.append( 'path' )
		.attr( 'd', arrow )
		.attr( 'transform', d => `translate(${ d.x }, ${ scY( d.y ) }) rotate(${ scR( d.val ) })` )
		.attr( 'fill', 'none' )
		.attr( 'stroke', 'red' );


	const scT = d3.scaleOrdinal( d3.symbols ).domain( [ 'A', 'B', 'C' ] );
	const scC = d3.scaleOrdinal().domain( [ 'A', 'B', 'C' ] ).range( [ 'orange', 'green', 'blue' ] );

	svg.append( 'g' )
		.attr( 'transform', 'translate( 300, 0 )' )
		.selectAll( 'path' )
		.data( data )
		.enter()
		.append( 'path' )
		.attr( 'd', d => symMkr.type( scT( d.val ) )() )
		.attr( 'fill', 'none' )
		.attr( 'stroke', d => scC( d.val ) ).attr( 'stroke-width', 2 )
		.attr( 'transform', d => `translate( ${ d.x }, ${ scY( d.y ) } )` );

}

function makeCroshair() {

	document.getElementById( 'app' ).innerHTML = `
	<svg width='600px' height='300px'>
		<defs>
			<g id="crosshair" fill="none">
				<circle cx="0" cy="0" r="4"></circle>
				<line x1="0"  y1="2"  x2="0" y2="6" ></line>
				<line x1="0"  y1="-2" x2="0" y2="-6"></line>
				<line x1="2"  y1="0"  x2="6" y2="0" ></line>
				<line x1="-2" y1="0"  x2="-6" y2="0"></line>
			</g>
		</defs>
	</svg>
	`;

	const data = [[ 180, 1 ], [ 260, 3 ], [ 340, 2 ], [ 420, 4 ]];

	d3.select( 'svg' ).selectAll( 'use' ).data( data ).enter().append( 'use' )
		.attr( 'href', '#crosshair' )
		.attr( 'transform', d => `translate(${ d[ 1 ] * 125 }, 150) scale(5)` )
		.attr( 'stroke', 'red' )
		.attr( 'stroke-width', d => 0.5 / d[ 1 ] );

}

function makeLines() {

	document.getElementById( 'app' ).innerHTML = `
	<svg width='300px' height='300px' id="makeLines"></svg>
	`;

	function curveHorizontalMedian( context ) {

		return {
			lineStart: function () {

				this.data = [];

			},

			point: function ( x, y ) {

				this.data.push( [ x, y ] );

			},

			lineEnd: function () {

				const yrange = d3.extent( this.data, d => d[ 1 ] );
				const median = d3.median( this.data, d => d[ 0 ] );

				context.moveTo( median, yrange[ 0 ] );
				context.lineTo( median, yrange[ 1 ] );

			}
		};

	}

	function curveLinear( context ) {

		return {

			lineStart: function () {

				this.data = [];

			},

			point: function ( x, y ) {

				this.data.push( [ x, y ] );

			},

			lineEnd: function () {

				const startPoint = this.data[ 0 ];

				context.moveTo( startPoint[ 0 ], startPoint[ 1 ] );
				this.data.forEach( ( point ) => {

					context.lineTo( point[ 0 ], point[ 1 ] );

				} );

			}

		};

	}

	let ds = [[ 1, 1 ], [ 2, 2 ], [ 3, 4 ], [ 4, 4 ], [ 5, 2 ], [ 6, 2 ], [ 7, 3 ], [ 8, 1 ], [ 9, 2 ]];
	const scX = d3.scaleLinear().domain( [ 1, 9 ] ).range( [ 50, 250 ] );
	const scY = d3.scaleLinear().domain( [ 0, 5 ] ).range( [ 175, 25 ] );
	ds = ds.map( d => [ scX( d[ 0 ] ), scY( d[ 1 ] ) ] );

	const svg = d3.select( '#makeLines' );

	svg.selectAll( 'circle' )
	   .data( ds ).enter().append( 'circle' )
	   .attr( 'cx', d => d[ 0 ] ).attr( 'cy', d => d[ 1 ] )
	   .attr( 'r', 3 )
	   .attr( 'fill', 'none' )
	   .attr( 'stroke', 'red' );

	const lineMkr = d3.line().curve( curveHorizontalMedian ); //.defined( ( d, i ) => i % 3 < 2 );
	svg.append( 'g' ).append( 'path' )
		.attr( 'd', lineMkr( ds ) )
		.attr( 'fill', 'none' )
		.attr( 'stroke', 'red' );

}


function makePie() {

	document.getElementById( 'app' ).innerHTML = `
	<svg width='300px' height='300px' style="background: #010515;" id="pie"></svg>
	`;

	const data = [
		{ name: 'Jin', votes: 12 },
		{ name: 'Sue', votes: 5 },
		{ name: 'Bob', votes: 21 },
		{ name: 'Ann', votes: 17 },
		{ name: 'Dan', votes: 3 },
	];

	const pie = d3.pie().value( d => d.votes ).padAngle( 0.05 )( data );

	const arcMkr = d3.arc().innerRadius( 50 ).outerRadius( 150 ).cornerRadius( 10 );

	console.log( arcMkr( pie[ 0 ] ) );

	const scC = d3.scaleOrdinal( d3.schemePastel1 ).domain( pie.map( d => d.index ) );

	const g = d3.select( '#pie' ).append( 'g' ).attr( 'transform', 'translate(150, 150)' );

	g.selectAll( 'path' ).data( pie ).enter()
		.append( 'path' )
		.attr( 'd', d => arcMkr( d ) )
		.attr( 'fill', d => scC( d.index ) );

	g.selectAll( 'text' ).data( pie ).enter().append( 'text' )
		.text( d => d.data.name )
		.attr( 'x', d => arcMkr.innerRadius( 85 ).centroid( d )[ 0 ] )
		.attr( 'y', d => arcMkr.innerRadius( 85 ).centroid( d )[ 1 ] )
		.attr( 'text-anchor', 'middle' )
		.attr( "font-size", 14 );

}

async function useAreaGenerator() {

	// https://observablehq.com/@d3/area-chart

	const data = ( await d3.csv( 'aapl.csv' ) ).data.map( d => ( { date: Date.parse( d.date ), close: Number( d.close ) } ) );
	const range = d3.extent( data, d => d.close );

}

function makeSticker() {

	function sticker( sel, label ) {

		sel.append( 'rect' ).attr( 'rx', 5 ).attr( 'ry', 5 )
			.attr( 'width', 70 ).attr( 'height', 30 )
			.attr( 'x', - 35 ).attr( 'y', - 15 )
			.attr( 'fill', 'none' ).attr( 'stroke', 'blue' )
			.classed( 'frame', true );

		sel.append( 'text' ).attr( 'x', 0 ).attr( 'y', 5 )
			.attr( 'text-anchor', 'middle' )
			.attr( 'font-family', 'sans-serif' ).attr( 'font-size', 14 )
			.classed( 'label', true )
			.text( label ? label : d => d.label );

	}

	document.getElementById( 'app' ).innerHTML = `
	<svg width='300px' height='300px'></svg>
	`;

	const svg = d3.select( 'svg' );

	const data = [
		{ x: 50, y: 50, label: '(50, 50)', color: 'orange' },
		{ x: 150, y: 150, label: '(150, 150)', color: 'green' }
	];

	svg.selectAll( 'g' ).data( data ).enter()
		.append( 'g' ).attr( 'transform', d => `translate(${d.x}, ${d.y})` ).call( sticker );

}

function gameOfLife() {

	/* HTML */
	document.getElementById( 'app' ).innerHTML = `
	<svg width='900px' height='600px'></svg>
	`;

	/* CONSTS */
	const SVG = d3.select( 'svg' );
	const SVG_HEIGHT = SVG.attr( 'height' ).replace( 'px', '' );
	const SVG_WIDTH = SVG.attr( 'width' ).replace( 'px', '' );
	const LIVE_CELL_COLOR = 'yellow';
	const DEAD_CELL_COLOR = 'grey';
	const GRID_COLOR = 'orange';

	/* DATA */
	let canMove = false;
	let game = new GameOfLife();
	game.makeCellAlive( { x: 0, y: 0 } );
	game.makeCellAlive( { x: 0, y: 1 } );
	game.makeCellAlive( { x: 1, y: 1 } );
	game.makeCellAlive( { x: 1, y: 2 } );
	game.makeCellAlive( { x: 2, y: 2 } );
	game.makeCellAlive( { x: 2, y: 3 } );
	//game.makeCellAlive( { x: - 1, y: - 1 } );
	//game.makeCellAlive( { x: 0, y: 3 } );
	let numberOfGenerations = 0;
	let viewRect = new Rect( {
		x: - 15,
		y: - 15,
		width: SVG_WIDTH / SVG_HEIGHT * 30,
		height: 30,
	} );
	const CELL_SIZE = SVG_HEIGHT / 30;
	/*
	!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	!!! 							       !!!
	!!!    ZUMIRANJE NE RADI KAKO TREBA    !!!
	!!!	   DODAJ U RENDER SIRINU CELIJE    !!!
	!!!								       !!!
	!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	*/


	/* FUNCTIONS */
	const render = ( () => {

		let scX = d3.scaleLinear().domain( [ viewRect.x, viewRect.x + viewRect.width ] ).range( [ 0, SVG_WIDTH ] );
		let scY = d3.scaleLinear().domain( [ viewRect.y, viewRect.y + viewRect.height ] ).range( [ SVG_HEIGHT, 0 ] );

		let data = [];
		game.forEachAlive( cordinate => data.push( cordinate ) );

		// Event Listeners
		SVG.on( 'click', ( e ) => {

			let [ x, y ] = d3.pointer( e, SVG.node() );
			x = Math.floor( Number( scX.invert( x ) ) );
			y = Math.floor( Number( scY.invert( y ) ) );
			game.makeCellAlive( { x, y } );
			//debugger;

		} );

		SVG.on( 'mousedown', ( e ) => {

			canMove = true;

		} );
		SVG.on( 'mouseup', ( e ) => {

			canMove = false;

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
			console.log( viewRect );

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

		d3.timer( function ( t ) {

			SVG.selectAll( '.dead-cell' ).each( function () {

				this.bogusOpacity *= 0.925;

			} ).attr( 'opacity', function () {

				return this.bogusOpacity;

			} );

		} );

		let aliveCells = SVG.selectAll( '.alive-cell' );
		let deadCells = SVG.selectAll( '.dead-cell' );
		drawLines();
		return () => {

			// Setup
			const scX = d3.scaleLinear().domain( [ viewRect.x, viewRect.x + viewRect.width ] ).range( [ 0, SVG_WIDTH ] );
			const scY = d3.scaleLinear().domain( [ viewRect.y, viewRect.y + viewRect.height ] ).range( [ SVG_HEIGHT, 0 ] );

			const data = [];
			game.forEachAlive( cordinate => data.push( cordinate ) );

			console.log( data.length );

			const update = SVG.selectAll( '.alive-cell' ).data( data, d => `${d.x}/${d.y}` );
			const enter = update.enter();
			const exit = update.exit();

			enter.append( 'rect' )
				.attr( 'class', 'alive-cell' )
				.attr( 'x', d => scX( d.x ) ).attr( 'y', d => - Number( CELL_SIZE ) + Number( scY( d.y ) ) )
				.attr( 'width', CELL_SIZE )
				.attr( 'height', CELL_SIZE )
				.attr( 'fill', 'red' )
				.attr( 'stroke', 'red' );
			aliveCells = enter.merge( update );


			const deadCells = [];
			SVG.selectAll( '.dead-cell' ).filter( function ( d ) {

				return data.some( ( { x, y } ) => d.x === x && d.y === y );

			} ).remove(); // trenutno mrtve celije
			exit.attr( 'class', 'dead-cell' ).attr( 'fill', 'blue' ).attr( 'opacity', 0.5 ).each( function () {

				this.bogusOpacity = 1.0;

			} );
			// Izbrisi mrtve celije koje su u ovom ciklusu postale zive
			// Dodaj celije koje su umrle

		};

	} )();

	function drawLines() {

		const scX = d3.scaleLinear().domain( [ viewRect.x, viewRect.x + viewRect.width ] ).range( [ 0, SVG_WIDTH ] );
		const scY = d3.scaleLinear().domain( [ viewRect.y, viewRect.y + viewRect.height ] ).range( [ SVG_HEIGHT, 0 ] );


		// Draw Grid Lines
		SVG.selectAll( 'line.horizontalGrid' ).data( scY.ticks( viewRect.height ) ).enter()
			.append( 'line' )
			.attr( 'x1', 0 ).attr( 'y1', d => scY( d ) )
			.attr( 'x2', SVG_WIDTH ).attr( 'y2', d => scY( d ) )
			.attr( 'fill', 'none' )
			.attr( 'stroke', GRID_COLOR )
			.attr( 'stroke-width', 0.2 );
		SVG.selectAll( 'line.horizontalGrid' ).data( scX.ticks( viewRect.width ) ).enter()
			.append( 'line' )
			.attr( 'x1', d => scX( d ) ).attr( 'y1', 0 )
			.attr( 'x2', d => scX( d ) ).attr( 'y2', SVG_HEIGHT )
			.attr( 'fill', 'none' )
			.attr( 'stroke', GRID_COLOR )
			.attr( 'stroke-width', 0.2 );

	}

	function zoomOut() {

		const aspectRatio = viewRect.width / viewRect.height;
		const newHeight = viewRect.height + 1;
		viewRect = new Rect( {
			x: viewRect.x - 1,
			y: viewRect.y - 1,
			width: aspectRatio * newHeight,
			height: newHeight
		} );

	}

	function zoomIn() {

		const aspectRatio = viewRect.width / viewRect.height;
		const newHeight = viewRect.height - 1;
		viewRect = new Rect( {
			x: viewRect.x + 1,
			y: viewRect.y + 1,
			width: aspectRatio * newHeight,
			height: newHeight
		} );

	}

	window.setInterval( () => {

		// clear();
		render();
		//console.log( '---------------------' );
		//game.forEachAlive( cordinate => console.log( cordinate ) );
		game = GameOfLife.next( game );

	}, 100 );

}

gameOfLife();
