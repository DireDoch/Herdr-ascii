// "Sort agents" popup from the sidebar's (o): Priority or Grouped by space.
import { View, div } from "gpui-kit";
import { h_flex } from "gpui-base";
import { props, closeOverlay, theme, shared, setShared } from "herdr";
import { fill, popupBox, alpha } from "./skins.js";

const MODES = [["priority", "Priority"], ["space", "Grouped by space"]];

export default class Sort extends View {
  render() {
    const t = theme(), mode = shared("ascii.agentSort") ?? "priority";
    return popupBox(t).id("sort")
      .child(h_flex().text_color(t.dim).child("+-- sort agents ").child(fill("-", t.dim)).child("+"))
      .children(MODES.map(([id, name]) => h_flex().id(`sort-${id}`).px(6).h(22).gap(8).items_center()
        .text_color(mode === id ? t.foreground : t.muted).hover((x) => x.bg(alpha(t.accent, "33")))
        .on_click(() => { setShared("ascii.agentSort", id); closeOverlay(props().overlay); })
        .child(div().text_color(mode === id ? t.accent : t.dim).child(mode === id ? "(*)" : "( )"))
        .child(name)));
  }
}
