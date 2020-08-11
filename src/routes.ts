import Home from "./home/Home";
import TuteCabron from "./tute/cabron/TuteCabron";
import Chinchon from "./chinchon/Chinchon";

export const routes = [
    {
        path: "/chinchon",
        component: Chinchon,
        title: "Chinchón"
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
