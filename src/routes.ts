import Home from "./home/Home";
import TuteCabron from "./tute/cabron/TuteCabron";

export const routes = [
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
