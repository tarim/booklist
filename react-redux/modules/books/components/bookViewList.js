import React from 'react';

import Loading from 'applicationRoot/components/loading';
import Loadable from 'react-loadable';


const ManualBookEntry = Loadable({
    loader: () => import('applicationRoot/components/manualBookEntry'),
    LoadingComponent: Loading,
    delay: 1
});

const BookSubjectSetter = Loadable({
    loader: () => import('./bookSubjectSetter'),
    LoadingComponent: Loading,
    delay: 1
});

const BookTagSetter = Loadable({
    loader: () => import('./bookTagSetter'),
    LoadingComponent: Loading,
    delay: 1
});

const SubjectEditModal = Loadable({
    loader: () => import('./subjectEditModal'),
    LoadingComponent: Loading,
    delay: 1
});

const TagEditModal = Loadable({
    loader: () => import('./tagEditModal'),
    LoadingComponent: Loading,
    delay: 1
});

const BookSearchModal = Loadable({
    loader: () => import('./bookSearchModal'),
    LoadingComponent: Loading,
    delay: 1
});


@connect(selector, { ...actionCreatorsEditBook, ...actionCreatorsSearch })
export default class BookViewingList extends React.Component {
    render() {
        let editingBook = this.props.editingBook,
            dragTitle = editingBook ? `Click or drag to upload a ${editingBook.smallImage ? 'new' : ''} cover image.  The uploaded image will be scaled down as needed` : '';

        return (
            <div>
                <div className="panel panel-default" style={{ margin: '10px' }}>
                    <BooksMenuBar />

                    <div className="panel-body" style={{ padding: 0, minHeight: 450, position: 'relative' }}>
                        {this.props.booksLoading || !this.props.subjectsLoaded || !this.props.tagsLoaded ?
                            <Loading /> : null }

                        {(!this.props.books.length && !this.props.booksLoading) ?
                            <div className="alert alert-warning" style={{borderLeftWidth: 0, borderRightWidth: 0, borderRadius: 0}}>
                                No books found
                            </div> : null }

                        {this.props.subjectsLoaded && this.props.tagsLoaded ?
                            (this.props.isGridView ? <GridView />
                                : this.props.isBasicList ? <BasicListView />
                                : null) : null }

                        {this.props.isEditingBook ? 
                            <ManualBookEntry
                                title={editingBook ? `Edit ${editingBook.title}` : ''}
                                dragTitle={dragTitle}
                                bookToEdit={editingBook}
                                isOpen={this.props.isEditingBook}
                                isSaving={this.props.editingBookSaving}
                                isSaved={this.props.editingBookSaved}
                                saveBook={book => this.props.saveEditingBook(book)}
                                saveMessage={'Saved'}
                                onClosing={this.props.stopEditingBook} /> : null
                        }
                        
                    </div>
                </div>
                <br />
                <br />

                {this.props.subjectsBooksModifyingCount ? <BookSubjectSetter /> : null}
                {this.props.tagsBooksModifyingCount ? <BookTagSetter /> : null}

                {this.props.subjectEditModalOpen ? <SubjectEditModal /> : null}
                {this.props.tagEditModalOpen ? <TagEditModal /> : null}
                {this.props.editingBookSearchFilters ? <BookSearchModal /> : null}
            </div>
        );
    }
}