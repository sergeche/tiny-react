/**
 * Dependency-free copy of `main-loop` module:
 * https://www.npmjs.com/package/main-loop
 */
'use strict';

const delegateEvents = require('./event-delegator');

module.exports = function(initialState, view, opts) {
	opts = opts || {};
	var currentState = null;
	var create = opts.create;
	var diff = opts.diff;
	var patch = opts.patch;
	var redrawScheduled = false;

	var tree = opts.initialTree || view(initialState);
	var events = delegateEvents(tree);
	var target = opts.target || create(tree, opts);
	var inRenderingTransaction = false;
	var delegator = events(target);

	function update(state) {
		if (inRenderingTransaction) {
			let err = new Error('Unexpected update occurred in loop.\n We are currently rendering a view, you can’t change state right now.');
			err.code = 'EINVALIDUPDATE';
			err.diff = state._diff;
			throw err;
		}

		if (currentState === null && !redrawScheduled) {
			redrawScheduled = true;
			asap(redraw);
		}

		currentState = state;
	}

	function redraw() {
		redrawScheduled = false;
		if (currentState === null) {
			return;
		}

		inRenderingTransaction = true;
		var newTree = view(currentState);
		var events = delegateEvents(tree);

		if (opts.createOnly) {
			inRenderingTransaction = false;
			create(newTree, opts);
		} else {
			var patches = diff(tree, newTree, opts);
			inRenderingTransaction = false;
			target = patch(target, patches, opts);
		}

		tree = newTree;

		delegator();
		delegator = events(target);

		currentState = null;
	}

	return {target, update};
};

function asap(fn) {
	if (typeof requestAnimationFrame === 'function') {
		requestAnimationFrame();
	} else if (typeof process !== undefined && process.nextTick) {
		process.nextTick(fn);
	}
}
