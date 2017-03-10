import React, {Component} from 'react';
import {connect} from 'react-redux';

import {NavBar} from 'simple-react-bootstrap';

import {goHome, globalHashManager} from 'reactStartup';

@connect(state => state.app)
export default class MainNavigationBar extends React.Component {
    logout = () => ajaxUtil.post('/react-redux/logout', { }, () => window.location.reload());
    componentDidUpdate(prevProps){
        if (prevProps.module != this.props.module){
            this.el.closeIfOpen();
        }
    }
    render(){
        let { isPublic, publicBooksHeader, publicName, module, isLoggedIn }  = this.props,
            isBookEntry = module == 'scan',
            isBookList = module == 'books',
            isSubjects = module == 'subjects',
            isLoginModule = module == 'authenticate',
            isSettings = module == 'settings';

        return (
            <NavBar ref={el => this.el = el} style={{ borderRadius: 0, borderRight: 0, borderLeft: 0, borderTop: 0, position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500 }}>
                <NavBar.Header>
                    <NavBar.Brand>
                        <a className="navbar-brand" onClick={goHome} style={{ cursor: 'pointer' }}>
                            <img height="32" width="32" style={{display: 'inline-block',  marginTop: '-5px'}} src="static/main-icon2.png" />
                            <span style={{display: 'inline-block', verticalAlign: 'top', marginLeft: '5px'}}>My Library</span>
                        </a>
                    </NavBar.Brand>
                    <NavBar.Toggle />
                </NavBar.Header>
                <NavBar.Nav>
                    {isLoggedIn || isPublic ? <NavBar.Item disabled={isPublic} active={isBookEntry} href={isBookEntry ? undefined : '#scan'}>Book entry</NavBar.Item> : null}
                    {isLoggedIn || isPublic ? <NavBar.Item active={isBookList} href={isBookList ? undefined : '#books'}>{isPublic ? (publicBooksHeader || (`${publicName}'s Books`)) : 'Books'}</NavBar.Item> : null}
                    {isLoggedIn || isPublic ? <NavBar.Item disabled={isPublic} active={isSubjects} href={isSubjects ? undefined : '#subjects'}>Subjects</NavBar.Item> : null}
                    {isLoggedIn && isPublic ? <NavBar.Item href="#books">View your collection</NavBar.Item> : null}
                    {isLoggedIn || isPublic ? <NavBar.Item disabled={isPublic} active={isSettings} href={isSettings ? undefined : '#settings'}>Settings</NavBar.Item> : null}
                    {!isLoggedIn && !isLoginModule ? <NavBar.Item href='#login'>Login</NavBar.Item> : null}
                </NavBar.Nav>
                {isLoggedIn ? 
                    <NavBar.Nav className='pull-right'>
                        <NavBar.Item className="pull-right" onClick={this.logout}>Logout</NavBar.Item>
                    </NavBar.Nav> : null
                }
            </NavBar>
        );
    }
}