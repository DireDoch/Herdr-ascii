// Theme button, spaces, agents, then Settings / Add machine at the bottom.
import { View, div } from "gpui-kit";
import { h_flex, v_flex } from "gpui-base";
import { spaces, agents, run, theme, nextCommand, setAgentOrder, updates } from "herdr";
import { skin, fill, marker, openPicker } from "./skins.js";

const RANK = { blocked: 0, done: 1, working: 2, idle: 3 };

export default class Sidebar extends View {
  init(_props, cx) {
    // ctrl-shift-s ("ascii.picker" in keys.json) lands here.
    cx.spawn(async () => { for (;;) if ((await nextCommand()) === "picker") openPicker(); });
  }

  render() {
    const t = theme(), s = skin();
    const list = agents().slice().sort((a, b) => (b.pinned - a.pinned) || (RANK[a.status] - RANK[b.status]) || (b.seq - a.seq));
    setAgentOrder(list.map((a) => a.address));
    const heading = (label) => h_flex().flex_none().gap(4).text_color(t.dim).child(`${s.rule}${s.rule} ${label} `).child(fill(s.rule, t.dim));
    const link = (id, label, action, color = t.muted) => div().id(id).flex_none().text_color(color).hover((x) => x.text_color(t.accent)).on_click(action).child(label);
    const space = (p) => h_flex().id(`sp-${p.id}`).gap(6).items_center().hover((x) => x.bg(t.hover))
      .on_click(() => run("space.select", { id: p.id }))
      .child(div().flex_none().text_color(p.active ? t.accent : t.dim).child(p.active ? "[*]" : "[ ]"))
      .child(div().flex_1().min_w(0).truncate().text_color(p.active ? t.foreground : t.muted).child(p.name))
      .when(Boolean(p.branch), (el) => el.child(div().flex_none().text_color(t.dim).child(`(${p.branch})`)))
      .child(marker(p.status, `sp-${p.id}`));
    const agent = (a) => h_flex().id(`ag-${a.address}`).gap(6).items_center().hover((x) => x.bg(t.hover))
      .on_click(() => run("pane.focus", { pane: a.pane }))
      .on_mouse_down("right", (_e, cx) => { cx.stop_propagation(); run("terminal.peek", { terminal: a.address }); })
      .child(marker(a.status, `ag-${a.address}`))
      .child(div().flex_1().min_w(0).truncate().text_color(a.focused ? t.foreground : t.muted).child(a.program?.name ?? a.title))
      .child(div().flex_none().text_color(t.dim).child(a.space_name))
      .child(link(`pin-${a.address}`, a.pinned ? "[^]" : "[ ]", (_e, cx) => { cx.stop_propagation(); run("terminal.pin", { terminal: a.address, pinned: !a.pinned }); }, a.pinned ? t.accent : t.dim));
    return v_flex().id("root").size_full().p(10).gap(8).bg(t.chrome).text_size(13)
      .child(link("theme-btn", "[ Theme ^⇧S ]", () => openPicker(), t.accent))
      .child(heading("spaces"))
      .child(v_flex().id("spaces").flex_1().gap(4).overflow_y_scrollbar().children(spaces().map(space)))
      .child(heading(`agents (${list.length})`))
      .child(v_flex().id("agents").flex_1().gap(4).overflow_y_scrollbar()
        .when(list.length === 0, (el) => el.child(div().text_color(t.dim).child("  no agents running")))
        .children(list.map(agent)))
      .child(heading(""))
      .child(h_flex().flex_none().gap(10)
        .child(link("settings", updates().app.ready ? "[ Settings * ]" : "[ Settings ]", () => run("app.settings")))
        .child(link("machine", "[ + Machine ]", () => run("mod.open", { name: "machine-add" }), t.dim)));
  }
}
