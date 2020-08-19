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
}

export const routes: Route<any, any>[] = [
    {
        path: "/chinchon",
        component: ScoreTable,
        title: "Chinchón",
        extraProps: {
            modal: ChinchonModal,
            maxPoints: 100,
            stateStoringKey: 'chinchon-state'
        }
    },
    {
        path: "/escoba",
        component: Escoba,
        title: "Escoba"
    },
    {
        path: "/tute-cabron",
        component: TuteCabron,
        title: "Tute cabrón"
    },
    {
        path: "/",
        component: Home,
        title: "Menú"
    }
];
