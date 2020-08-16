import React, {ChangeEvent} from "react";
import {Participante} from "../participantes/Participante";
import Participantes from "../participantes/Participantes";
import "./Chinchon.scss";

interface ChinchonState {
    participants?: Participante[];
    points?: number[][];
    introducing: number;
    modalText: string;
    modalAccumulation?: Map<number, number>;
}

const sum = (array: number[]) => array.reduce((p, c) => p + c, 0);

export default class Chinchon extends React.Component<any, ChinchonState> {
    constructor(props: Readonly<any>) {
        super(props);
        this.state = {introducing: -1, modalText: ""};
    }

    get isNextEnabled(): boolean {
        return this.state.introducing < 0 || !!this.state.modalText;
    }

    setParticipants(participants: Participante[]) {
        this.setState({
            participants,
            points: participants.map(() => [])
        })
    }

    handleNext(): void {
        this.next();
    }

    handleKeyDown(event: React.KeyboardEvent): void {
        if (event.key === "Enter") {
            event.preventDefault();
            event.stopPropagation();
            this.next();
        }
    }

    next(forcedScore: number | null = null) {
        if (!this.isNextEnabled && forcedScore === null) return;
        this.setState(state => {
            if (!state.participants || state.points === undefined) return null;
            const modalAccumulation: Map<number, number> = state.introducing < 0 ?
                new Map() :
                new Map(state.modalAccumulation || []).set(
                    state.introducing,
                    forcedScore === null ? parseInt(state.modalText, 10) : forcedScore
                );
            const newState: any = {
                modalText: "",
                modalAccumulation
            };
            let next = state.introducing;
            do {
                next++;
                if (next >= state.participants.length) {
                    const points = state.points.map(list => list.slice());
                    points.forEach((l, i) => {
                        const toAdd = modalAccumulation.get(i);
                        if (toAdd !== undefined) {
                            l.push(toAdd);
                        }
                    });
                    newState.points = points;
                    next = -1;
                    break;
                }
            } while (sum(state.points[next]) > 100);
            newState.introducing = next;
            return newState;
        });
    }

    private renderPoints(participant: number) {
        if (!this.state.points) return null;
        const points = this.state.points[participant].slice();
        let sum = points.shift();
        if (sum === undefined) return null;
        const lines = [];
        let index = 0;
        for (const next of points) {
            const extraClass = next >= 0 ? 'positive' : 'negative';
            lines.push(<div className="line" key={index}>
                <span className="sum">{sum}</span>
                <span className={"plus " + extraClass}>{next >= 0 ? '+' : '-'}</span>
                <span className={"next " + extraClass}>{Math.abs(next)}</span>
            </div>);
            sum += next;
            index++;
        }
        lines.push(<div className="total" key={index}>{sum}</div>);
        return lines;
    }

    onModalTextChange(event: ChangeEvent<HTMLInputElement>) {
        if (!event.target) return;
        this.setState({modalText: event.target.value});
    }

    renderModal() {
        if (!this.state.participants
            || this.state.introducing < 0) return null;
        const p = this.state.participants[this.state.introducing];
        return (<div className="introduceModal">
            <label>{p.name}</label>
            <input type="text" inputMode="numeric"
                   value={this.state.modalText}
                   onChange={this.onModalTextChange.bind(this)}
                   onKeyDown={this.handleKeyDown.bind(this)}
                   maxLength={3} size={3}/>
            <div className="quick">
                {new Array(5).fill(null).map((a, i) =>
                    <button key={i} onClick={this.next.bind(this, i)}>{i}</button>)}
            </div>
            <button onClick={this.next.bind(this, -10)}>-10</button>
        </div>);
    }

    render() {
        if (!this.state.participants) {
            return <Participantes onResult={this.setParticipants.bind(this)} withGender={false}/>;
        }
        const columns = this.state.participants.map((p, i) =>
            <div className={"column" + (this.state.points && sum(this.state.points[i]) > 100 ? ' lost' : '')} key={i}>
                <div className="name">{p.abbreviated}</div>
                {this.renderPoints(i)}
            </div>
        );
        return (<div className="Chinchon">
            {this.renderModal()}
            <button className="next secondary"
                    onClick={this.handleNext.bind(this)}
                    disabled={!this.isNextEnabled}>
                <i className={`fas fa-${this.state.introducing < 0 ? 'plus' : 'arrow-right'}`}/>
            </button>
            {columns}
        </div>);
    }
}
