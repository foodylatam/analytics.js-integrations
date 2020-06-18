'use strict';

/**
 * Module dependencies.
 */

var integration = require('@segment/analytics.js-integration');

/**
 * Source.
 */

var src = 'https://cdn2.datagran.io/datagran.js';

/**
 * Expose `Amplitude` integration.
 */

var Datagran = (module.exports = integration('Datagran')
  .readyOnLoad()
  .global('datagran')
  .global('_dgTrack')
  .global('_dgQ')
  .global('dg_tracker')
  .option('AccountId', '')
  .option('WorkspaceId', '')
  .option('Domain', '')
  .option('InternalName', '')

  .tag('<script src="' + src + '" async>'));

/**
 * Initialize.
 *
 * https://github.com/amplitude/Amplitude-Javascript
 *
 * @api public
 */

Datagran.prototype.initialize = function() {
  // datagran snippet (lines loading datagran cdn-served script are removed as that is already achieved via Segment tag and load methods)
  /* eslint-disable */
  window._dgQ = [];

  window.datagran = window.datagran || [];
  window.datagran.aid = this.options.AccountId;
  window.datagran.wid = this.options.WorkspaceId;
  window.datagran.domain = this.options.Domain;
  window.datagran.internal_name = this.options.InternalName;

  window.dgTrack = function(eventName, properties) {
    if (window.dg_tracker && typeof window.dg_tracker === 'object') {
      window.dg_tracker.trackEvent(eventName, properties);
    } else {
      window._dgQ.push([eventName, properties]);
    }
  };
  /* eslint-enable */

  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

Datagran.prototype.loaded = function() {
  return !!(window.dg_tracker && typeof window.dg_tracker === 'object');
};

/**
 * Identify.
 *
 * @api public
 * @param {Facade} identify
 */

Datagran.prototype.identify = function(identify) {
  /* eslint-disable no-undef */
  if (cordova && cordova.plugins.datagran) {
    cordova.plugins.datagran.identify(identify.userId());
  } else {
    window.dgTrack('identify', identify.userId());
  }
  /* eslint-enable no-undef */
};

/**
 * Track.
 *
 * @api public
 * @param {Track} event
 */

Datagran.prototype.track = function(track) {
  /* eslint-disable no-undef */
  if (cordova && cordova.plugins.datagran) {
    var eventInfo = track.properties() || {};
    eventInfo.eventName = track.event();

    cordova.plugins.datagran.trackCustom(eventInfo);
  } else {
    window.dgTrack(track.event(), track.properties());
  }
  /* eslint-enable no-undef */
};
