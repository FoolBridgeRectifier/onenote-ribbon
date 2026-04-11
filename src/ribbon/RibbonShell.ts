import { App } from 'obsidian';
import { createRoot, Root } from 'react-dom/client';
import { createElement } from 'react';
import { AppContext } from '../shared/context/AppContext';
import { RibbonApp } from './RibbonApp';

export class RibbonShell {
  private el!: HTMLElement;
  private root!: Root;

  constructor(private app: App) {}

  mount(): void {
    document.getElementById('onenote-ribbon-root')?.remove();

    this.el = document.createElement('div');
    this.el.id = 'onenote-ribbon-root';

    const horizontalMainContainer = document.querySelector('.horizontal-main-container');
    horizontalMainContainer?.parentElement?.insertBefore(this.el, horizontalMainContainer);

    const titlebar = document.querySelector('.titlebar') as HTMLElement | null;
    if (titlebar) {
      this.el.style.marginTop = `${titlebar.getBoundingClientRect().height}px`;
    }

    this.root = createRoot(this.el);
    this.root.render(
      createElement(AppContext.Provider, { value: this.app },
        createElement(RibbonApp)
      )
    );
  }

  unmount(): void {
    this.root?.unmount();
    this.el?.remove();
  }
}
