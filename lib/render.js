/**
 * Main rendering util: schedules given component re-render on next
 * process tick or animation frame
 */
const vdom = require('virtual-dom');
const main = require('./main-loop');

module.exports = function(component, state) {
    var view = component.__tr && typeof component.__tr.render === 'function'
        ? component.__tr.render
        : component;
    return main(state || {}, view, vdom);
};
