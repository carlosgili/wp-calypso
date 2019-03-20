/** @format */
/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */

const Placeholder = ( { isLoading = false } ) => (
	<div className={ classnames( 'import-url-site-preview__placeholder-container', { 'is-loading': isLoading } ) }>
		<div className="import-url-site-preview__placeholder-block">
		</div>
		<div className="import-url-site-preview__placeholder-block">
		</div>
		<div className="import-url-site-preview__placeholder-block">
		</div>
	</div>
);

export default Placeholder;