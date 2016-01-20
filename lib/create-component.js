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
    var component = Object.create(data);
    Object.keys(data).forEach(key => {
        if (typeof data[key] === 'function') {
            component[key] = data[key].bind(data);
        }
    });

    var mixins = Array.prototype.slice.call(arguments, 1);
    component = mixins.reduce((r, mixin) => typeof mixin === 'function' ? mixin(r) : extend(r, mixin), component);

    component.__tr__render = (props, children) => renderComponent(component, props, children);
    component.getDOMNode = () => component.__tr__lastRendered;

    return component;
};


function renderComponent(component, props, children) {
    console.log('render component', component);
    // Component render life cycle:
    // 1. Check if we should update component
    // 2. If this is the first render pass, call `willMount`
    // 3. Invoke `willUpdate` method, which may act as a reducer for given props
    // 4. Render component
    // 5. Invoke `didUpdate` with rendered result and props
    // 6. If this is the first render pass, call `didMount`
    if (isFn(component.shouldUpdate) && component.shouldUpdate(props, children) === false) {
        return component.__tr__lastRendered;
    }

    if (isFn(component.willMount) && !component.__tr__lastRendered) {
        component.willMount(props, children);
    }

    if (isFn(component.willUpdate)) {
        let result = component.willUpdate(props);
        if (result != null) {
            props = result;
        }
    }

    let output = component.render(props, children);
    if (isFn(component.didUpdate)) {
        component.didUpdate(output, props, children);
    }

    if (isFn(component.didMount) && !component.__tr__lastRendered) {
        component.didMount(output, props, children);
    }

    return component.__tr__lastRendered = output;
}

function isFn(obj) {
    return typeof obj === 'function';
}
