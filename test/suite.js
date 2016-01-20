'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const babel = require('babel-core');
const transformOpts = {
    plugins: [
        ['transform-react-jsx', {pragma: 'tr'}]
    ]
};
const read = file => fs.readFileSync(path.resolve(__dirname, file), 'utf8').trim();

describe('Tiny React', () => {
    it('transform', () => {
        var transformed = babel.transform(read('components/example.js'), transformOpts);
        assert.equal(transformed.code, read('fixtures/code.js'));
    });

    it('render', () => {
        require('babel-register')(transformOpts);
        const component = require('./components/example');
        var rendered = component({
            title: 'Hello world',
            bar: 'this is bar'
        });

        assert.equal(rendered.target.toString(), read('fixtures/result.html'));
    });
});
