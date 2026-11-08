// Pane header: +-- fish -- ~/dir ------------ [|] [|][-][Z][x]+
import { View, div } from "gpui-kit";
import { h_flex } from "gpui-base";
import { panes, props, run, theme, home } from "herdr";
import { skin, fill, marker } from "./skins.js";

function folder(cwd) {
  if (!cwd) return "";
  const h = home();
  return cwd === h ? "~" : cwd.startsWith(h + "/") ? "~" + cwd.slice(h.length) : cwd;
}

export default class Pane extends View {
  render() {
    const t = theme(), s = skin();
    const p = panes().find((x) => x.pane === props()?.pane);
    if (!p) return div();
    const pane = p.pane, line = p.focused ? t.accent : t.dim;
    const name = ((p.program?.agent || p.program?.shell) && p.program.name) || p.title || p.program?.name || "shell";
    const btn = (label, command, args) => div().id(`ph-${label}-${pane}`).flex_none().text_color(t.dim)
      .hover((x) => x.text_color(t.foreground))
      .on_click((_e, cx) => { cx.stop_propagation(); run(command, args); })
      .child(`[${label}]`);
    return h_flex().id(`ph-${pane}`).size_full().px(6).gap(4).items_center().bg(t.background).text_size(12).whitespace_nowrap()
      .on_click(() => run("pane.focus", { pane }))
      .child(div().flex_none().text_color(line).child(`${s.corner}${s.h}${s.h}`))
      .child(div().flex_none().max_w(220).truncate().text_color(t.foreground).child(name))
      .child(div().flex_none().text_color(line).child(`${s.h}${s.h}`))
      .child(div().min_w(0).truncate().text_color(t.dim).child(folder(p.cwd)))
      .child(fill(s.h, line))
      .child(marker(p.status, pane))
      .child(btn(s.v, "pane.split", { direction: "right", pane }))
      .child(btn(s.h, "pane.split", { direction: "down", pane }))
      .child(btn("Z", "pane.zoom", { pane }))
      .child(btn("x", "pane.close", { pane }))
      .child(div().flex_none().text_color(line).child(s.corner));
  }
}
