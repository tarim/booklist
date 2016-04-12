const Collapse = ReactBootstrap.Collapse;

class HierarchicalSelectableSubjectItem extends React.Component {
    constructor(){
        super();
        this.state = { childrenVisible: false };
    }
    toggleChildren(){
        this.setState({childrenVisible: !this.state.childrenVisible});
    }
    render(){
        let childrenVisible = this.state.childrenVisible,
            withChildren = this.props.children.length;
        return (
            <div>
                <div key={this.props._id} className="checkbox">
                    <label>
                        <input type="checkbox" checked={this.props.selectedSubjects[this.props._id]} />
                        <span>{this.props.name}</span>
                    </label>
                    { withChildren ? <a onClick={() => this.toggleChildren()}><i className={'fa fa-' + (childrenVisible ? 'angle-double-up' : 'angle-double-down')}></i></a> : null }
                </div>

                { withChildren ?
                    <div>
                    <Collapse in={childrenVisible}>
                        <div>
                            <HierarchicalSelectableSubjectList selectedSubjects={this.props.selectedSubjects} toggleFilteredSubject={this.props.toggleFilteredSubject} subjects={this.props.subjects} subjects={this.props.children} />
                        </div>
                    </Collapse></div> : null }
            </div>
        )
    }
}

class HierarchicalSelectableSubjectList extends React.Component {
    render() {
        return (
            <div>
                { this.props.subjects.map(s => <HierarchicalSelectableSubjectItem selectedSubjects={this.props.selectedSubjects} toggleFilteredSubject={this.props.toggleFilteredSubject} subjects={this.props.subjects} key={s._id} {...s} />) }
            </div>
        )
    }
}

module.exports = HierarchicalSelectableSubjectList;