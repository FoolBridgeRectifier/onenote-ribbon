import { App } from 'obsidian';
import { createRoot, Root } from 'react-dom/client';
import { createElement } from 'react';
import { AppContext } from '../shared/context/AppContext';
import { PortalContext } from '../shared/context/PortalContext';
import { RibbonApp } from './RibbonApp';

export class RibbonShell {
  private rootElement!: HTMLElement;
  private portalContainer!: HTMLElement;
  private root!: Root;

  constructor(private app: App) {}

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

    const horizontalMainContainer = document.querySelector(
      '.horizontal-main-container',
    );
    horizontalMainContainer?.parentElement?.insertBefore(
      this.rootElement,
      horizontalMainContainer,
    );

    const titlebarElement = document.querySelector(
      '.titlebar',
    ) as HTMLElement | null;
    if (titlebarElement) {
      this.rootElement.style.marginTop = `${titlebarElement.getBoundingClientRect().height}px`;
    }

    this.root = createRoot(this.rootElement);
    this.root.render(
      createElement(
        AppContext.Provider,
        { value: this.app },
        createElement(
          PortalContext.Provider,
          { value: this.portalContainer },
          createElement(RibbonApp),
        ),
      ),
    );
  }

  unmount(): void {
    this.root?.unmount();
    this.rootElement?.remove();
    this.portalContainer?.remove();
  }
}
