import { createContext, useContext } from 'react';

/** Dedicated DOM container for all React portals (dropdowns, modals). */
export const PortalContext = createContext<HTMLElement>(document.body);
export const usePortalContainer = () => useContext(PortalContext);
