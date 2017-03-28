import React from 'react';
import Loadable from 'react-loadable';

const BookSubjectSetter = Loadable({
    loader: () => import('./bookSubjectSetter'),
    LoadingComponent: () => null,
    delay: 1
});

const BookTagSetter = Loadable({
    loader: () => import('./bookTagSetter'),
    LoadingComponent: () => null,
    delay: 1
});

export default class BookViewingList extends React.Component {
    render() {
        return (
            <div>
                <h1>Books</h1>
            </div>
        );
    }
}