import React from "react";
import {ScoreTableModalProps} from "../score_table/ScoreTableModal";
import {Participante} from "../participantes/Participante";
import Participantes from "../participantes/Participantes";
import "./Escoba.scss";

interface EscobaState {
    participants: Participante[] | null;
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
            escobas: participants.map(() => 0)
        });
    }

    // next(): void {
    //     const scores = new Map<number, number>();
    //     this.props.participants.forEach((p, i) => {
    //         let score = this.state.escobas[i];
    //         if (this.state.velo === i) score++;
    //         if (this.state.cartas === i) score++;
    //         if (this.state.ouros === i) score++;
    //         if (this.state.setes === i) score++;
    //         scores.set(i, score);
    //     });
    //     this.props.onNewScores(scores);
    // }

    render() {
        if (!this.state.participants) {
            return <Participantes onResult={this.setParticipants.bind(this)} withGender={false}/>;
        } else {
            return (<div className="Escoba">
                <div className="adder">
                    <div className="header">
                        <div>Equipo</div>
                        <div>Velo</div>
                        <div>Cartas</div>
                        <div>Ouros</div>
                        <div>Setenta</div>
                    </div>
                    {this.state.participants.map((p, idx) => (<div className="line" key={idx}>
                        <div>{p.name}</div>
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
                    </div>))}
                </div>
            </div>);
        }
    }
}
