'use strict';

var Analytics = require('@segment/analytics.js-core').constructor;
var integration = require('@segment/analytics.js-integration');
var sandbox = require('@segment/clear-env');
var tester = require('@segment/analytics.js-integration-tester');
var Datagran = require('../lib/');

describe('Datagran', function() {
  var analytics;
  var datagran;
  var cordova;
  var options = {
    AccountId: '5ee3aad230e5afc2eb5ccc73',
    WorkspaceId: '5eb4731b0b7fb8952619e25c',
    Domain: 'foody.meteorapp.com',
    InternalName: 'Pixel_Test'
  };

  beforeEach(function() {
    analytics = new Analytics();
    datagran = new Datagran(options);
    analytics.use(Datagran);
    analytics.use(tester);
    analytics.add(datagran);
  });

  afterEach(function() {
    analytics.restore();
    analytics.reset();
    datagran.reset();
    sandbox();
  });

  it('should have the right settings', function() {
    analytics.compare(
      Datagran,
      integration('Datagran')
        .global('datagran')
        .global('_dgTrack')
        .global('_dgQ')
        .global('dg_tracker')
        .option('AccountId', '')
        .option('WorkspaceId', '')
        .option('Domain', '')
        .option('InternalName', '')
    );
  });

  describe('before loading', function() {
    beforeEach(function() {
      analytics.stub(datagran, 'load');
    });

    describe('#initialize', function() {
      it('should create window.dg_tracker', function() {
        analytics.assert(!window.dg_tracker);
        analytics.initialize();
        analytics.page();
        analytics.assert(window.dg_tracker);
      });

      it('should call #load', function() {
        analytics.initialize();
        analytics.page();
        analytics.called(datagran.load);
      });
    });
  });

  describe('loading', function() {
    it('should load', function(done) {
      analytics.load(datagran, done);
    });
  });

  describe('after loading', function() {
    beforeEach(function(done) {
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });

    it('should inject a tag', function() {
      var tag = datagran.templates.library;

      analytics.equal(tag.type, 'script');
      analytics.equal(tag.attrs.src, 'https://cdn2.datagran.io/datagran.js');
    });

    describe('#identify on web', function() {
      beforeEach(function() {
        analytics.stub(window.dg_tracker, 'trackEvent');
      });

      it('should send an id', function() {
        analytics.identify('id1234');
        analytics.called(window.dg_tracker.trackEvent, 'identify', 'id1234');
      });
    });

    describe('#identify on hybrid', function() {
      beforeEach(function() {
        analytics.stub(cordova.plugins.datagran, 'identify');
      });

      it('should send an id to SDK', function() {
        analytics.identify('id1234');
        analytics.called(cordova.plugins.datagran.identify, 'id1234');
      });
    });

    describe('#track on web', function() {
      beforeEach(function() {
        analytics.stub(window.dg_tracker, 'trackEvent');
      });

      it('should send an event', function() {
        analytics.track('event');
        analytics.called(window.dg_tracker.trackEvent, 'event', {});
      });

      it('should send an event and properties', function() {
        analytics.track('One event name', { property: true });
        analytics.called(window.dg_tracker.trackEvent, 'One event name', {
          property: true
        });
      });
    });

    describe('#track on hybrid', function() {
      beforeEach(function() {
        analytics.stub(cordova.plugins.datagran, 'trackCustom');
      });

      it('should send an event to SDK', function() {
        analytics.track('event');
        analytics.called(cordova.plugins.datagran.trackCustom, {
          eventName: 'event'
        });
      });

      it('should send an event and properties to SDK', function() {
        analytics.track('One event name', { property: true });
        analytics.called(cordova.plugins.datagran.trackCustom, {
          eventName: 'event',
          property: true
        });
      });
    });
  });
});
