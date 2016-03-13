/**
 * Main rendering util: schedules given component re-render on next
 * process tick or animation frame
 */
const vdom = require('virtual-dom');
const extend = require('xtend');
const main = require('./main-loop');

module.exports = function(component, state, options) {
    var view = component.__tr && typeof component.__tr.render === 'function'
        ? component.__tr.render
        : component;
    return main(state || {}, view, extend(vdom, options || {}));
};
