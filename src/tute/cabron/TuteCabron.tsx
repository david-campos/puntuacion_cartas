import React from 'react';
import './TuteCabron.scss';
import Participantes from "../../participantes/Participantes";
import {Participante} from "../../participantes/Participante";
import {TopBarContext} from "../../TopBarContext";
import LosersSelector from "./LosersSelector";

interface TuteCabronState {
    participants: Participante[] | null;
    letters: number[];
    rejoined?: number[];
    freeEditing?: boolean;
    addingNext?: boolean;
    losers: Set<number>;
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

    get lostParticipants(): boolean[] {
        return (this.state.participants || []).map(
            (p, idx) => !!this.state.letters[idx] && this.state.letters[idx] === STATES.m.length - 1
        );
    }

    private saveState() {
        if (!this.state.addingNext) {
            localStorage.setItem(KEY_STATE, JSON.stringify({
                participants: this.state.participants,
                letters: this.state.letters,
                rejoined: this.state.rejoined
            }));
        }
    }

    onParticipantsSelected(participants: Participante[]) {
        this.setState(
            {participants, letters: new Array(participants.length).fill(0)},
            this.enableRestartButton.bind(this));
    }

    handleNext() {
        this.setState(state => {
            if (state.freeEditing) return null as any;
            if (state.addingNext) {
                return {
                    addingNext: false,
                    letters: state.letters.map((l, i) => state.losers.has(i)
                        ? Math.min(Math.max(0, l + 1), STATES.m.length - 1)
                        : l)
                }
            } else {
                return {
                    addingNext: true,
                    losers: new Set<number>()
                };
            }
        }, this.saveState.bind(this));
    }

    modify(delta: number, participant: number): void {
        if (!this.state.freeEditing) return;
        this.setState(state => state.freeEditing ? ({
            letters: state.letters.map((l, i) => i === participant
                ? Math.min(Math.max(0, l + delta), STATES.m.length - 1)
                : l)
        }) : null, this.saveState.bind(this));
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
        }, this.saveState.bind(this));
    }

    toggleLoser(idx: number) {
        this.setState(state => {
            const losers = new Set(state.losers);
            if (losers.has(idx))
                losers.delete(idx);
            else
                losers.add(idx);
            return {losers};
        });
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

    toggleFreeEditing() {
        this.setState(state => state.addingNext ? null : ({freeEditing: !state.freeEditing}));
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
                                (<button className={`secondary${this.state.freeEditing ? '' : ' invisible'}`}
                                         onClick={this.modify.bind(this, -1, i)}>
                                    <i className="fas fa-minus"/>
                                </button>)
                                : (r > 0 ?
                                    (<button onClick={this.rejoinModify.bind(this, -1, i)}>
                                        <i className="fas fa-redo"/>
                                    </button>)
                                    : null)}
                        </div>
                        <span className="cabron">{STATES[p.gender][l]}</span>
                        <div className="state-btn">
                            {l < STATES.m.length - 1 ?
                                <button className={`secondary${this.state.freeEditing ? '' : ' invisible'}`}
                                        onClick={this.modify.bind(this, +1, i)}>
                                    <i className="fas fa-plus"/>
                                </button>
                                : (<button onClick={this.rejoinModify.bind(this, +1, i)}>
                                    <i className="fas fa-undo"/>
                                </button>)}
                        </div>
                    </td>
                </tr>);
            }
            return (<div className="TuteCabron">
                <table>
                    <tbody>{lis}</tbody>
                </table>
                {this.state.addingNext ?
                    <LosersSelector participants={this.state.participants || []}
                                    losers={this.state.losers}
                                    disabled={this.lostParticipants}
                                    toggle={this.toggleLoser.bind(this)}/>
                    : null
                }
                <div
                    className={`free-edit${this.state.freeEditing ? ' active' : ''}${this.state.addingNext ? ' disabled' : ''}`}
                    onClick={this.toggleFreeEditing.bind(this)}>
                    <i className={`fa${this.state.freeEditing ? 's' : 'r'} fa-edit`}/>
                </div>
                <button className="next secondary"
                        disabled={this.state.freeEditing}
                        onClick={this.handleNext.bind(this)}>
                    <i className={`fas fa-${this.state.addingNext ? 'save' : 'plus'}`}/>
                </button>
            </div>);
        } else {
            return (<Participantes withGender={true} onResult={this.onParticipantsSelected.bind(this)}/>);
        }
    }
}
