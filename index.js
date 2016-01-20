'use strict';
const h = require('virtual-dom/h');
const component = require('./lib/create-component');
const render = require('./lib/render');

/**
 * Default export is a wrapper for Virtual DOM’s `h` element, used for
 * rendering data
 */
module.exports = function(name, props) {
    var children = Array.prototype.slice.call(arguments, 2);
    if (children.length === 1 && Array.isArray(children[0])) {
        children = children[0];
    }

    if (typeof name === 'function') {
        return name(props, children);
    }

    if (props) {
        let attributes = {};
        let reData = /^data\-/;
        props = Object.keys(props).reduce((r, key) => {
            if (reData.test(key)) {
                attributes[key] = props[key];
            } else {
                r[key] = props[key];
            }
            return r;
        }, {});
        props.attributes = attributes;
    }

    return h(name, props, children);
};

module.exports.component = component;
module.exports.render = render;
