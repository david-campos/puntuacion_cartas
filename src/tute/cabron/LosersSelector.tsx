import React from "react";
import {Participante} from "../../participantes/Participante";
import "./LosersSelector.scss";

interface LosersSelectorProps {
    participants: Participante[];
    losers: Set<number>;
    disabled: boolean[];
    toggle(idx: number): void;
}

export default class LosersSelector extends React.Component<LosersSelectorProps> {
    handleClick(idx: number) {
        if (!this.props.disabled[idx]) {
            this.props.toggle(idx);
        }
    }

    render() {
        return (<div className="LosersSelector">
            <div className="title">
                <div className="winner">Gañan</div>
                <div className="loser">Perden</div>
            </div>
            {
                this.props.participants.map((p, idx) => (
                    <div key={idx} className={`participant${this.props.disabled[idx] ? ' disabled' : ''}`}
                         onClick={this.handleClick.bind(this, idx)}>
                        <div className={this.props.losers.has(idx) ? 'loser' : 'winner'}>{p.name}</div>
                    </div>)
                )
            }
        </div>);
    }
}
