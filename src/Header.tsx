import React from 'react';
import {
    useLocation
} from "react-router-dom";
import {routes} from "./routes";

function Header({headerButtonText, headerButtonAction}: {headerButtonText?: string, headerButtonAction?: () => void}) {
    const location = useLocation();
    const route = routes.find(r => r.path === location.pathname);
    return (
        <header className="Header">
            <h1>{(route ? route.title : null) || 'Cartas'}</h1>
            {headerButtonText ? <button className="secondary"
                                        onClick={headerButtonAction}>{headerButtonText}</button> : null}
        </header>
    );
}

export default Header;
