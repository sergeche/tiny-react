/**
 * Creates simplified XPath for given element and finds element by provided XPath
 */
'use strict';

module.exports.serialize = function(elem, root) {
	root = root || elem.ownerDocument;
	var parts = [];
	while (elem && elem !== root) {
		parts.unshift(`${nodeName(elem)}[${samePreviousSiblings(elem).length + 1}]`);
		elem = elem.parentNode;
	}
	return '/' + parts.join('/');
};

module.exports.find = function(xpath, ctx) {
	ctx = ctx || document;
	let parts = xpath.split('/').filter(Boolean);
	while (parts.length) {
		let n = parts.shift().split('[');
		let name = n[0], index = n[1];
		ctx = nodeByIndex(ctx.childNodes, name, parseInt(index, 10));
		if (!ctx) {
			break;
		}
	}
	return ctx;
};

function samePreviousSiblings(elem) {
	let name = nodeName(elem);
	let type = elem.nodeType;
	let result = [];
	while (elem = elem.previousSibling) {
		if (elem.nodeType === type && nodeName(elem) === name) {
			result.push(elem);
		}
	}

	return result;
}

function nodeName(node) {
	// XXX might return different name for different node types
	return node.nodeName;
}

function nodeByIndex(nodeset, name, index) {
	let acc = 0;
	for (let i = 0, il = nodeset.length; i < il; i++) {
		if (nodeName(nodeset[i]) === name && (index === ++acc)) {
			return nodeset[i];
		}
	}
}
