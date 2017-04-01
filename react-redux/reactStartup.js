import React from 'react';
import {render} from 'react-dom';

setTimeout(() => loadModule({pathname: '/home'}), 2000);

function loadModule(location) {
    let originalModule = location.pathname.replace(/\//g, '').toLowerCase(),
        module = originalModule || 'home';


    let modulePromise = (() => {
        switch(module.toLowerCase()){

            case 'books': return import('./modules/books/books');
            case 'home': return import('./modules/home/home');

        }
    })();

    Promise.all([
        modulePromise
    ]).then(([{ default: moduleObject }, publicUserInfo]) => {
    });
}