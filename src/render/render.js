import * as d3 from "d3";


/*
	!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	!!! 						    	      !!!
	!!!    OPTIMIZACIJA                       !!!
	!!!	   OBRISI NEPOTREBNE RECT ELEMENTE    !!!
	!!!								          !!!
	!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	*/
export default class Renderer {

	constructor( { svg } ) {

		this.svg = svg;
		this.grid_color = 'gray';

	}

	render( game, viewRect ) {


		this.drawLines( viewRect );
		// Setup

		const SVG_WIDTH = this.svg.node().clientWidth;
		const SVG_HEIGHT = this.svg.node().clientHeight;

		const CELL_SIZE = SVG_HEIGHT / viewRect.height;
		const scX = d3.scaleLinear().domain( [ viewRect.left, viewRect.right ] ).range( [ 0, SVG_WIDTH ] );
		const scY = d3.scaleLinear().domain( [ viewRect.bottom, viewRect.top ] ).range( [ SVG_HEIGHT, 0 ] );

		const data = [];
		game.forEachAlive( cordinate => data.push( cordinate ) );

		const update = this.svg.selectAll( '.alive-cell' ).data( data, d => `${d.x}/${d.y}` ).attr( 'width', CELL_SIZE )
			.attr( 'height', CELL_SIZE );
		const enter = update.enter();
		const exit = update.exit();

		update.attr( 'x', d => scX( d.x ) ).attr( 'y', d => - Number( CELL_SIZE ) + Number( scY( d.y ) ) );
		enter.append( 'rect' )
			.attr( 'class', 'alive-cell' )
			.attr( 'x', d => scX( d.x ) ).attr( 'y', d => - Number( CELL_SIZE ) + Number( scY( d.y ) ) )
			.attr( 'width', CELL_SIZE )
			.attr( 'height', CELL_SIZE )
			.attr( 'fill', '#198908' )
			.attr( 'stroke', '#198908' );

		this.svg.selectAll( '.dead-cell' ).attr( 'x', d => scX( d.x ) ).attr( 'y', d => - Number( CELL_SIZE ) + Number( scY( d.y ) ) ).filter( function ( d ) {

			return data.some( ( { x, y } ) => d.x === x && d.y === y );

		} ).remove(); // trenutno mrtve celije
		exit.attr( 'class', 'dead-cell' ).attr( 'fill', '#FA1E61' ).attr( 'opacity', 0.5 )
			.attr( 'x', d => scX( d.x ) ).attr( 'y', d => - Number( CELL_SIZE ) + Number( scY( d.y ) ) )
			.attr( 'width', CELL_SIZE )
			.attr( 'height', CELL_SIZE )
			.each( function () {

				this.bogusOpacity = 0.5;

			} );
		// Izbrisi mrtve celije koje su u ovom ciklusu postale zive
		// Dodaj celije koje su umrle
		this.svg.selectAll( '.dead-cell' ).attr( 'width', CELL_SIZE )
			.attr( 'height', CELL_SIZE );


		// ANIMATE
		this.svg.selectAll( '.dead-cell' ).each( function () {

			this.bogusOpacity *= 0.98;

		} ).attr( 'opacity', function () {

			return this.bogusOpacity;

		} );

		const selection = this.svg.selectAll( '.dead-cell' );
		selection.filter( function () {

			return this.bogusOpacity < 0.001;

		} ).remove();

	}

	drawLines( viewRect ) {

		let SVG_HEIGHT = this.svg.node().clientHeight;
		let SVG_WIDTH = this.svg.node().clientWidth;

		this.svg.selectAll( 'line' ).remove();

		const scX = d3.scaleLinear().domain( [ viewRect.left, viewRect.right ] ).range( [ 0, SVG_WIDTH ] );
		const scY = d3.scaleLinear().domain( [ viewRect.bottom, viewRect.top ] ).range( [ SVG_HEIGHT, 0 ] );


		// Draw Grid Lines
		this.svg.selectAll( 'line.horizontalGrid' ).data( scY.ticks( viewRect.height ) ).enter()
			.append( 'line' )
			.attr( 'x1', 0 ).attr( 'y1', d => scY( d ) )
			.attr( 'x2', SVG_WIDTH ).attr( 'y2', d => scY( d ) )
			.attr( 'fill', 'none' )
			.attr( 'stroke', this.grid_color )
			.attr( 'stroke-width', 0.6 );
		this.svg.selectAll( 'line.horizontalGrid' ).data( scX.ticks( viewRect.width ) ).enter()
			.append( 'line' )
			.attr( 'x1', d => scX( d ) ).attr( 'y1', 0 )
			.attr( 'x2', d => scX( d ) ).attr( 'y2', SVG_HEIGHT )
			.attr( 'fill', 'none' )
			.attr( 'stroke', this.grid_color )
			.attr( 'stroke-width', 0.6 );

	}

}
