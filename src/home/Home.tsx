import React from 'react';
import {Link} from "react-router-dom";
import './Home.scss';

export default class Home extends React.Component<any, any> {
    render() {
        return (<ul className="Home">
            <li><Link to="/tute-cabron">Tute cabrón</Link></li>
            <li><Link to="/chinchon">Chinchón</Link></li>
        </ul>);
    }
}
