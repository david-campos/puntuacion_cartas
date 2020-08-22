import React from "react";
import {ScoreTableModalProps} from "../score_table/ScoreTableModal";
import {Participante} from "../participantes/Participante";
import Participantes from "../participantes/Participantes";
import "./Escoba.scss";
import NumericInput from "./NumericInput";

interface EscobaRoundScore {
    velo: number;
    cartas: number | null;
    ouros: number | null;
    setes: number | null;
    escobas: number[];
}

interface EscobaState {
    participants: Participante[] | null;
    rounds: EscobaRoundScore[];
    currentRound: number;
}

const arraySum = (arr1: number[], arr2: number[]) =>
    arr1.length === arr2.length ? arr1.map((v, i) => v + arr2[i]) : [];


export default class Escoba extends React.Component<{}, EscobaState> {
    constructor(props: ScoreTableModalProps, context: any) {
        super(props, context);
        this.state = {
            participants: null,
            rounds: [this.newRoundScore(0)],
            currentRound: 0
        };
    }

    private getCurrentRound(state: EscobaState): EscobaRoundScore {
        return state.rounds[state.currentRound];
    }

    private getRoundsUntilNow(state: EscobaState): EscobaRoundScore[] {
        return state.rounds.slice(0, state.currentRound + 1);
    }

    private getRoundsUntilLast(state: EscobaState): EscobaRoundScore[] {
        return state.rounds.slice(0, state.currentRound);
    }

    private getRoundPoints(round: EscobaRoundScore): number[] {
        const array = round.escobas.slice();
        array[round.velo]++;
        if (round.setes !== null) array[round.setes]++;
        if (round.ouros !== null) array[round.ouros]++;
        if (round.cartas !== null) array[round.cartas]++;
        return array;
    }

    private accumulatedPoints(state: EscobaState): number[] {
        if (!state.participants) return [];
        else return this.getRoundsUntilLast(state)
            .map(round => this.getRoundPoints(round))
            .reduce((p, c) => arraySum(p, c), new Array(state.participants.length).fill(0));
    }

    private newRoundScore: (numParticipants: number) => EscobaRoundScore
        = (numParticipants: number) => ({
        cartas: null,
        escobas: new Array(numParticipants).fill(0),
        ouros: null,
        setes: null,
        velo: 0
    });

    changeVelo(value: number): void {
        this.setState(state => ({
            rounds: state.rounds.map((r, idx) =>
                idx === state.currentRound
                    ? {...r, velo: value}
                    : r)
        }));
    }

    changeNullable(prop: keyof EscobaRoundScore, value: number | null) {
        this.setState(state => ({
            rounds: state.rounds.map((r, idx) =>
                idx === state.currentRound
                    ? {...r, [prop]: r[prop] === value ? null : value}
                    : r
            )
        }));
    }

    changeCartas = this.changeNullable.bind(this, 'cartas');
    changeOuros = this.changeNullable.bind(this, 'ouros');
    changeSetes = this.changeNullable.bind(this, 'setes');

    changeEscobas(index: number, value: number): void {
        this.setState(state => ({
            rounds: state.rounds.map((r, idx) => idx === state.currentRound
                ? {...r, escobas: r.escobas.map((e, i) => i === index ? value : e)}
                : r)
        }));
    }

    setParticipants(participants: Participante[]) {
        this.setState({
            participants,
            currentRound: 0,
            rounds: [this.newRoundScore(participants.length)]
        });
    }

    undo() {
        this.setState(state =>
            state.currentRound > 0 ? {currentRound: state.currentRound - 1} : null);
    }

    redo() {
        this.setState(state =>
            state.currentRound < state.rounds.length - 1 ? {currentRound: state.currentRound + 1} : null);
    }

    add() {
        this.setState(state => ({
            rounds: this.getRoundsUntilNow(state).concat([
                this.newRoundScore(state.participants ? state.participants.length : 0)
            ]),
            currentRound: state.currentRound + 1
        }));
    }

    render() {
        if (!this.state.participants) {
            return <Participantes onResult={this.setParticipants.bind(this)} withGender={false}/>;
        } else {
            return (<div className="Escoba">
                <div className="data">
                    {this.accumulatedPoints(this.state).map((score, idx) =>
                        (<div key={idx} className="participant">
                            <div>{this.state.participants ? this.state.participants[idx].name : 'Error'}</div>
                            <div>{score.toString(10)}</div>
                        </div>)
                    )}
                </div>
                <div className="input">
                    <div className="adder">
                        <div className="header">
                            <div className="no-border"/>
                            <div>Velo</div>
                            <div>Cartas</div>
                            <div>Ouros</div>
                            <div>Setenta</div>
                            <div className="escobas">Escobas</div>
                            <div className="no-border"/>
                        </div>
                        {this.state.participants.map((p, idx) => (<div className="line" key={idx}>
                            <div>{p.abbreviated}</div>
                            <div onClick={this.changeVelo.bind(this, idx)}
                                 className={this.getCurrentRound(this.state).velo === idx ? 'checked' : 'not-checked'}>
                                <i className={`fas fa-${this.getCurrentRound(this.state).velo === idx ? 'check' : 'times'}`}/>
                            </div>
                            <div onClick={this.changeCartas.bind(this, idx)}
                                 className={this.getCurrentRound(this.state).cartas === idx ? 'checked' : 'not-checked'}>
                                <i className={`fas fa-${this.getCurrentRound(this.state).cartas === idx ? 'check' : 'times'}`}/>
                            </div>
                            <div onClick={this.changeOuros.bind(this, idx)}
                                 className={this.getCurrentRound(this.state).ouros === idx ? 'checked' : 'not-checked'}>
                                <i className={`fas fa-${this.getCurrentRound(this.state).ouros === idx ? 'check' : 'times'}`}/>
                            </div>
                            <div onClick={this.changeSetes.bind(this, idx)}
                                 className={this.getCurrentRound(this.state).setes === idx ? 'checked' : 'not-checked'}>
                                <i className={`fas fa-${this.getCurrentRound(this.state).setes === idx ? 'check' : 'times'}`}/>
                            </div>
                            <div className="escobas"><NumericInput
                                value={this.getCurrentRound(this.state).escobas[idx]}
                                min={0}
                                onChange={v => this.changeEscobas(idx, v)}/></div>
                            <div>{this.getRoundPoints(this.getCurrentRound(this.state))[idx]}</div>
                        </div>))}
                    </div>
                    <div className="actions">
                        <button className="undo"
                                disabled={this.state.currentRound <= 0}
                                onClick={this.undo.bind(this)}>
                            <i className="fas fa-undo"/>
                        </button>
                        <button className="add-btn"
                                onClick={this.add.bind(this)}>
                            <i className="fas fa-download"/>
                            Engadir
                        </button>
                        <button className="redo"
                                disabled={this.state.currentRound >= this.state.rounds.length}
                                onClick={this.redo.bind(this)}>
                            <i className="fas fa-redo"/>
                        </button>
                    </div>
                </div>
            </div>);
        }
    }
}
