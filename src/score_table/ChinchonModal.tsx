import React, {ChangeEvent} from "react";
import "./ChinchonModal.scss";
import {IScoreTableModal, ScoreTableModalProps} from "./ScoreTableModal";

interface ChinchonModalState {
    introducing: number;
    modalText: string;
    modalAccumulation?: Map<number, number>;
}

export default class ChinchonModal extends React.Component<ScoreTableModalProps, ChinchonModalState>
    implements IScoreTableModal {
    private inputRef = React.createRef<HTMLInputElement>();

    constructor(props: ScoreTableModalProps, context: any) {
        super(props, context);
        this.state = {
            modalAccumulation: new Map(),
            introducing: this.findNextIdx(-1),
            modalText: ""
        };
    }

    get isNextEnabled(): boolean {
        return !!this.state.modalText;
    }

    focusInput() {
        if (this.inputRef.current) {
            this.inputRef.current.focus();
        }
    }

    onModalTextChange(event: ChangeEvent<HTMLInputElement>) {
        if (!event.target) return;
        this.setState({modalText: event.target.value},
            () => this.props.setNextEnabled(this.isNextEnabled));
    }

    handleKeyDown(event: React.KeyboardEvent): void {
        if (event.key === "Enter") {
            event.preventDefault();
            event.stopPropagation();
            this.next();
        }
    }

    findNextIdx(current: number): number {
        let next = current;
        do {
            next++;
            if (next >= this.props.participants.length) {
                break;
            }
        } while (!this.props.enabled[next]);
        return next;
    }

    next(forcedScore: number | null = null) {
        if (!this.isNextEnabled && forcedScore === null) return;
        this.setState(state => {
            const modalAccumulation: Map<number, number> =
                new Map(state.modalAccumulation || []).set(
                    state.introducing,
                    forcedScore === null ? parseInt(state.modalText, 10) : forcedScore
                );
            return {
                modalText: "",
                modalAccumulation,
                introducing: this.findNextIdx(state.introducing)
            };
        }, () => {
            if (this.state.introducing >= this.props.participants.length) {
                this.props.onNewScores(new Map(this.state.modalAccumulation || []));
            } else {
                this.props.setNextEnabled(this.isNextEnabled);
                this.focusInput();
            }
        });
    }

    componentDidMount() {
        this.props.setNextEnabled(this.isNextEnabled);
        this.focusInput();
    }

    render() {
        if (this.state.introducing < 0) return null;
        const p = this.props.participants[this.state.introducing];
        if (!p) return null;
        return (<div className="ChinchonModal">
            <label>{p.name}</label>
            <input type="text" inputMode="numeric"
                   value={this.state.modalText}
                   onChange={this.onModalTextChange.bind(this)}
                   onKeyDown={this.handleKeyDown.bind(this)}
                   maxLength={3} size={3}
                   ref={this.inputRef}/>
            <button onClick={this.next.bind(this, -10)}>-10</button>
        </div>);
    }
}
