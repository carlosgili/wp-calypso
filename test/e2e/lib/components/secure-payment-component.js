/** @format */

import { By, promise } from 'selenium-webdriver';
import config from 'config';

import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper.js';
import { currentScreenSize } from '../driver-manager';

export default class SecurePaymentComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super(
			driver,
			By.css( '.checkout__secure-payment-form,.secure-payment-form' ),
			null,
			2 * config.get( 'explicitWaitMS' )
		);
		this.paymentButtonSelector = By.css(
			'.credit-card-payment-box button.is-primary:not([disabled])'
		);
		this.personalPlanSlug = 'personal-bundle';
		this.premiumPlanSlug = 'value_bundle';
		this.businessPlanSlug = 'business-bundle';
		this.dotLiveDomainSlug = 'dotlive_domain';
		this.cartTotalSelector = By.css( '.cart__total-amount,.cart-total-amount' );
	}

	async _postInit() {
		// This is to wait for products to settle down during sign up see - https://github.com/Automattic/wp-calypso/issues/24579
		return await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			this.paymentButtonSelector,
			this.explicitWaitMS
		);
	}

	async enterTestCreditCardDetails( {
		cardHolder,
		cardNumber,
		cardExpiry,
		cardCVV,
		cardCountryCode,
		cardPostCode,
	} ) {
		// This PR introduced an issue with older browsers, specifically IE11:
		//   https://github.com/Automattic/wp-calypso/pull/22239
		const pauseBetweenKeysMS = 1;

		await driverHelper.setWhenSettable( this.driver, By.id( 'name' ), cardHolder, {
			pauseBetweenKeysMS: pauseBetweenKeysMS,
		} );
		await driverHelper.setWhenSettable( this.driver, By.id( 'number' ), cardNumber, {
			pauseBetweenKeysMS: pauseBetweenKeysMS,
		} );
		await driverHelper.setWhenSettable( this.driver, By.id( 'expiration-date' ), cardExpiry, {
			pauseBetweenKeysMS: pauseBetweenKeysMS,
		} );
		await driverHelper.setWhenSettable( this.driver, By.id( 'cvv' ), cardCVV, {
			pauseBetweenKeysMS: pauseBetweenKeysMS,
		} );
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `div.country select option[value="${ cardCountryCode }"]` )
		);
		return await driverHelper.setWhenSettable( this.driver, By.id( 'postal-code' ), cardPostCode, {
			pauseBetweenKeysMS: pauseBetweenKeysMS,
		} );
	}

	async submitPaymentDetails() {
		const disabledPaymentButton = By.css( '.credit-card-payment-box button[disabled]' );

		await driverHelper.waitTillNotPresent( this.driver, disabledPaymentButton );
		return await driverHelper.clickWhenClickable( this.driver, this.paymentButtonSelector );
	}

	async waitForCreditCardPaymentProcessing() {
		return await driverHelper.waitTillNotPresent(
			this.driver,
			By.css( '.credit-card-payment-box__progress-bar' ),
			this.explicitWaitMS * 5
		);
	}

	async waitForPageToDisappear() {
		return await driverHelper.waitTillNotPresent(
			this.driver,
			this.expectedElementSelector,
			this.explicitWaitMS * 5
		);
	}

	async getProductsNames() {
		const selector = By.css( '.product-name' );
		return await this.driver
			.findElements( selector )
			.then( products => promise.fullyResolved( products.map( e => e.getText() ) ) );
	}

	async numberOfProductsInCart() {
		let elements = await this.driver.findElements( By.css( '.product-name' ) );
		return elements.length;
	}

	async containsPersonalPlan() {
		return await this._cartContainsProduct( this.personalPlanSlug );
	}

	async containsPremiumPlan() {
		return await this._cartContainsProduct( this.premiumPlanSlug );
	}

	async containsBusinessPlan() {
		return await this._cartContainsProduct( this.businessPlanSlug );
	}

	async containsDotLiveDomain() {
		return await this._cartContainsProduct( this.dotLiveDomainSlug );
	}

	async payWithStoredCardIfPossible( cardCredentials ) {
		const storedCardSelector = By.css( '.stored-card' );
		if ( await driverHelper.isEventuallyPresentAndDisplayed( this.driver, storedCardSelector ) ) {
			await driverHelper.clickWhenClickable( this.driver, storedCardSelector );
		} else {
			await this.enterTestCreditCardDetails( cardCredentials );
		}

		return await this.submitPaymentDetails();
	}

	async toggleCartSummary() {
		// Mobile
		if ( currentScreenSize() === 'mobile' ) {
			return await driverHelper.clickWhenClickable(
				this.driver,
				By.css( '.checkout__summary-toggle' )
			);
		}
	}

	async clickCouponButton() {
		// If we're on desktop
		if ( currentScreenSize() !== 'mobile' ) {
			return await driverHelper.clickWhenClickable(
				this.driver,
				By.css( '.cart__coupon button.cart__toggle-link' )
			);
		}

		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.payment-box__content .cart__coupon button.cart__toggle-link' )
		);
	}

	async cartTotalAmount() {
		let cartElement = await this.driver.findElement( this.cartTotalSelector );

		if ( currentScreenSize() === 'mobile' ) {
			await driverHelper.scrollIntoView( this.driver, this.cartTotalSelector );
		}

		await driverHelper.waitTillPresentAndDisplayed( this.driver, this.cartTotalSelector );
		let cartText = await cartElement.getText();

		// We need to remove the comma separator first, e.g. 1,024 or 2,048, so `match()` can parse out the whole number properly.
		let amountMatches = cartText.replace( /,/g, '' ).match( /\d+\.?\d*/g );
		return await parseFloat( amountMatches[ 0 ] );
	}

	async applyCoupon() {
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'button[data-e2e-type="apply-coupon"]' )
		);
		return await driverHelper.clickWhenClickable( this.driver, By.css( '.notice__dismiss' ) );
	}

	async enterCouponCode( couponCode ) {
		await this.clickCouponButton();
		await driverHelper.setWhenSettable(
			this.driver,
			By.css( 'input[data-e2e-type="coupon-code"]' ),
			couponCode
		);
		return await this.applyCoupon();
	}

	async hasCouponApplied() {
		return await driverHelper.isElementPresent( this.driver, By.css( '.cart__remove-link' ) );
	}

	async removeCoupon() {
		// Desktop
		if ( currentScreenSize() !== 'mobile' ) {
			return await driverHelper.clickWhenClickable( this.driver, By.css( '.cart__remove-link' ) );
		}

		// Mobile
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.payment-box__content .cart__remove-link' )
		);
	}
	async removeFromCart() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'button.cart__remove-item' )
		);
	}

	async cartTotalDisplayed() {
		await driverHelper.waitTillPresentAndDisplayed( this.driver, this.cartTotalSelector );
		return await this.driver.findElement( this.cartTotalSelector ).getText();
	}

	async paymentButtonText() {
		await driverHelper.waitTillPresentAndDisplayed( this.driver, this.paymentButtonSelector );
		await driverHelper.scrollIntoView( this.driver, this.paymentButtonSelector );
		return await this.driver.findElement( this.paymentButtonSelector ).getText();
	}

	async _cartContainsProduct( productSlug, expectedQuantity = 1 ) {
		await driverHelper.waitTillPresentAndDisplayed( this.driver, By.css( '.product-name' ) );
		let elements = await this.driver.findElements(
			By.css( `.product-name[data-e2e-product-slug="${ productSlug }"]` )
		);
		return elements.length === expectedQuantity;
	}
}
