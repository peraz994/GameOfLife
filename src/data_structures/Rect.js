export class Rect {

	constructor( { x, y, height, aspectRatio } ) {

		this.x = x;
		this.y = y;
		this.aspectRatio = aspectRatio;
		this.height = height;

	}

	get width() {

		return this.aspectRatio * this.height;

	}

	get left() {

		return this.x - this.width / 2;

	}

	get right() {

		return this.x + this.width / 2;

	}

	get bottom() {

		return this.y - this.height / 2;

	}

	get top() {

		return this.y + this.height / 2;

	}

	isPointInside( { x, y } ) {

		return ( x >= this.left
                  && x <= this.right
                  && y >= this.bottom
                  && y <= this.top
		);

	}

}

