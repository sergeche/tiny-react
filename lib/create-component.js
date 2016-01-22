/**
 * A factory method for creating Tiny React renderable components
 */
'use strict';

const extend = require('xtend');

module.exports = function(data) {
    data = data || {};
    if (typeof data.render !== 'function') {
        throw new Error('The "render" property of component is not defined or not a function');
    }

    // create a copy object with bound methods
    var component = {};
    Object.keys(data).forEach(key => {
        if (typeof data[key] === 'function') {
            component[key] = data[key].bind(data);
        } else {
            component[key] = data[key];
        }
    });

    var mixins = Array.prototype.slice.call(arguments, 1);
    component = mixins.reduce((r, mixin) => typeof mixin === 'function' ? mixin(r) : extend(r, mixin), component);

    component.__tr = {};

    // return component renderer
    var renderer = function(props) {
        var children = Array.prototype.slice.call(arguments, 1);
        if (children.length === 1 && Array.isArray(children[0])) {
            children = children[0];
        }

        return renderComponent(component, props, children);
    };
    renderer.component = component;
    return renderer;
};


function renderComponent(component, props, children) {
    // Component render life cycle:
    // 1. Check if we should update component
    // 2. If this is the first render pass, call `willMount`
    // 3. Invoke `willUpdate` method, which may act as a reducer for given props
    // 4. Render component
    // 5. Invoke `didUpdate` with rendered result and props
    // 6. If this is the first render pass, call `didMount`
    let isMounted = !!component.__tr.lastRendered;
    if (isFn(component.shouldUpdate) && component.shouldUpdate(props, children) === false) {
        return component.__tr.lastRendered;
    }

    if (isFn(component.willMount) && !isMounted) {
        component.willMount(props, children);
    }

    if (isFn(component.willUpdate)) {
        let result = component.willUpdate(props);
        if (result != null) {
            props = result;
        }
    }

    component.__tr.lastRendered = component.render(props, children);

    if (isFn(component.didUpdate)) {
        component.didUpdate(props, children);
    }

    if (isFn(component.didMount) && !isMounted) {
        component.didMount(props, children);
    }

    return component.__tr.lastRendered;
}

function isFn(obj) {
    return typeof obj === 'function';
}
