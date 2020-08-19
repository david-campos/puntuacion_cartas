import React, {ComponentClass} from "react";
import Participantes from "../participantes/Participantes";
import {Participante} from "../participantes/Participante";
import {TopBarContext} from "../TopBarContext";
import "./ScoreTable.scss";
import {IScoreTableModal, ScoreTableModalProps} from "./ScoreTableModal";

interface ScoreTableState {
    participants?: Participante[];
    points: number[][];
    modalOpen: boolean;
}

interface ScoreTableProps {
    modal: ComponentClass<ScoreTableModalProps>;
    maxPoints: number;
    stateStoringKey: string;
}

const sum = (array: number[]) => array.reduce((p, c) => p + c, 0);

export default class ScoreTable extends React.Component<ScoreTableProps, ScoreTableState> {
    static contextType = TopBarContext;

    modalRef = React.createRef<IScoreTableModal>();

    constructor(props: Readonly<ScoreTableProps>) {
        super(props);
        const lastState = localStorage.getItem(props.stateStoringKey);
        this.state = lastState ? JSON.parse(lastState) : {
            modalOpen: false,
            points: []
        };
    }

    setParticipants(participants: Participante[]) {
        this.setState({
            participants,
            points: participants.map(() => [])
        }, this.enableRestartButton.bind(this))
    }

    mixScores(scores: Map<number, number>): void {
        this.setState(state => ({
            points: state.points.map((list, participantIdx) => {
                list = list.slice();
                const toAdd = scores.get(participantIdx);
                if (toAdd !== undefined) list.push(toAdd);
                return list;
            }),
            modalOpen: false
        }), () => localStorage.setItem(this.props.stateStoringKey, JSON.stringify(this.state)));
    }

    enableRestartButton() {
        this.context.change("Reiniciar", () => {
            localStorage.removeItem(this.props.stateStoringKey);
            this.setState({
                participants: undefined,
                points: [],
                modalOpen: false
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

    handleNext(): void {
        if (this.state.modalOpen && this.modalRef.current) {
            this.modalRef.current.next();
        } else {
            this.setState({modalOpen: true});
        }
    }

    private renderPoints(participant: number): JSX.Element[] | null {
        if (this.state.points.length <= participant) return null;
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

    render() {
        if (!this.state.participants) {
            return <Participantes onResult={this.setParticipants.bind(this)} withGender={false}/>;
        }
        if (!this.state.points) return null;
        const ModalTag = this.props.modal;
        const modal = this.state.modalOpen ?
            (<ModalTag participants={this.state.participants}
                       enabled={this.state.points.map(p => sum(p) <= this.props.maxPoints)}
                       onNewScores={this.mixScores.bind(this)}
                       ref={this.modalRef}/>)
            : null;
        const columns = this.state.participants.map((p, i) =>
            <div className={"column" + (this.state.points && sum(this.state.points[i]) > this.props.maxPoints ? ' lost' : '')} key={i}>
                <div className="name">{p.abbreviated}</div>
                {this.renderPoints(i)}
            </div>
        );
        return (<div className="ScoreTable">
            {modal}
            <button className="next secondary"
                    onClick={this.handleNext.bind(this)}
                    disabled={!!this.modalRef.current && !this.modalRef.current.isNextEnabled}>
                <i className={`fas fa-${this.state.modalOpen ? 'arrow-right' : 'plus'}`}/>
            </button>
            {columns}
        </div>);
    }
}
