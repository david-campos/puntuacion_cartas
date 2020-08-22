import Home from "./home/Home";
import TuteCabron from "./tute/cabron/TuteCabron";
import ScoreTable from "./score_table/ScoreTable";
import ChinchonModal from "./score_table/ChinchonModal";
import {Component} from "react";
import Escoba from "./escoba/Escoba";

interface Route<P, C extends Component<P>> {
    path: string,
    component: C,
    title: string,
    extraProps?: P;
    inHome?: boolean;
}

export const routes: Route<any, any>[] = [
    {
        path: "/tute-cabron",
        component: TuteCabron,
        inHome: true,
        title: "Tute cabrón"
    },
    {
        path: "/chinchon",
        component: ScoreTable,
        title: "Chinchón",
        inHome: true,
        extraProps: {
            modal: ChinchonModal,
            maxPoints: 100,
            stateStoringKey: 'chinchon-state'
        }
    },
    {
        path: "/escoba",
        component: Escoba,
        inHome: true,
        title: "Escoba"
    },
    {
        path: "/",
        component: Home,
        title: "Menú"
    }
];
