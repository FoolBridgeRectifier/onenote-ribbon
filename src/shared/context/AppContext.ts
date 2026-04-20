import { createContext, useContext } from 'react';
import type { AppWithCommands } from './interfaces';

export type { AppWithCommands };

export const AppContext = createContext<AppWithCommands>(null!);
export const useApp = () => useContext(AppContext);
