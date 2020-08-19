import React from 'react';
import './App.scss';
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";
import Header from "./Header";
import {routes} from "./routes";
import { TopBarContext } from './TopBarContext';

interface AppState {
    headerBtnText?: string;
    headerBtnAction?: () => void;
}

class App extends React.Component<any, AppState> {
    constructor(props: Readonly<any>) {
        super(props);
        this.state = {};
    }

    changeBtnHeader(text: string|null, action?: () => void) {
        this.setState(text ? {
            headerBtnText: text,
            headerBtnAction: action
        } : {headerBtnText: undefined, headerBtnAction: undefined})
    }

    render() {
        return (
            <div className="App">
                <Router>
                    <Header headerButtonText={this.state.headerBtnText}
                            headerButtonAction={this.state.headerBtnAction}/>
                    <TopBarContext.Provider value={{change: this.changeBtnHeader.bind(this)}}>
                        <div className="content-wrapper">
                            <Switch>
                                {routes.map((route, idx) => <Route
                                    key={idx}
                                    path={route.path}
                                    render={props => (<route.component {...props} {...route.extraProps}/>)}
                                />)}
                            </Switch>
                        </div>
                    </TopBarContext.Provider>
                </Router>
            </div>
        );
    }
}

export default App;
