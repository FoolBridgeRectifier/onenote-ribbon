import { App, Plugin } from 'obsidian';
import { createRoot, Root } from 'react-dom/client';
import { createElement } from 'react';
import { AppContext } from '../shared/context/AppContext';
import { PluginContext } from '../shared/context/PluginContext';
import { RibbonApp } from './RibbonApp';

export class RibbonShell {
  private rootElement!: HTMLElement;
  private root!: Root;

  constructor(private app: App, private plugin: Plugin) {}

  mount(): void {
    document.getElementById('onenote-ribbon-root')?.remove();

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
        PluginContext.Provider,
        { value: this.plugin },
        createElement(
          AppContext.Provider,
          { value: this.app },
          createElement(RibbonApp),
        ),
      ),
    );
  }

  unmount(): void {
    this.root?.unmount();
    this.rootElement?.remove();
  }
}
