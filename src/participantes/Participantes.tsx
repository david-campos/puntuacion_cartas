import React, {ChangeEvent, createRef, FocusEvent} from "react";
import './Participantes.scss';
import {abbreviateList, Participante} from "./Participante";
import {TopBarContext} from "../TopBarContext";

interface ParticipantesProps {
    onResult: (participantes: Participante[]) => void;
    withGender?: boolean;
    minParticipants?: number;
    maxParticipants?: number;
}

interface ParticipantesState {
    participantes: Participante[];
}

const focusInCurrentTarget = ({relatedTarget, currentTarget}: any) => {
    if (relatedTarget === null) return false;

    var node = relatedTarget.parentNode;

    while (node !== null) {
        if (node === currentTarget) return true;
        node = node.parentNode;
    }

    return false;
}

const lastIsEmpty = (list: Participante[]) => list.length !== 0 && !list[list.length - 1].name;
const LAST_PARTICIPANTS_KEY = 'last-participants';

export default class Participantes extends React.Component<ParticipantesProps, ParticipantesState> {
    static contextType = TopBarContext;

    private mLastInputRef: React.RefObject<HTMLInputElement>;

    private get minParticipants(): number {
        return this.props.minParticipants || 2;
    }

    private cantAdd(state: ParticipantesState): boolean {
        return lastIsEmpty(state.participantes) ||
            (!!this.props.maxParticipants && state.participantes.length >= this.props.maxParticipants);
    }

    constructor(props: Readonly<ParticipantesProps>) {
        super(props);
        this.mLastInputRef = createRef<HTMLInputElement>();
        let parts: Participante[] = JSON.parse(localStorage.getItem(LAST_PARTICIPANTS_KEY) || "[]");
        if (props.maxParticipants) {
            parts = parts.slice(0, props.maxParticipants);
        }
        if (props.withGender) {
            // Last saved participants may not have gender, correct!
            parts.forEach(p => p.gender = p.gender || 'm');
        }
        this.state = {
            participantes: parts
        };
    }

    handleChange(participant: number, event: ChangeEvent<HTMLInputElement>) {
        if (!event.target) return;
        const value = (event.target.value || "");
        this.setState(state => ({
            participantes: abbreviateList(state.participantes.map((p, i) =>
                i === participant ? {...p, name: value} : p
            ))
        }));
    }

    clear() {
        this.setState({participantes: []},
            () => {
                if (this.state.participantes.length < this.minParticipants) {
                    this.context.change(null);
                }
            });
    }

    remove(participant: number) {
        this.setState(state => ({
                participantes: abbreviateList(state.participantes.filter((p, i) => i !== participant))
            }),
            () => {
                if (this.state.participantes.length < this.minParticipants) {
                    this.context.change(null);
                }
            });
    }

    handleBlur(participant: number, event: FocusEvent<HTMLInputElement>) {
        if (!focusInCurrentTarget(event)) {
            const value = event.target.value;
            if (!value) {
                this.remove(participant);
            }
        }
    }

    handleKeyDown(participant: number, event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Enter") {
            event.preventDefault();
            event.stopPropagation();
            this.addParticipant();
        }
    }

    changeGender(participant: number) {
        this.setState(state => ({
            participantes: state.participantes.map((p, i) =>
                i === participant ?
                    {...p, gender: p.gender === 'f' ? 'm' : 'f'}
                    : p
            )
        }));
    }

    newParticipant(): Participante {
        const obj: Participante = {name: ""};
        if (this.props.withGender) {
            obj.gender = "f";
        }
        return obj;
    }


    addParticipant(): void {
        const newParticipant = this.newParticipant();
        this.setState(state =>
                this.cantAdd(state) ?
                    state :
                    {participantes: abbreviateList(state.participantes.concat([newParticipant]))},
            () => {
                this.mLastInputRef.current && this.mLastInputRef.current.focus();
                if (this.state.participantes.length >= this.minParticipants) {
                    this.addStartButton();
                }
            }
        );
    }

    addStartButton() {
        this.context.change("Comenzar", () => {
            if (this.state.participantes.length >= this.minParticipants) {
                localStorage.setItem(LAST_PARTICIPANTS_KEY, JSON.stringify(this.state.participantes));
                this.props.onResult(this.state.participantes);
            }
        });
    }

    componentDidMount() {
        if (this.state.participantes.length >= this.minParticipants) {
            this.addStartButton();
        }
    }

    componentWillUnmount() {
        this.context.change(null);
    }

    render() {
        return (<div className="Participantes">
            <h2>Seleccionar participantes</h2>
            <ul>
                {
                    this.state.participantes.map((p, idx) =>
                        (<li key={idx}>
                            {this.props.withGender ?
                                <i className={`fas fa-${p.gender === 'f' ? 'venus' : 'mars'}`}
                                   onClick={this.changeGender.bind(this, idx)}/>
                                : null}
                            <input type="text" value={p.name}
                                   onChange={this.handleChange.bind(this, idx)}
                                   onBlur={this.handleBlur.bind(this, idx)}
                                   onKeyDown={this.handleKeyDown.bind(this, idx)}
                                   placeholder="Introducir..." maxLength={10}
                                   ref={idx === this.state.participantes.length - 1 ? this.mLastInputRef : undefined}
                            />
                            <span className="abbreviation">{p.abbreviated}</span>
                            <button className="delete"
                                    onClick={this.remove.bind(this, idx)}>
                                <i className="fas fa-trash"/>
                            </button>
                        </li>)
                    )
                }
            </ul>
            <div className="actions">
                {
                    this.state.participantes.length === 0 ?
                        null :
                        (<button className="secondary" onClick={this.clear.bind(this)}>
                            <i className="fas fa-broom"/> Vaciar
                        </button>)
                }
                {
                    this.cantAdd(this.state) ?
                        null :
                        (<button className="secondary"
                                 onClick={this.addParticipant.bind(this)}>
                            <i className="fas fa-user-plus"/> Novo
                        </button>)
                }
            </div>
        </div>);
    }
}
