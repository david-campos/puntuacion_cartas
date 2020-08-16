import React, {ChangeEvent, createRef, FocusEvent} from "react";
import './Participantes.scss';
import {abbreviateList, Participante} from "./Participante";
import {TopBarContext} from "../TopBarContext";

interface ParticipantesProps {
    onResult: (participantes: Participante[]) => void;
    withGender?: boolean;
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

    constructor(props: Readonly<ParticipantesProps>) {
        super(props);
        this.mLastInputRef = createRef<HTMLInputElement>();
        const parts: Participante[] = JSON.parse(localStorage.getItem(LAST_PARTICIPANTS_KEY) || "[]");
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

    handleBlur(participant: number, event: FocusEvent<HTMLInputElement>) {
        if (!focusInCurrentTarget(event)) {
            const value = event.target.value;
            if (!value) {
                this.setState(state => ({
                        participantes: abbreviateList(state.participantes.filter((p, i) => i !== participant))
                    }),
                    () => localStorage.setItem(
                        LAST_PARTICIPANTS_KEY,
                        JSON.stringify(this.state.participantes))
                );
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
                lastIsEmpty(state.participantes) ?
                    state :
                    {participantes: abbreviateList(state.participantes.concat([newParticipant]))},
            () => this.mLastInputRef.current && this.mLastInputRef.current.focus()
        );
    }

    componentDidMount() {
        this.context.change("Comenzar", () => {
            localStorage.setItem(LAST_PARTICIPANTS_KEY, JSON.stringify(this.state.participantes));
            this.props.onResult(this.state.participantes)
        });
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
                        </li>)
                    )
                }
            </ul>
            {
                lastIsEmpty(this.state.participantes) ?
                    null :
                    (<button className="secondary"
                             onClick={this.addParticipant.bind(this)}>
                        Nuevo
                    </button>)
            }
        </div>);
    }
}
