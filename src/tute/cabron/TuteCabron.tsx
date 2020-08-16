import React from 'react';
import './TuteCabron.scss';
import Participantes from "../../participantes/Participantes";
import {Participante} from "../../participantes/Participante";
import {TopBarContext} from "../../TopBarContext";

interface TuteCabronState {
    participants: Participante[] | null;
    letters: number[];
    rejoined?: number[];
}

const STATES = {
    m: ["", "C", "CA", "CAB", "CABR", "CABRO", "CABRÓ", "CABRÓN"],
    f: ["", "C", "CA", "CAB", "CABR", "CABRO", "CABRON", "CABRONA"]
};

const KEY_STATE = 'tute-cabron-state';

export default class TuteCabron extends React.Component<any, TuteCabronState> {
    static contextType = TopBarContext;

    constructor(props: Readonly<any>) {
        super(props);
        const lastState = localStorage.getItem(KEY_STATE);
        this.state = lastState ? JSON.parse(lastState) : {participants: null, letters: []};
    }

    onParticipantsSelected(participants: Participante[]) {
        this.setState(
            {participants, letters: new Array(participants.length).fill(0)},
            this.enableRestartButton.bind(this));
    }

    modify(delta: number, participant: number): void {
        this.setState(state => ({
            letters: state.letters.map((l, i) => i === participant
                ? Math.min(Math.max(0, l + delta), STATES.m.length - 1)
                : l)
        }), () => localStorage.setItem(KEY_STATE, JSON.stringify(this.state)));
    }

    rejoinModify(delta: number, participant: number): void {
        this.setState(state => {
            const value =
                delta > 0
                    ? state.letters.filter((l, i) => i !== participant).reduce((p, c) => p < c ? c : p, 0)
                    : STATES.m.length - 1
            return {
                rejoined: (state.rejoined || (state.letters.map(() => 0))).map(
                    (rejoined, participantIdx) => participantIdx === participant
                        ? Math.max(0, rejoined + delta)
                        : rejoined),
                letters: state.letters.map((l, i) => i === participant ? value : l)
            };
        }, () => localStorage.setItem(KEY_STATE, JSON.stringify(this.state)));
    }

    enableRestartButton() {
        this.context.change("Reiniciar", () => {
            localStorage.removeItem(KEY_STATE);
            this.setState({
                participants: null,
                letters: [],
                rejoined: []
            });
        });
    }

    componentDidMount() {
        if (this.state.participants) {
            this.enableRestartButton();
        }
    }

    componentWillUnmount() {
        this.context.change(null);
    }

    render() {
        if (this.state.participants) {
            const lis = [];
            for (let i = 0; i < this.state.participants.length; i++) {
                const p = this.state.participants[i];
                const l = this.state.letters[i];
                const r = this.state.rejoined ? this.state.rejoined[i] || 0 : 0;
                if (!p.gender) continue;
                lis.push(<tr key={i} className={l === STATES.m.length - 1 ? "lost" : ""}>
                    <td className="participant">{p.abbreviated}</td>
                    <td className="rejoins">{this.state.rejoined && this.state.rejoined[i] ? `+${this.state.rejoined[i]}` : ''}</td>
                    <td className="state">
                        <div className="state-btn">
                            {l > 0 ?
                                (<button className="secondary" onClick={this.modify.bind(this, -1, i)}>
                                    <i className="fas fa-minus"/>
                                </button>)
                                : (r > 0
                                    ? (<button onClick={this.rejoinModify.bind(this, -1, i)}>
                                        <i className="fas fa-redo"/>
                                    </button>)
                                    : null)}
                        </div>
                        <span className="cabron">{STATES[p.gender][l]}</span>
                        <div className="state-btn">
                            {l < STATES.m.length - 1 ?
                                (<button className="secondary" onClick={this.modify.bind(this, +1, i)}>
                                    <i className="fas fa-plus"/>
                                </button>)
                                : (<button onClick={this.rejoinModify.bind(this, +1, i)}>
                                    <i className="fas fa-undo"/>
                                </button>)}
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
