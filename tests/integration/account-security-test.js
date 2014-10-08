import startApp from '../helpers/start-app';
import fixturesAdapter from "../helpers/fixtures-adapter";
import sinonRestore from "../helpers/sinon-restore";

import helpers from "../helpers/helpers";
import checkElements from "../helpers/check-elements";

var App, Auth;

module('Integration - Account Security', {
	setup: function() {
		App = startApp({
			ADAPTER: fixturesAdapter
		});
		Auth = App.__container__.lookup("auth:main");
	},
	teardown: function() {
		sinonRestore(Auth.request);
		Ember.run(App, "destroy");
	},
});

test('Can enable', function() {
	var spy = sinon.stub(Auth, 'request')
		.returns(Ember.RSVP.resolve({
			id: "USxxxxxxxxxxxxxxx",
			secret: "VERYSECRET",
			secret_uri: "otpauth://xxxxxxxxxxxxxxxxxxxxxxx"
		}));

	visit('/security')
		.check({
			"h1.page-title": "Account Security",
			"#account_security.disabled": 1,
			".status-circle:visible": 2,
			".window-pane:visible": 0,
		})
		.click('.status-circle.green a')
		.then(function() {
			equal(spy.callCount, 1, 'Enabled');
		});
});

test('Can disable', function() {
	var spy = sinon.stub(Auth, 'request').returns(Ember.RSVP.resolve());

	Auth.set('user.otp_enabled', true);

	visit('/security')
		.checkElements({
			"h1.page-title": 'Account Security',
			"#account_security.enabled": 1,
			".status-circle:visible": 2,
			".window-pane:visible": 0
		})
		.click('.status-circle.red a')
		.checkElements({
			'#disable-mfa:visible': 1
		})
		.click('#disable-mfa button[name=modal-submit]')
		.then(function() {
			equal(spy.callCount, 1, 'Disabled');
		});
});
