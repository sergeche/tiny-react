/**
 * Main rendering util: schedules given component re-render on next
 * process tick or animation frame
 */
const vdom = require('virtual-dom');
const main = require('./main-loop');

module.exports = function(component, state) {
    return main(state || {}, component, vdom);
};
