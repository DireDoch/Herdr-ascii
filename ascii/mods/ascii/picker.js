// The skin picker popup: arrows move the cursor, Enter applies, Esc cancels.
import { View, div } from "gpui-kit";
import { h_flex } from "gpui-base";
import { props, closeOverlay, theme, themes, shared, setShared } from "herdr";
import { SKINS, skin, applySkin, alpha, fill, popupBox } from "./skins.js";

export default class ThemePicker extends View {
  init(_props, cx) {
    this.at = SKINS.indexOf(skin());
    this.handle = cx.focus_handle();
    this.handle.focus();
    cx.timer.after(100, () => this.handle.focus());
  }

  dismiss() { closeOverlay(props().overlay); }

  close() { if (shared("ascii.picker") === props().overlay) setShared("ascii.picker", null); }

  render() {
    const t = theme(), current = skin();
    const swatches = (s) => {
      const c = themes().find((x) => x.name === s.theme)?.colors;
      if (!s.ready || !c) return div().w(54).flex_none().text_color(t.dim).child("soon");
      return h_flex().w(54).flex_none().gap(2).children([c.background, c.foreground, c.accent].map((col) => div().w(14).h(12).bg(col).border(1).border_color(t.border)));
    };
    const row = (s, i) => h_flex().id(`skin-${s.id}`).w_full().min_w(0).overflow_hidden().px(6).h(24).gap(8).items_center()
      .when(i === this.at, (el) => el.bg(alpha(t.accent, "33")))
      .text_color(s.ready ? t.foreground : t.dim)
      .on_click((_e, cx) => { this.at = i; if (s.ready) { applySkin(s); this.dismiss(); } cx.notify(); })
      .child(div().w(10).text_color(t.accent).child(i === this.at ? ">" : " "))
      .child(div().text_color(s.id === current.id ? t.accent : t.dim).child(s.id === current.id ? "(*)" : "( )"))
      .child(div().w(44).child(s.name))
      .child(div().flex_1().min_w(0).overflow_hidden().whitespace_nowrap().child(s.sample))
      .child(swatches(s));
    return popupBox(t).id("picker").track_focus(this.handle)
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
