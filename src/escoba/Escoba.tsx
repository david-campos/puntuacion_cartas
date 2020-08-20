import React from "react";
import {ScoreTableModalProps} from "../score_table/ScoreTableModal";
import {Participante} from "../participantes/Participante";
import Participantes from "../participantes/Participantes";
import "./Escoba.scss";
import NumericInput from "./NumericInput";

interface EscobaState {
    participants: Participante[] | null;
    points: number[][];
    stepPointer: number;
    velo: number;
    cartas: number | null;
    ouros: number | null;
    setes: number | null;
    escobas: number[];
}

export default class Escoba extends React.Component<{}, EscobaState> {
    constructor(props: ScoreTableModalProps, context: any) {
        super(props, context);
        this.state = {
            participants: null,
            points: [],
            stepPointer: 0,
            velo: 0,
            cartas: null,
            ouros: null,
            setes: null,
            escobas: []
        };
    }

    changeVelo(value: number): void {
        this.setState({velo: value});
    }

    changeCartas(value: number): void {
        this.setState(state => ({cartas: state.cartas === value ? null : value}));
    }

    changeOuros(value: number): void {
        this.setState(state => ({ouros: state.ouros === value ? null : value}));
    }

    changeSetes(value: number): void {
        this.setState(state => ({setes: state.setes === value ? null : value}));
    }

    changeEscobas(index: number, value: number): void {
        this.setState(state => ({
            escobas: state.escobas.map((e, i) => i === index ? value : e)
        }));
    }

    setParticipants(participants: Participante[]) {
        this.setState({
            participants,
            points: new Array(participants.length).fill([]),
            stepPointer: 0,
            escobas: participants.map(() => 0)
        });
    }

    sumFor(participant: number, useState: EscobaState | null = null): number {
        const state = useState || this.state;
        let value = state.escobas[participant] || 0;
        if (state.velo === participant) value++;
        if (state.setes === participant) value++;
        if (state.ouros === participant) value++;
        if (state.cartas === participant) value++;
        return value;
    }

    undo() {
        this.setState(state => state.stepPointer > 0 ? {stepPointer: state.stepPointer - 1} : null);
    }

    redo() {
        this.setState(state => state.stepPointer < state.points[0].length ? {stepPointer: state.stepPointer + 1} : null);
    }

    add() {
        this.setState(state => ({
            points: state.points.map((p, idx) => p.slice(0, state.stepPointer).concat([this.sumFor(idx, state)])),
            stepPointer: state.stepPointer + 1,
            velo: 0,
            cartas: null,
            ouros: null,
            setes: null,
            escobas: new Array(state.points.length).fill(0)
        }));
    }

    render() {
        if (!this.state.participants) {
            return <Participantes onResult={this.setParticipants.bind(this)} withGender={false}/>;
        } else {
            return (<div className="Escoba">
                <div className="data">
                    {this.state.points.map((p, idx) =>
                        (<div key={idx} className="participant">
                            <div>{this.state.participants ? this.state.participants[idx].name : 'Error'}</div>
                            <div>{p.slice(0, this.state.stepPointer).reduce((p, c) => p + c, 0).toString(10)}</div>
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
                            <div className="no-border escobas"/>
                            <div className="no-border"/>
                        </div>
                        {this.state.participants.map((p, idx) => (<div className="line" key={idx}>
                            <div>{p.abbreviated}</div>
                            <div onClick={this.changeVelo.bind(this, idx)}
                                 className={this.state.velo === idx ? 'checked' : 'not-checked'}>
                                <i className={`fas fa-${this.state.velo === idx ? 'check' : 'times'}`}/></div>
                            <div onClick={this.changeCartas.bind(this, idx)}
                                 className={this.state.cartas === idx ? 'checked' : 'not-checked'}>
                                <i className={`fas fa-${this.state.cartas === idx ? 'check' : 'times'}`}/></div>
                            <div onClick={this.changeOuros.bind(this, idx)}
                                 className={this.state.ouros === idx ? 'checked' : 'not-checked'}>
                                <i className={`fas fa-${this.state.ouros === idx ? 'check' : 'times'}`}/></div>
                            <div onClick={this.changeSetes.bind(this, idx)}
                                 className={this.state.setes === idx ? 'checked' : 'not-checked'}>
                                <i className={`fas fa-${this.state.setes === idx ? 'check' : 'times'}`}/></div>
                            <div className="escobas"><NumericInput
                                value={this.state.escobas[idx]}
                                min={0}
                                onChange={v => this.changeEscobas(idx, v)}/></div>
                            <div>{this.sumFor(idx)}</div>
                        </div>))}
                    </div>
                    <div className="actions">
                        <button className="undo"
                                disabled={this.state.stepPointer <= 0}
                                onClick={this.undo.bind(this)}>
                            <i className="fas fa-undo"/>
                        </button>
                        <button className="add-btn"
                                onClick={this.add.bind(this)}>
                            <i className="fas fa-download"/>
                            Engadir
                        </button>
                        <button className="redo"
                                disabled={this.state.stepPointer >= this.state.points[0].length}
                                onClick={this.redo.bind(this)}>
                            <i className="fas fa-redo"/>
                        </button>
                    </div>
                </div>
            </div>);
        }
    }
}
