// -- This computer | main | 2 agents | 1 needs you ------ 04:12 | skin: ascii | ^⇧P commands --
import { View, div } from "gpui-kit";
import { h_flex } from "gpui-base";
import { spaces, agents, theme, run, keys } from "herdr";
import { skin, fill, openPicker, chord } from "./skins.js";

const clock = () => new Date().toTimeString().slice(0, 5);

export default class Status extends View {
  init(_props, cx) {
    this.time = clock();
    // A clock is data: refresh only as often as the minute can change.
    cx.timer.every(15000, (cx) => { const now = clock(); if (now !== this.time) { this.time = now; cx.notify(); } });
  }

  render() {
    const t = theme(), s = skin(), all = agents();
    const space = spaces().find((p) => p.active);
    const needs = all.filter((a) => a.status === "blocked").length;
    const working = all.filter((a) => a.status === "working").length;
    const palette = keys().find((k) => k.section === "global" && k.action === "app.palette");
    const seg = (text, color) => div().flex_none().text_color(color).child(text);
    const sep = () => seg(s.v, t.dim);
    return h_flex().id("root").size_full().px(10).gap(6).items_center().bg(t.chrome).border_t(1).border_color(t.border).text_size(12).whitespace_nowrap()
      .child(seg(`${s.h}${s.h}`, t.dim))
      .child(seg(space?.machine ?? "This computer", t.muted))
      .when(Boolean(space?.branch), (el) => el.child(sep()).child(seg(space.branch, t.muted)))
      .child(sep())
      .child(seg(`${all.length} agent${all.length === 1 ? "" : "s"}`, t.muted))
      .when(working > 0, (el) => el.child(seg(`${working} working`, t.working)))
      .when(needs > 0, (el) => el.child(sep()).child(seg(`${needs} needs you`, t.blocked)))
      .child(fill(s.h, t.dim))
      .child(seg(this.time, t.muted))
      .child(sep())
      .child(div().id("skin").flex_none().text_color(t.accent).hover((x) => x.text_color(t.foreground)).on_click(() => openPicker()).child(`skin: ${s.id}`))
      .child(sep())
      .child(div().id("palette").flex_none().text_color(t.dim).hover((x) => x.text_color(t.foreground)).on_click(() => run("app.palette"))
        .child(palette ? `${chord(palette.keys)} commands` : "commands"))
      .child(seg(`${s.h}${s.h}`, t.dim));
  }
}
