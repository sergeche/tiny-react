/**
 * Main rendering util: schedules given component re-render on next
 * process tick or animation frame
 */
const vdom = require('virtual-dom');
const main = require('./main-loop');

module.exports = function(component, state) {
    var view = typeof component.__tr__render === 'function'
        ? component.__tr__render
        : component;
    return main(state || {}, view, vdom);
};
