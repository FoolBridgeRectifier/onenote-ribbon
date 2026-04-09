import { createContext, useContext } from "react";
import { App } from "obsidian";

export const AppContext = createContext<App>(null!);
export const useApp = () => useContext(AppContext);
