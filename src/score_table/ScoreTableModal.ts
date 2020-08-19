import {Participante} from "../participantes/Participante";
import {Component} from "react";

export interface ScoreTableModalProps {
    participants: Participante[];
    /** true for each enabled participant */
    enabled: boolean[];
    onNewScores: (scores: Map<number, number>) => void;
}

export interface IScoreTableModal extends Component<ScoreTableModalProps> {
    isNextEnabled: boolean;
    next(): void;
}
