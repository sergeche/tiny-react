'use strict';

const tr = require('../../');

const Foo = tr.component({
    render(props, children) {
        return tr(
            'div',
            { 'class': 'foo' },
            tr(
                'h1',
                null,
                props.title
            ),
            tr(
                Bar,
                { attr: props.bar },
                tr(
                    'p',
                    null,
                    'lorem ipsum'
                )
            )
        );
    }
});

const Bar = tr.component({
    render(props, children) {
        return tr(
            'section',
            { 'class': 'bar' },
            'Attr value is ',
            props.attr,
            children
        );
    }
});

module.exports = props => tr.render(Foo, props);
