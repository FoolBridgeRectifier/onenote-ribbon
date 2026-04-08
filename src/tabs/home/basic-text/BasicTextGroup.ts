import { App } from "obsidian";
import { BoldButton } from "./bold/BoldButton";
import { ItalicButton } from "./italic/ItalicButton";
import { UnderlineButton } from "./underline/UnderlineButton";
import { StrikethroughButton } from "./strikethrough/StrikethroughButton";
import { SubscriptButton } from "./subscript/SubscriptButton";
import { SuperscriptButton } from "./superscript/SuperscriptButton";
import { HighlightButton } from "./highlight/HighlightButton";
import { FontColorButton } from "./font-color/FontColorButton";
import { FontFamilyPicker } from "./font-family/FontFamilyPicker";
import { FontSizePicker } from "./font-size/FontSizePicker";
import { BulletListButton } from "./bullet-list/BulletListButton";
import { NumberedListButton } from "./numbered-list/NumberedListButton";
import { IndentButton } from "./indent/IndentButton";
import { OutdentButton } from "./outdent/OutdentButton";
import { AlignButton } from "./align/AlignButton";
import { ClearFormattingButton } from "./clear-formatting/ClearFormattingButton";
import { ClearInlineButton } from "./clear-inline/ClearInlineButton";

export class BasicTextGroup {
  render(container: HTMLElement, app: App): void {
    const group = container.createDiv("onr-group");
    group.setAttribute("data-group", "Basic Text");

    const wrapper = group.createDiv();
    wrapper.style.cssText = "display:flex;flex-direction:column;gap:2px";

    // Row 1: font pickers + list buttons + indent/clear
    const row1 = wrapper.createDiv("onr-row");
    row1.style.cssText =
      "display:flex;align-items:center;gap:2px;padding:2px 0 0 0";
    new FontFamilyPicker().render(row1, app);
    new FontSizePicker().render(row1, app);
    new BulletListButton().render(row1, app);
    new NumberedListButton().render(row1, app);
    new OutdentButton().render(row1, app);
    new IndentButton().render(row1, app);
    new ClearFormattingButton().render(row1, app);

    // Row 2: inline formatting + color + align
    const row2 = wrapper.createDiv("onr-row");
    row2.style.cssText = "display:flex;align-items:center;gap:2px";
    new BoldButton().render(row2, app);
    new ItalicButton().render(row2, app);
    new UnderlineButton().render(row2, app);
    new StrikethroughButton().render(row2, app);
    new SubscriptButton().render(row2, app);
    new SuperscriptButton().render(row2, app);

    // Divider
    const div1 = row2.createDiv();
    div1.style.cssText =
      "width:1px;height:18px;background:#d0d0d0;margin:0 1px;flex-shrink:0";

    new HighlightButton().render(row2, app);
    new FontColorButton().render(row2, app);

    // Divider
    const div2 = row2.createDiv();
    div2.style.cssText =
      "width:1px;height:18px;background:#d0d0d0;margin:0 1px;flex-shrink:0";

    new AlignButton().render(row2, app);
    new ClearInlineButton().render(row2, app);

    group.createDiv("onr-group-name").textContent = "Basic Text";
  }
}
