// Tabs as [ 1:fish ] [ 2:claude [|] ] [+]   ...   [ Files] [*Changes]
import { View, div } from "gpui-kit";
import { h_flex } from "gpui-base";
import { spaces, panes, run, theme, openOverlay, layout, shared } from "herdr";
import { marker } from "./skins.js";

function find(node, id) {
  if (node?.id === id) return node;
  for (const c of node?.children ?? []) { const f = find(c, id); if (f) return f; }
  return null;
}

export default class Tabs extends View {
  render() {
    const t = theme();
    const space = spaces().find((p) => p.active);
    const tabs = space?.tabs ?? [];
    const stop = (_e, cx) => cx.stop_propagation();
    const label = (c) => {
      if (c.named) return c.name;
      const ps = panes().filter((p) => p.tab === c.id);
      return (ps.find((p) => p.program?.agent) ?? ps[0])?.program?.name ?? "term";
    };
    const tab = (c) => h_flex().id(`tab-${c.id}`).flex_none().gap(4).items_center()
      .text_color(c.active ? t.accent : t.muted).hover((x) => x.text_color(t.foreground))
      .on_click((e) => run(e.click_count === 2 ? "tab.rename" : "tab.select", { id: c.id }))
      .on_mouse_down("middle", () => run("tab.close", { id: c.id }))
      .on_mouse_down("right", (_e, cx) => { cx.stop_propagation(); openOverlay({ mod: "menu", kind: "popup", width: 200, props: { tab: "tab", target: { id: c.id, space: space.id } } }); })
      .child(`[ ${c.index}:${label(c)}${c.zoomed ? " Z" : ""}`)
      .child(marker(c.status, c.id))
      .child("]");
    const panel = find(layout(), "panel"), body = find(layout(), "panel-body");
    const enabled = shared("workspace.panels") ?? ["files", "changes"];
    const panelButton = (id, name) => {
      const on = panel && !panel.hidden && body?.active === id;
      return div().id(`panel-${id}`).flex_none().text_color(on ? t.accent : t.muted).hover((x) => x.text_color(t.foreground))
        .on_mouse_down("left", stop)
        .on_click(() => {
          if (on) run("layout.hide", { id: "panel" });
          else { run("layout.select", { stack: "panel-body", child: id }); run("layout.show", { id: "panel" }); }
        })
        .child(on ? `[*${name}]` : `[ ${name}]`);
    };
    return h_flex().id("root").size_full().px(10).gap(8).items_center().bg(t.chrome).border_b(1).border_color(t.border).text_size(13)
      .on_scroll_wheel((e) => { if (Math.abs(e.delta.y) >= 1) run(e.delta.y > 0 ? "tab.prev" : "tab.next"); })
      .child(h_flex().id("tab-scroll").flex_1().min_w(0).gap(8).items_center().overflow_x_scrollbar().children(tabs.map(tab))
        .child(div().id("tab-new").flex_none().text_color(t.dim).hover((x) => x.text_color(t.accent))
          .on_mouse_down("left", stop)
          .on_click(() => openOverlay({ mod: "new-menu", kind: "popup", width: 250, height: 512 })).child("[+]")))
      .when(enabled.includes("files"), (el) => el.child(panelButton("files", "Files")))
      .when(enabled.includes("changes"), (el) => el.child(panelButton("changes", "Changes")));
  }
}
