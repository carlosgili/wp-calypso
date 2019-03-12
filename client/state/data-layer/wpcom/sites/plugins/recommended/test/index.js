/** @format */
/**
 * Internal Dependencies
 */
import { fetch, onSuccess, onError } from '../';
import { recordTracksEvent } from 'state/analytics/actions';
import { receiveRecommendedPlugins } from 'state/plugins/recommended/actions';

const EXAMPLE_SITE_ID = 77203074;
const LIMIT = 6;

describe( 'fetch', () => {
	it( 'should dispatch two requests: one for tracking and another for recommended plugins list request', () => {
		const output = fetch( { siteId: EXAMPLE_SITE_ID, limit: LIMIT } );
		expect( output ).toEqual(
			expect.arrayContaining( [
				recordTracksEvent( 'calypso_recommended_plugins_requested', {
					site_id: EXAMPLE_SITE_ID,
					limit: LIMIT,
				} ),
				expect.objectContaining( {
					method: 'GET',
					path: `/sites/${ EXAMPLE_SITE_ID }/plugins/recommended`,
					query: { apiNamespace: 'wpcom/v2', limit: LIMIT },
				} ),
			] )
		);
	} );
} );

describe( 'onSuccess', () => {
	test( 'should dispatch two requests: one for tracking and another for emitting the plugins list', () => {
		const data = [
			{
				name: 'Some Plugin',
				rating: 84,
				slug: 'some-plugin',
			},
		];
		const output = onSuccess( { siteId: EXAMPLE_SITE_ID, limit: LIMIT }, data );
		expect( output ).toEqual(
			expect.arrayContaining( [
				recordTracksEvent( 'calypso_recommended_plugins_received', {
					site_id: EXAMPLE_SITE_ID,
					limit: LIMIT,
				} ),
				receiveRecommendedPlugins( EXAMPLE_SITE_ID, data ),
			] )
		);
	} );
} );

describe( 'onError', () => {
	test( 'should dispatch a request to track network request failure', () => {
		const output = onError( { siteId: EXAMPLE_SITE_ID, limit: LIMIT } );
		expect( output ).toEqual(
			expect.arrayContaining( [
				recordTracksEvent( 'calypso_recommended_plugins_error', {
					site_id: EXAMPLE_SITE_ID,
					limit: LIMIT,
				} ),
			] )
		);
	} );
} );
