'use strict';
const tr = require('../../');

const Foo = tr.component({
    render(props, children) {
        return <div class="foo">
            <h1>{props.title}</h1>
            <Bar attr={props.bar}>
                <p>lorem ipsum</p>
            </Bar>
        </div>
    }
});

const Bar = tr.component({
    render(props, children) {
        return <section class="bar">
            Attr value is {props.attr}
            {children}
        </section>;
    }
});

module.exports = (props) => tr.render(Foo, props);
