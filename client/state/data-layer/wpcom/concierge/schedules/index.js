/** @format */

/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import appointments from './appointments';

import { registerHandlers } from 'state/data-layer/handler-registry';

registerHandlers(
	'state/data-layer/wpcom/concierge/schedules/index.js',
	mergeHandlers( appointments )
);

export default {};
