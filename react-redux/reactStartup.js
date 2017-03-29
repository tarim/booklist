import { renderUI, clearUI } from 'applicationRoot/renderUI';
import { store, getNewReducer } from 'applicationRoot/store';
import { createElement } from 'react';
import queryString from 'query-string';

import {setDesktop, setMobile, setModule, setLoggedIn, setPublicInfo, setRequestDesktop, setIsTouch} from './applicationRoot/rootReducerActionCreators';
import 'util/ajaxUtil';

import createHistory from 'history/createBrowserHistory';

if ('ontouchstart' in window || 'onmsgesturechange' in window){
    store.dispatch(setIsTouch(true));
}

try {
    var desktopRequested = !!localStorage.getItem('useDesktop');
} catch(x){ }

if (window.screen.width < 700) {
    store.dispatch(setMobile());
} else {
    store.dispatch(setDesktop());
}

if (desktopRequested){
    store.dispatch(setRequestDesktop());
}

let currentModule;
let currentModuleObject;
let publicUserCache = {};

const history = createHistory()
export {history};

const validModules = new Set(['books', 'scan', 'home', 'activate', 'view', 'subjects', 'settings']);
let initial = true;
const unlisten = history.listen((location, action) => {
  // location is an object like window.location 
  loadModule(location);
});
loadCurrentModule();

export function loadCurrentModule(){
    loadModule(history.location);
}

function loadModule(location) {
    let originalModule = location.pathname.replace(/\//g, '').toLowerCase(),
        module = originalModule || 'home',
        publicModule = module === 'view' || module == 'activate';

    let {logged_in, userId: currentUserId} = isLoggedIn(),
        loggedIn = logged_in && currentUserId;

    if (!loggedIn && !publicModule){
        if (originalModule && module != 'home'){
            module = 'authenticate';
        } else {
            module = 'home';
        }
    } else {
        if (!validModules.has(module)){
            history.push('/books');
            return;
        }
    }

    if (loggedIn){
        store.dispatch(setLoggedIn(currentUserId));
    }

    if (publicModule){
        var userId = getCurrentHistoryState().searchState.userId;

        //switching to a new public viewing - reload page
        if (!initial && store.getState().app.publicUserId != userId){
            window.location.reload();
            return;
        }

        var publicUserPromise = userId ? (publicUserCache[userId] || (publicUserCache[userId] = fetchPublicUserInfo(userId))) : null;

        if (module === 'view') {
            module = 'books';
        }
    } else if (store.getState().app.publicUserId){
        //leaving public viewing - reload page
        window.location.reload();
        return;
    }

    initial = false;

    if (module === currentModule) {
        return;
    }
    currentModule = module;

    let modulePromise = (() => {
        switch(module.toLowerCase()){
            case 'activate': return import('./modules/activate/activate');
            case 'authenticate': return import('./modules/authenticate/authenticate');
            case 'books': return import('./modules/books/books');
            case 'home': return import('./modules/home/home');
            case 'scan': return import('./modules/scan/scan');
            case 'subjects': return import('./modules/subjects/subjects');
            case 'settings': return import('./modules/settings/settings');
        }
    })();

    Promise.all([
        modulePromise,
        publicUserPromise
    ]).then(([{ default: moduleObject }, publicUserInfo]) => {
        if (currentModule != module) return;
        
        currentModuleObject = moduleObject;
        store.dispatch(setModule(currentModule));

        if (publicUserInfo){
            store.dispatch(setPublicInfo({...publicUserInfo, userId}));
        }

        if (moduleObject.reducer) {
            getNewReducer({name: moduleObject.name, reducer: moduleObject.reducer, initialize: moduleObject.initialize});
        }
        renderUI(createElement(moduleObject.component));
    });
}

export function isLoggedIn(){
    let logged_in = getCookie('logged_in'),
        userId = getCookie('userId');
    return {logged_in, userId};
}

function getCookie(name) {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=')
    return parts[0] === name ? decodeURIComponent(parts[1]) : r
  }, '')
}

export function goto(module, search){
    if (currentModule !== module) {
        history.push({pathname: `/${module}`, search: search || undefined});
    }
}

export function getCurrentHistoryState(){
    let location = history.location;
    return {
        pathname: location.pathname,
        searchState: queryString.parse(location.search)
    };
}

export function setSearchValues(state){
    let {pathname, searchState: existingSearchState} = getCurrentHistoryState();
    let newState = {...existingSearchState, ...state};
    newState = Object.keys(newState).filter(k => newState[k]).reduce((hash, prop) => (hash[prop] = newState[prop], hash), {});

    history.push({
        pathname: history.location.pathname, 
        search: queryString.stringify(newState)
    });
}

function fetchPublicUserInfo(userId){
    return new Promise((res, rej) => {
        ajaxUtil.post('/user/getPubliclyAvailableUsersName', { _id: userId }, resp => {
            res({...resp})
        })
    });
}