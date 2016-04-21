const { loadBooks, loadSubjects, editSubjectsForBook, addSubjectToBook, loadBooksAndSubjects } = require('../actions/actionCreators');
const { responsiveMobileDesktopMixin } = require('/react-redux/util/responsiveUiLoaders');

import MainNavigationBar from '/react-redux/applicationRoot/rootComponents/mainNavigation';
import * as actionCreators from '../actions/actionCreators';

const { selector } = require('../reducers/reducer');

function BookListLoading() {
    return <div style={{ height: '150' }}>Loading <i className="fa fa-spinner fa-spin"></i></div>
}

function BookListNoResults() {
    return <div style={{ height: '150' }}>No results</div>
}

class BookViewingList extends React.Component {
    constructor(){
        super();

        responsiveMobileDesktopMixin(this, 'listComponent', {
            mobile:  { path: './modules/books/components/bookViewList-mobile', connectWith: selector },
            desktop: { path: './modules/books/components/bookViewList-desktop', connectWith: selector, mapDispatchWith: actionCreators }
        });
    }
    componentDidMount(){
        this.props.dispatch(loadSubjects());
    }
    componentWillReceiveProps(newProps){
        if (newProps.bookSearch.isDirty){
            this.props.dispatch(loadBooks());
        }
    }
    addSubject(subject){
        this.props.dispatch(addSubjectToBook(subject));
    }
    render() {
        return (
            <div>
                <MainNavigationBar isBookList={true}></MainNavigationBar>
                <div className="panel panel-default" style={{ margin: '10' }}>
                    <div className="panel-body" style={{ padding: 0 }}>
                        { !this.state.listComponent
                            ? <BookListLoading />
                            : React.createElement(this.state.listComponent, { addSubject: s => this.addSubject(s) })
                        }
                    </div>
                </div>
                <div className="well well-sm">
                    <img width="16" height="16" src="/static/main-icon.png" />
                    <span>Track my books</span>
                    { this.state.isMobile ?
                        <a onClick={() => this.switchToDesktop()} className="pull-right">Desktop site</a> : null
                    }
                </div>
            </div>
        );
    }
}

module.exports = BookViewingList;