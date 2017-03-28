import React, { Component } from 'react';
import {connect} from 'react-redux';
import classNames from 'classnames';

import PasswordReset from './passwordReset/main';

export default class PublicUserSettingsMain extends Component {
    state = {currentTab: 'publicSettings'};
    setTab = tab => this.setState({currentTab: tab});
    render() {
        return (
            <div style={{ margin: '10px', padding: '10px' }}>
            </div>
        );
    }
}