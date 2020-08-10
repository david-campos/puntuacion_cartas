import React from 'react';
import './TuteCabron.scss';
import Participantes from "../../participantes/Participantes";
import {Participante} from "../../participantes/Participante";

interface TuteCabronState {
    participants: Participante[] | null;
    letters: number[];
}

const STATES = {
    m: ["", "C", "CA", "CAB", "CABR", "CABRO", "CABRÓ", "CABRÓN"],
    f: ["", "C", "CA", "CAB", "CABR", "CABRO", "CABRON", "CABRONA"]
};

export default class TuteCabron extends React.Component<any, TuteCabronState> {
    constructor(props: Readonly<any>) {
        super(props);
        this.state = {participants: null, letters: []};
    }

    onParticipantsSelected(participants: Participante[]) {
        this.setState({participants, letters: new Array(participants.length).fill(0)});
    }

    modify(delta: number, participant: number): void {
        this.setState(state => ({
            letters: state.letters.map((l, i) => i === participant
                ? Math.min(Math.max(0, l + delta), STATES.m.length - 1)
                : l)
        }));
    }

    render() {
        if (this.state.participants) {
            const lis = [];
            for (let i = 0; i < this.state.participants.length; i++) {
                const p = this.state.participants[i];
                const l = this.state.letters[i];
                if (!p.gender) continue;
                lis.push(<tr key={i} className={l === STATES.m.length - 1 ? "lost" : ""}>
                    <td className="participant">{p.abbreviated}</td>
                    <td className="state">
                        <div className="state-btn">
                            {l > 0 ?
                                (<button className="secondary" onClick={this.modify.bind(this, -1, i)}>
                                    <i className="fas fa-minus"/>
                                </button>)
                                : null}
                        </div>
                        <span className="cabron">{STATES[p.gender][l]}</span>
                        <div className="state-btn">
                            {l < STATES.m.length - 1 ?
                                (<button className="secondary" onClick={this.modify.bind(this, +1, i)}>
                                    <i className="fas fa-plus"/>
                                </button>)
                                : null}
                        </div>
                    </td>
                </tr>);
            }
            return (<table className="TuteCabron">
                <tbody>{lis}</tbody>
            </table>);
        } else {
            return (<Participantes withGender={true} onResult={this.onParticipantsSelected.bind(this)}/>);
        }
    }
}
