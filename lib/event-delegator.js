/**
 * Delegates events found in given VTree to rendered root view
 */
'use strict';
const extend = require('xtend');
const xpath = require('./xpath');

const supportedEvents = [
    'oncopy', 'oncut', 'onpaste', 'oncompositionend',
    'oncompositionstart', 'oncompositionupdate', 'onkeydown',
    'onkeypress', 'onkeyup', 'onfocus', 'onblur', 'onchange', 'oninput',
    'onsubmit', 'onreset', 'onclick', 'oncontextmenu', 'ondoubleclick', 'ondrag',
    'ondragend', 'ondragenter', 'ondragexit', 'ondragleave', 'ondragover',
    'ondragstart', 'ondrop', 'onmousedown', 'onmouseenter',
    'onmouseleave', 'onmousemove', 'onmouseout', 'onmouseover',
    'onmouseup', 'onselect', 'ontouchcancel', 'ontouchend', 'ontouchmove',
    'ontouchstart', 'onscroll', 'onwheel', 'onabort', 'oncanplay',
    'oncanplaythrough', 'ondurationchange', 'onemptied', 'onencrypted',
    'onended', 'onerror', 'onloadeddata', 'onloadedmetadata',
    'onloadstart', 'onpause', 'onplay', 'onplaying', 'onprogress',
    'onratechange', 'onseeked', 'onseeking', 'onstalled', 'onsuspend',
    'ontimeupdate', 'onvolumechange', 'onwaiting', 'onload', 'onerror'
];

const _nameLookup = supportedEvents.reduce((out, name) => {
    out[name] = true;
    return out;
}, {});

module.exports = function(tree) {
    var xpathMap = createXpathMap(tree);

    // find all unique event names
    var uniqueNames = {};
    Object.keys(xpathMap).forEach(path => {
        Object.keys(xpathMap[path]).forEach(key => uniqueNames[key] = true);
    });
    uniqueNames = Object.keys(uniqueNames);

    return node => {
        var delegator = event => delegateEvent(event, node, xpathMap);
        uniqueNames.forEach(name => node.addEventListener(name, delegator));

        return () => uniqueNames.forEach(name => node.removeEventListener(name, delegator));
    };
};

function createXpathMap(tree) {
    var xpathMap = tree ? flattenTree(tree) : {};
    var rootHandlers = extractHandlers(tree);
    if (rootHandlers) {
        xpathMap['/'] = rootHandlers;
    }
    return xpathMap;
}

function flattenTree(tree, prefix) {
    prefix = prefix || '';
    var nameCount = {};
    var out = {};
    if (tree.children) {
        tree.children.forEach(child => {
            var name = child.tagName;
            if (!name) {
                return;
            }
            if (!(name in nameCount)) {
                nameCount[name] = 0;
            }
            nameCount[name]++;

            var path = `${prefix}/${name}[${nameCount[name]}]`;
            var handlers = extractHandlers(child);
            if (handlers) {
                out[path] = handlers;
            }
            out = extend(out, flattenTree(child, path));
        });
    }
    return out;
}

/**
 * Extracts events from given VTree
 * @param  {VNode} node
 * @return {Object}
 */
function extractHandlers(node) {
    var props = node.properties || {};
    return Object.keys(props).reduce((handlers, name) => {
        let nameLower = name.toLowerCase();
        if (isEvent(nameLower)) {
            if (!handlers) {
                handlers = {};
            }

            if (typeof props[name] === 'function') {
                handlers[nameLower.slice(2)] = props[name];
            }

            delete props[name];
        }
        return handlers;
    }, null);
}


function isEvent(name) {
    return name in _nameLookup;
}

function delegateEvent(event, root, xpathMap) {
    var ctx = event.target;
    var state = {};
    var proxyEvent = {};
    for (let key in event) {
        proxyEvent[key] = event[key];
    }
    proxyEvent.constructor = event.constructor;
    ['preventDefault', 'stopPropagation', 'stopImmediatePropagation'].forEach(fn => {
        proxyEvent[fn] = () => {
            state[fn] = true;
            event[fn]();
        };
    });

    while (ctx) {
        let path = xpath.serialize(ctx, root);
        if (path in xpathMap && event.type in xpathMap[path]) {
            xpathMap[path][event.type].call(ctx, proxyEvent, ctx);
        }
        if (state.stopPropagation || ctx === root) {
            break;
        }
        ctx = ctx.parentNode;
    }
}
