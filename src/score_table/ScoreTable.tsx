import React, {ComponentClass} from "react";
import Participantes from "../participantes/Participantes";
import {Participante} from "../participantes/Participante";
import {TopBarContext} from "../TopBarContext";
import "./ScoreTable.scss";
import {IScoreTableModal, ScoreTableModalProps} from "./ScoreTableModal";

type Run = number[];
type ParticipantRuns = Run[];

interface ScoreTableState {
    participants?: Participante[];
    points: ParticipantRuns[];
    modalOpen: boolean;
    nextEnabled: boolean;
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
            points: [],
            nextEnabled: true
        };
    }

    pointsLast(participant: number, state: ScoreTableState = this.state) {
        const runs = state.points[participant];
        return sum(runs[runs.length - 1]);
    }

    topPoints(state: ScoreTableState = this.state): number {
        return state.points
            .filter(runs => !this.lastRunIsLost(runs))
            .map(runs => sum(runs[runs.length - 1]))
            .reduce((p, c) => c > p ? c : p, 0);
    }

    lastRunIsLost(runs: ParticipantRuns): boolean {
        return runs.length === 0 || this.isLostRun(runs[runs.length - 1]);
    }

    isLostRun(run: Run): boolean {
        return sum(run) > this.props.maxPoints;
    }

    isPlaying(state: ScoreTableState, participant: number): boolean {
        return !this.lastRunIsLost(state.points[participant]);
    }

    get enabledParticipants(): boolean[] {
        return this.state.points.map(runs => !this.lastRunIsLost(runs));
    }

    getLastRunTopSteps(state: ScoreTableState): number {
        if (state.points.length === 0) return 0;
        const lastGame = Math.max(...state.points.map(runs => runs.length - 1));
        return state.points
            .filter(runs => runs.length > lastGame)
            .map(runs => runs[lastGame])
            .reduce((p, c) => p >= c.length ? p : c.length, 0);
    }

    get undoIsDisabled(): boolean {
        return this.getLastRunTopSteps(this.state) === 0;
    }

    setParticipants(participants: Participante[]) {
        this.setState({
            participants,
            points: participants.map(() => [[]])
        }, this.enableRestartButton.bind(this))
    }

    mixScores(scores: Map<number, number>): void {
        this.setState(state => ({
            points: state.points.map((participantRuns, participantIdx) => {
                const toAdd = scores.get(participantIdx);
                const nRuns = participantRuns.length;
                if (toAdd !== undefined && nRuns > 0) {
                    participantRuns = participantRuns.slice(); // Do not modify previous array!
                    participantRuns.splice(
                        nRuns - 1, 1,
                        participantRuns[nRuns - 1].concat([toAdd])
                    );
                }
                return participantRuns;
            }),
            modalOpen: false,
            nextEnabled: true
        }), () => localStorage.setItem(this.props.stateStoringKey, JSON.stringify(this.state)));
    }

    rejoin(participant: number): void {
        this.setState(state => {
            const keepLast = this.getLastRunTopSteps(state) === 1;
            const participantNewRun = [this.topPoints(state)];
            const othersNewRun = (idx: number) => [this.pointsLast(idx, state)];
            const shouldAddRun = (idx: number) => idx === participant || (this.isPlaying(state, idx) && !keepLast);
            return {
                points: state.points.map((runs, idx) => shouldAddRun(idx)
                    ? runs.concat([idx === participant ? participantNewRun : othersNewRun(idx)])
                    : runs
                )
            };
        }, () => localStorage.setItem(this.props.stateStoringKey, JSON.stringify(this.state)));
    }

    undo(): void {
        this.setState(state => {
            const topSteps = this.getLastRunTopSteps(state);
            const points = state.points.map(runs => {
                runs = runs.slice();
                const lastIdx = runs.length - 1;
                const lastRun = runs[lastIdx];
                if (lastRun.length === topSteps) {
                    runs.splice(lastIdx, 1,
                        lastRun.slice(0, lastRun.length - 1)); // Remove last step
                }
                return runs;
            });
            return {points};
        });
    }

    enableRestartButton() {
        this.context.change("Reiniciar", () => {
            localStorage.removeItem(this.props.stateStoringKey);
            this.setState({
                participants: undefined,
                points: [],
                modalOpen: false,
                nextEnabled: true
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

    private renderRun(run: Run, runIdx: number, lost: number, fixedLength: number, last: boolean): JSX.Element {
        const lostThis = this.isLostRun(run);
        run = run.slice();
        let sum = run.shift();
        const lines = [];
        if (sum === undefined) {
            if (runIdx > 0) {
                lines.push(<div key={0} className="rejoined"><i className="fas fa-undo"/></div>);
            }
        } else {
            let lineIdx = 0;
            for (const next of run) {
                const extraClass = next >= 0 ? 'positive' : 'negative';
                lines.push(<div className="line" key={lineIdx}>
                    <span className="sum">{sum}</span>
                    <span className={"plus " + extraClass}>{next >= 0 ? '+' : '-'}</span>
                    <span className={"next " + extraClass}>{Math.abs(next)}</span>
                </div>);
                sum += next;
                lineIdx++;
            }
            while (lineIdx < fixedLength - 1) {
                lines.push(<div className="line empty" key={lineIdx}/>);
                lineIdx++;
            }
            lines.push(<div className="total" key={lineIdx}>{sum}{
                lost > 0 && last ? <span className="extra-rounds">(+{lost})</span> : null
            }</div>);
        }
        const classes = `run${lostThis ? ' lost' : ''}`;
        return <div className={classes} key={runIdx}>{lines}</div>;
    }

    private renderRuns(participant: number, fixedLengths: number[]): (JSX.Element | null)[] | null {
        const runs = this.state.points[participant];
        if (runs !== undefined) {
            const rendered = [];
            let lost = 0;
            for (let idx = 0; idx < runs.length; ++idx) {
                const run = runs[idx];
                rendered.push(this.renderRun(run, idx, lost, fixedLengths[idx], idx === runs.length - 1));
                if (idx === runs.length - 1 && this.isLostRun(run)) {
                    rendered.push(<button className="rejoin" key={idx + 1}
                                          onClick={this.rejoin.bind(this, participant)}>
                        <i className="fas fa-undo"/>
                        Entrar
                    </button>);
                }
                if (this.isLostRun(run)) ++lost;
            }
            return rendered;
        } else return null;
    }

    render() {
        if (!this.state.participants) {
            return <Participantes onResult={this.setParticipants.bind(this)} withGender={false}/>;
        }
        if (!this.state.points) return null;
        const ModalTag = this.props.modal;
        const modal = this.state.modalOpen ?
            (<ModalTag participants={this.state.participants}
                       enabled={this.enabledParticipants}
                       onNewScores={this.mixScores.bind(this)}
                       setNextEnabled={enabled => this.setState({nextEnabled: enabled})}
                       ref={this.modalRef}/>)
            : null;
        const runsLengths = this.state.points
            .map(runs => runs.map(run => run.length))
            .reduce((p, c) =>
                c.slice(0, p.length).map((cRunLen, i) => Math.max(p[i], cRunLen))
                    .concat(c.slice(p.length))
                    .concat(p.slice(c.length))
            );
        const columns = this.state.participants.map((p, i) =>
            <div className={`column${this.enabledParticipants[i] ? '' : ' lost'}`} key={i}>
                <div className="name">{p.abbreviated}</div>
                {this.renderRuns(i, runsLengths)}
            </div>
        );
        return (<div className="ScoreTable">
            {modal}
            <button className="undo secondary"
                    onClick={this.undo.bind(this)}
                    disabled={this.undoIsDisabled}>
                <i className="fas fa-undo"/>
            </button>
            <button className="next secondary"
                    onClick={this.handleNext.bind(this)}
                    disabled={!this.state.nextEnabled}>
                <i className={`fas fa-${this.state.modalOpen ? 'arrow-right' : 'plus'}`}/>
            </button>
            {columns}
        </div>);
    }
}
