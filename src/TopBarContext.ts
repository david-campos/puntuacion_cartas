import React from "react";

export interface TopBarContextInterface {
    change: (text: string|null, action?: () => void) => void;
}

export const TopBarContext = React.createContext<TopBarContextInterface>({
    change: () => {
    }
});
