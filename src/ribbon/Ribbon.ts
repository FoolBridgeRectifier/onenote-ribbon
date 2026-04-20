import type { App, Plugin } from 'obsidian';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { createElement } from 'react';
import type { AppWithCommands } from '../shared/context/AppContext';
import { AppContext } from '../shared/context/AppContext';
import { PortalContext } from '../shared/context/PortalContext';
import { PluginContext } from '../shared/context/PluginContext';
import { RibbonApp } from './ribbon-app/RibbonApp';

export class RibbonShell {
  private rootElement!: HTMLElement;
  private portalContainer!: HTMLElement;
  private root!: Root;

  constructor(
    private app: App,
    private plugin: Plugin
  ) {}

  mount(): void {
    document.getElementById('onenote-ribbon-root')?.remove();
    document.getElementById('onenote-ribbon-portals')?.remove();

    // Dedicated container for all React portals (dropdowns, modals).
    // Giving React its own isolated subtree prevents removeChild errors
    // caused by Obsidian modifying document.body between renders.
    this.portalContainer = document.createElement('div');
    this.portalContainer.id = 'onenote-ribbon-portals';
    document.body.appendChild(this.portalContainer);

    this.rootElement = document.createElement('div');
    this.rootElement.id = 'onenote-ribbon-root';

    const horizontalMainContainer = document.querySelector('.horizontal-main-container');
    horizontalMainContainer?.parentElement?.insertBefore(this.rootElement, horizontalMainContainer);

    const titlebarElement = document.querySelector('.titlebar') as HTMLElement | null;
    if (titlebarElement) {
      this.rootElement.style.marginTop = `${titlebarElement.getBoundingClientRect().height}px`;
    }

    this.root = createRoot(this.rootElement);
    this.root.render(
      createElement(
        PluginContext.Provider,
        { value: this.plugin },
        createElement(
          AppContext.Provider,
          // eslint-disable-next-line strict-structure/no-double-cast -- Obsidian's public App type doesn't expose `commands`; cast required
          { value: this.app as unknown as AppWithCommands },
          createElement(
            PortalContext.Provider,
            { value: this.portalContainer },
            createElement(RibbonApp)
          )
        )
      )
    );
  }

  unmount(): void {
    this.root?.unmount();
    this.rootElement?.remove();
    this.portalContainer?.remove();
  }
}
