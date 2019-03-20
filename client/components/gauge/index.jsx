/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';

/**
 * Style Dependencies
 */
import './style.scss';

export default class extends React.PureComponent {
	static displayName = 'Gauge';

	static propTypes = {
		percentage: PropTypes.number.isRequired,
		width: PropTypes.number,
		height: PropTypes.number,
		colors: PropTypes.array,
		lineWidth: PropTypes.number,
		metric: PropTypes.string.isRequired,
	};

	static defaultProps = {
		width: 118,
		height: 118,
		lineWidth: 9,
		labelSize: 32,
		colors: [ '#e9eff3', '#00aadc' ],
	};

	componentDidUpdate() {
		let canvas = this.refs.canvas,
			ctx = canvas.getContext( '2d' );

		ctx.clearRect( 0, 0, this.props.width, this.props.height );
		this.drawArcs();
	}

	componentDidMount() {
		this.drawArcs();
	}

	drawArcs = () => {
		let canvas = this.refs.canvas,
			x = this.props.width / 2,
			y = this.props.height / 2,
			ctx = canvas.getContext( '2d' ),
			startAngle = 0.8 * Math.PI,
			endAngle = 2.2 * Math.PI,
			valueEndAngle = ( 0.8 + 1.4 * ( this.props.percentage / 100 ) ) * Math.PI,
			radius = x - this.props.lineWidth / 2,
			angleData = [ endAngle, valueEndAngle ];

		angleData.forEach( function( angle, idx ) {
			ctx.beginPath();
			ctx.arc( x, y, radius, startAngle, angle, false );
			ctx.lineWidth = this.props.lineWidth;
			ctx.strokeStyle = this.props.colors[ idx ];
			ctx.lineCap = 'round';
			ctx.stroke();
		}, this );
	};

	render() {
		let wrapperStyles = {
				width: this.props.width,
				height: this.props.height,
			},
			labelStyles = {
				color: this.props.colors[ 1 ],
				fontSize: this.props.labelSize + 'px',
			},
			labelTop,
			label = this.props.percentage + '%';

		// style the label
		labelStyles.color = this.props.colors[ 1 ];
		labelTop = this.props.height / 2 + this.props.labelSize;
		labelStyles.top = '-' + labelTop + 'px';

		return (
			<div className="gauge" style={ wrapperStyles }>
				<canvas ref="canvas" width={ this.props.width } height={ this.props.height } />
				<span className="gauge__label" style={ labelStyles }>
					<span className="gauge__number">{ label }</span>
					<span className="gauge__metric">{ this.props.metric }</span>
				</span>
			</div>
		);
	}
}
