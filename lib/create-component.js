/**
 * A factory method for creating Tiny React renderable components
 */
'use strict';

module.exports = function(data) {
    data = data || {};
    if (typeof data.render !== 'function') {
        throw new Error('The "render" property of component is not defined or not a function');
    }

    // create a copy object with bound methods
    var component = Object.create(data);
    Object.keys(data).forEach(key => {
        if (typeof data[key] === 'function') {
            component[key] = data[key].bind(data);
        }
    });

    return component.render;
};
