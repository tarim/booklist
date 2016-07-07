import React from 'react';
import { isLoggedIn, goHome } from 'reactStartup';

import {
    Nav,
    Navbar,
    NavItem
} from 'react-bootstrap';

import MainNavigationBar from 'applicationRoot/rootComponents/mainNavigation';

const d3 = require('d3');

const MainHomePane = props =>
    <div className="row">
        <div className="hidden-xs hidden-sm col-md-1 col-lg-3"></div>
        <div style={{ marginLeft: 10, marginRight: 10 }} className="col-md-10 col-lg-6">
            <div className="panel panel-default">
                <div className="panel-body">
                    {props.children}
                </div>
            </div>
        </div>
        <div className="hidden-xs hidden-sm col-md-1 col-lg-3"></div>
    </div>

class HomeIfLoggedIn extends React.Component{
    constructor(){
        super();
        this.state = {};
    }
    render(){
        return (
            <div>
                <MainNavigationBar></MainNavigationBar>
                <MainHomePane>
                    Welcome to <i>My Library</i>.  Eventually there'll be some sort of interesting dashboard here.  Until then, just use the menu above
                    to either view your library, or scan some books in.
                    <br />
                    <br />

                </MainHomePane>
            </div>
        )
    }
}

class HomeIfNotLoggedIn extends React.Component{
    render(){
        return (
            <div>
                <Navbar fluid={true}>
                    <Navbar.Header>
                        <Navbar.Brand>
                            <a style={{ cursor: 'default' }}>My Library</a>
                        </Navbar.Brand>
                        <Navbar.Toggle />
                    </Navbar.Header>
                    <Navbar.Collapse>
                        <Nav>
                            <NavItem href='#login'>Login</NavItem>
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
                <MainHomePane>
                    Welcome to <i>My Library</i>.
                    <br /><br />
                    This site is my own little passion project, the purpose of which is to track your library.  You scan in your books (or manually type in the isbn)
                    and the books' info is fetched from Amazon, and stored for you.  You can then flexibly search and categorize your library.
                    <br /><br />
                    So basically this site is of use to the extremely small percentage of people for whom the following are <i>all</i> true: they read a lot,
                    own the books they read, and read non-eBooks.  As I said, this is more of a passion project than anything.
                    <br /><br />
                    It's free to sign up, and store up to 500 books.  In the remote chance someone actually wants to store more than that, there'll be some sort
                    of nominal fee to help defray storage costs.
                    <br /><br />
                    <a className="btn btn-primary" href="#login">Login or create an account</a>
                </MainHomePane>
            </div>
        )
    }
}

class Home extends React.Component{
    constructor(){
        super();
        this.state = { isLoggedIn: isLoggedIn() };
    }
    render(){
        return (
            <div style={{ paddingLeft: 0, paddingRight: 0 }} className="container-fluid">
                { this.state.isLoggedIn ? <HomeIfLoggedIn /> : <HomeIfNotLoggedIn /> }
            </div>
        );
    }
}

let margin = { top: 30, right: 20, bottom: 30, left: 50 },
    width = 600 - margin.left - margin.right,
    height = 270 - margin.top - margin.bottom;

let parseDate = d3.isoParse;

let x = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]);

let xAxis = d3.axisBottom(x).ticks(5),
    yAxis = d3.axisLeft(y).ticks(5);

let valueLine = d3.line()
                  .x(d => x(d.date))
                  .y(d => y(d.close));

let svg = d3.select('body')
            .append('svg').attr('width', width + margin.left + margin.right)
                          .attr('height', height + margin.top + margin.bottom)
            .append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

let data = [
    { date: '7/1/2016', value: 15 },
    { date: '7/2/2016', value: 19 },
    { date: '7/3/2016', value: 22 },
    { date: '7/4/2016', value: 5 },
    { date: '7/5/2016', value: 55 },
    { date: '7/6/2016', value: 1 }
];

data.forEach(d => {
    d.date = parseDate(d.date);
    d.close = +d.value;
});

x.domain(d3.extent(data, d => d.date));
y.domain([0, d3.max(data, d => d.close)]);

svg.append('path').attr('class', 'line').attr('d', valueLine(data));

svg.append('g').attr('class', 'x axis').attr('transform', `translate(0, ${height})`).call(xAxis);

svg.append('g').attr('class', 'y axis').call(yAxis);



export default Home;