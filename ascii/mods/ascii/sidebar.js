// Theme button, spaces, agents, then Settings / Add machine at the bottom.
import { View, div } from "gpui-kit";
import { h_flex, v_flex } from "gpui-base";
import { spaces, agents, run, theme, nextCommand, setAgentOrder, updates, layout, shared, setShared, openOverlay } from "herdr";
import { skin, fill, marker, openPicker } from "./skins.js";

const RANK = { blocked: 0, done: 1, working: 2, idle: 3 };

function find(node, id) {
  if (node?.id === id) return node;
  for (const c of node?.children ?? []) { const f = find(c, id); if (f) return f; }
  return null;
}

// Herdr's rule: the sidebar is a rail when narrower than 160px (ctrl-shift-b or a drag).
const width = () => find(layout(), "sidebar")?.size?.px ?? Infinity;

function expand() {
  setShared("sidebar.collapsed", false);
  run("layout.resize", { id: "sidebar", px: shared("sidebar.width") ?? 268 });
}

export default class Sidebar extends View {
  init(_props, cx) {
    // ctrl-shift-s ("ascii.picker" in keys.json) lands here.
    cx.spawn(async () => { for (;;) if ((await nextCommand()) === "picker") openPicker(); });
  }

  render() {
    const t = theme(), s = skin();
    const byPriority = (a, b) => (b.pinned - a.pinned) || (RANK[a.status] - RANK[b.status]) || (b.seq - a.seq);
    const grouped = shared("ascii.agentSort") === "space";
    const all = agents();
    // Grouped: each space's agents together, in sidebar order; else most urgent first.
    const groups = grouped
      ? spaces().map((p) => ({ space: p, list: all.filter((a) => a.space === p.id).sort(byPriority) })).filter((g) => g.list.length)
      : [{ space: null, list: all.slice().sort(byPriority) }];
    const list = groups.flatMap((g) => g.list);
    setAgentOrder(list.map((a) => a.address));
    const link = (id, label, action, color = t.muted) => div().id(id).flex_none().text_color(color).hover((x) => x.text_color(t.accent)).on_click(action).child(label);
    const heading = (label, button) => h_flex().flex_none().gap(4).text_color(t.dim).child(`${s.rule}${s.rule} ${label} `).child(fill(s.rule, t.dim))
      .when(Boolean(button), (el) => el.child(button));
    const space = (p) => h_flex().id(`sp-${p.id}`).px(4).gap(6).items_center().when(p.active, (el) => el.bg(t.selected)).hover((x) => x.bg(t.hover))
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
      .when(!grouped, (el) => el.child(div().flex_none().text_color(t.dim).child(a.space_name)))
      .child(link(`pin-${a.address}`, a.pinned ? "[^]" : "[ ]", (_e, cx) => { cx.stop_propagation(); run("terminal.pin", { terminal: a.address, pinned: !a.pinned }); }, a.pinned ? t.accent : t.dim));
    if (width() < 160) return this.rail(t, s, list, link);
    return v_flex().id("root").size_full().p(10).gap(8).bg(t.chrome).text_size(13)
      .child(link("theme-btn", "[ Theme ^⇧S ]", () => openPicker(), t.accent))
      .child(heading("spaces", link("space-new", "[+]", () => run("space.new"), t.dim)))
      .child(v_flex().id("spaces").flex_1().gap(4).overflow_y_scrollbar().children(spaces().map(space)))
      .child(heading(`agents (${list.length})`, link("sort", "(o)", () => openOverlay({ mod: "ascii", kind: "popup", frame: "none", width: 230, height: 96, props: { role: "sort" } }), t.dim)))
      .child(v_flex().id("agents").flex_1().gap(4).overflow_y_scrollbar()
        .when(list.length === 0, (el) => el.child(div().text_color(t.dim).child("  no agents running")))
        .children(groups.flatMap((g) => [
          ...(g.space ? [div().text_color(t.dim).truncate().child(`${s.h} ${g.space.name}`)] : []),
          ...g.list.map(agent),
        ])))
      .child(heading(""))
      .child(h_flex().flex_none().gap(10)
        .child(link("settings", updates().app.ready ? "[ Settings * ]" : "[ Settings ]", () => run("app.settings")))
        .child(link("machine", "[ + Machine ]", () => run("mod.open", { name: "machine-add" }), t.dim)));
  }

  // Collapsed: [~] theme, [n] per space, one marker per agent, >> expand, [#] settings, [+] machine.
  rail(t, s, list, link) {
    const rule = () => div().flex_none().text_color(t.dim).child(s.rule.repeat(3));
    return v_flex().id("root").size_full().py(10).gap(8).items_center().bg(t.chrome).text_size(13)
      .child(link("theme-btn", "[~]", () => openPicker(), t.accent))
      .child(rule())
      .child(link("space-new", "[+]", () => run("space.new"), t.dim))
      .child(v_flex().id("spaces").flex_1().gap(4).items_center().overflow_y_scrollbar().children(spaces().map((p) =>
        div().id(`sp-${p.id}`).flex_none().px(3).when(p.active, (el) => el.bg(t.selected)).hover((x) => x.text_color(t.foreground))
          .text_color(p.status && p.status !== "idle" ? t[p.status] : p.active ? t.accent : t.dim)
          .on_click(() => run("space.select", { id: p.id }))
          .child(`[${p.index}]`))))
      .child(rule())
      .child(v_flex().id("agents").flex_1().gap(4).items_center().overflow_y_scrollbar().children(list.map((a) =>
        div().id(`ag-${a.address}`).flex_none().on_click(() => run("pane.focus", { pane: a.pane })).child(marker(a.status, `r-${a.address}`)))))
      .child(link("expand", ">>", () => expand(), t.dim))
      .child(rule())
      .child(link("settings", updates().app.ready ? "[*]" : "[#]", () => run("app.settings")))
      .child(link("machine", "[+]", () => run("mod.open", { name: "machine-add" }), t.dim));
  }
}
