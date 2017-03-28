import { renderUI, clearUI } from 'applicationRoot/renderUI';
import { createElement } from 'react';


let currentModule;
let currentModuleObject;
let publicUserCache = {};

const validModules = new Set(['books', 'scan', 'home', 'activate', 'view', 'subjects', 'settings']);

loadCurrentModule();
export function loadCurrentModule(){
    loadModule(window.location);
}

function loadModule(location) {
    let originalModule = location.pathname.replace(/\//g, '').toLowerCase(),
        module = originalModule || 'home';

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
    ]).then(([{ default: moduleObject }]) => {
        currentModuleObject = moduleObject;
        renderUI(createElement(moduleObject.component));
    });
}