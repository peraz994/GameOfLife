/**
 * Infinite grid of a live and dead cells.
 * Initialy all cells are dead.
 *
 * Cell cordinate is its lower left corner cordinate.
 */
export class GameOfLife {

	constructor() {

		this.aliveCells = new Set();

	}

	makeCellAlive( { x, y } ) {

		this.aliveCells.add( GameOfLife._serializeCell( { x, y } ) );

	}

	makeCellDead( { x, y } ) {

		this.aliveCells.delete( GameOfLife._serializeCell( { x, y } ) );

	}

	_isCellAlive( { x, y } ) {

		return this.aliveCells.has( GameOfLife._serializeCell( { x, y } ) );

	}

	numberOfAliveNeighbours( { x, y } ) {

		let sum = 0;

		for ( let i = - 1; i <= 1; i ++ ) {

			for ( let j = - 1; j <= 1; j ++ ) {

				sum += this._isCellAlive( { x: x + i, y: y + j } );

			}

		}

		if ( this._isCellAlive( { x, y } ) ) {

			sum -= 1;

		}

		return sum;

	}

	// Call callback for every a live cell.
	// Cell cordinate is passed to callback.
	forEachAlive( callback ) {

		this.aliveCells.forEach( ( serializedCell ) => {

			const cordinates = GameOfLife._deserializeCell( serializedCell );
			callback( cordinates );

		} );

	}

	static _serializeCell( { x, y } ) {

		return `${x};${y}`;

	}

	static _deserializeCell( serializedCell ) {

		const [ x, y ] = serializedCell.split( ';' );
		return { x: Number( x ), y: Number( y ) };

	}

	static next( game ) {

		const newGame = new GameOfLife();

		game.forEachAlive( ( { x, y } ) => {

			// Kepp cell alive or kill it if it should be killed.
			const n = game.numberOfAliveNeighbours( { x, y } );
			if ( n === 2 || n === 3 ) {

				newGame.makeCellAlive( { x, y } );

			} else {

				newGame.makeCellDead( { x, y } );

			}

			// Make dead cell from neighbourhood alive
			// if conditions are meet
			for ( let i = - 1; i <= 1; i ++ ) {

				for ( let j = - 1; j <= 1; j ++ ) {

					if ( i === 0 && j === 0 ) {

						continue;

					}

					if ( game.numberOfAliveNeighbours( { x: x + i, y: y + j } ) === 3 ) {

						newGame.makeCellAlive( { x: x + i, y: y + j } );

					}

				}

			}

		} );

		return newGame;

	}

}
