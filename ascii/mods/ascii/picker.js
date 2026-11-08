// The skin picker popup: arrows move the cursor, Enter applies, Esc cancels.
import { View, div } from "gpui-kit";
import { h_flex, v_flex } from "gpui-base";
import { props, closeOverlay, theme, themes } from "herdr";
import { SKINS, skin, applySkin, alpha, fill } from "./skins.js";

export default class ThemePicker extends View {
  init(_props, cx) {
    this.at = SKINS.indexOf(skin());
    this.handle = cx.focus_handle();
    this.handle.focus();
    cx.timer.after(100, () => this.handle.focus());
  }

  dismiss() { closeOverlay(props().overlay); }

  render() {
    const t = theme(), current = skin();
    const swatches = (s) => {
      const c = themes().find((x) => x.name === s.theme)?.colors;
      if (!s.ready || !c) return div().w(54).text_color(t.dim).child("soon");
      return h_flex().w(54).gap(2).children([c.background, c.foreground, c.accent].map((col) => div().w(14).h(12).bg(col).border(1).border_color(t.border)));
    };
    const row = (s, i) => h_flex().id(`skin-${s.id}`).px(6).h(24).gap(8).items_center()
      .when(i === this.at, (el) => el.bg(alpha(t.accent, "33")))
      .text_color(s.ready ? t.foreground : t.dim)
      .on_click((_e, cx) => { this.at = i; if (s.ready) { applySkin(s); this.dismiss(); } cx.notify(); })
      .child(div().w(10).text_color(t.accent).child(i === this.at ? ">" : " "))
      .child(div().text_color(s.id === current.id ? t.accent : t.dim).child(s.id === current.id ? "(*)" : "( )"))
      .child(div().w(44).child(s.name))
      .child(div().flex_1().child(s.sample))
      .child(swatches(s));
    // ~75% opaque so what's behind stays readable (frame: "none": we draw our own edge).
    return v_flex().id("picker").track_focus(this.handle).size_full().p(10).gap(4).bg(alpha(t.popover, "bf")).border(1).border_color(t.accent).text_size(13)
      .on_key_down((e, cx) => {
        const n = SKINS.length;
        if (e.key === "escape") return this.dismiss();
        if (e.key === "down") this.at = (this.at + 1) % n;
        else if (e.key === "up") this.at = (this.at + n - 1) % n;
        else if (e.key === "enter") { const s = SKINS[this.at]; if (s.ready) { applySkin(s); this.dismiss(); } }
        else return;
        cx.stop_propagation();
        cx.notify();
      })
      .child(h_flex().text_color(t.dim).child("+-- theme ").child(fill("-", t.dim)).child("+"))
      .children(SKINS.map(row))
      .child(div().pt(4).text_size(11).text_color(t.dim).child("↑↓ select   ⏎ apply   Esc cancel"));
  }
}
