import React from 'react';
import {Link} from "react-router-dom";
import './Home.scss';
import {routes} from "../routes";

export default class Home extends React.Component<any, any> {
    render() {
        return (<ul className="Home">
            {routes
                .filter(r => r.inHome)
                .map(r => <li><Link to={r.path}>{r.title}</Link></li>)
            }
        </ul>);
    }
}
