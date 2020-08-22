import React from 'react';
import {
    Link,
    useLocation
} from "react-router-dom";
import {routes} from "./routes";

function Header({headerButtonText, headerButtonAction}: { headerButtonText?: string, headerButtonAction?: () => void }) {
    const location = useLocation();
    const route = routes.find(r => r.path === location.pathname);
    return (
        <header className="Header">
            <h1>{
                location.pathname === '/' ?
                    (route ? route.title : null) || 'Cartas'
                    : (<Link to='/'>
                        <i className="fas fa-angle-left"/>
                        {(route ? route.title : null) || 'Cartas'}
                    </Link>)
            }</h1>
            {headerButtonText ? <button className="secondary"
                                        onClick={headerButtonAction}>{headerButtonText}</button> : null}
        </header>
    );
}

export default Header;
