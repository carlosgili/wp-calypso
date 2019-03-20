/** @format */
/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { flow, get, invoke, isEmpty, isEqual, pickBy, trim } from 'lodash';
import url from 'url';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import ExampleDomainBrowser from 'components/domains/example-domain-browser';
import ExternalLink from 'components/external-link';
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import FormButton from 'components/forms/form-button';
import FormInputValidation from 'components/forms/form-input-validation';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import ScreenReaderText from 'components/screen-reader-text';
import { infoNotice, removeNotice } from 'state/notices/actions';
import {
	fetchIsSiteImportable,
	setImportOriginSiteDetails,
	setNuxUrlInputValue,
} from 'state/importer-nux/actions';
import {
	getNuxUrlError,
	getNuxUrlInputValue,
	getSiteDetails,
	isUrlInputDisabled,
} from 'state/importer-nux/temp-selectors';
import { validateImportUrl } from 'lib/importers/url-validation';
import { recordTracksEvent } from 'state/analytics/actions';
import {
	SITE_IMPORTER_ERR_BAD_REMOTE,
	SITE_IMPORTER_ERR_INVALID_URL,
} from 'lib/importers/constants';
import { prefetchmShotsPreview } from 'my-sites/importer/site-importer/site-preview-actions';
import { loadmShotsPreview } from 'my-sites/importer/site-importer/site-preview-actions';

import Placeholder from './placeholder';

const CHECKING_SITE_IMPORTABLE_NOTICE = 'checking-site-importable';
const IMPORT_HELP_LINK = 'https://en.support.wordpress.com/import/';
const EXAMPLE_WIX_URL = 'https://username.wixsite.com/my-site';

class ImportUrlSitePreview extends Component {
	state = {
		// Url message could be client-side validation or server-side error.
		showUrlMessage: false,
		urlValidationMessage: '',
		loadingPreviewImage: false,
		sitePreviewImage: false,
		sitePreviewFailed: false,
		previewUrl: "https://smt593.wixsite.com/wowz/static-page",
	};

	render() {
		const { isLoading, imageSrc, translate, targetSiteUrl } = this.props;

		return (
			<div className="import-url-site-preview">
				{
					imageSrc ? (
						<img
							className="import-url-site-preview__body"
							src={ imageSrc }
							alt={ `Preview Screenshot of ${ targetSiteUrl }` }
						/>
					) : (
						<Placeholder isLoading={ isLoading } />
					)
				}
			</div>
		);
	}
}

export default flow(
	connect(
		state => ( {
			isSiteImportableError: getNuxUrlError( state ),
			urlInputValue: getNuxUrlInputValue( state ),
			siteDetails: getSiteDetails( state ),
		} ),
		{
			fetchIsSiteImportable,
			setNuxUrlInputValue,
			setImportOriginSiteDetails,
			recordTracksEvent,
			infoNotice,
			removeNotice,
		}
	),
	localize
)( ImportUrlSitePreview );
