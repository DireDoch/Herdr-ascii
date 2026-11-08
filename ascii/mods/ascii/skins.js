// Skin tables shared by every ascii-* mod. A skin is a character set plus a
// theme from themes/. Add a skin here; the mods don't change.
import { div } from "gpui-kit";
import { shared, setShared, run, theme, openOverlay } from "herdr";

export const SKINS = [
  {
    id: "ascii", name: "ASCII", theme: "ascii", ready: true,
    h: "-", v: "|", corner: "+", rule: "=",
    spin: ["|", "/", "-", "\\"], blocked: "!", done: "+", idle: " ",
    sample: "+--[|]--+",
  },
  { id: "crt", name: "CRT", ready: false, spin: [".", "o", "O", "0"], sample: ".oO0 ~~~" },
  { id: "dos", name: "DOS", ready: false, spin: ["░", "▒", "▓", "█"], sample: "╔═╗ ░▒▓" },
  { id: "tui", name: "TUI", ready: false, spin: ["⠋", "⠙", "⠹", "⠸"], sample: "╭─╮ ⠋⠙⠹" },
];

export function skin() {
  return SKINS.find((s) => s.id === shared("ascii.skin") && s.ready) ?? SKINS[0];
}

export function applySkin(s) {
  if (!s.ready) return;
  setShared("ascii.skin", s.id);
  run("app.theme", { name: s.theme });
}

// A line of `ch` that fills whatever width is left (clipped, never wraps).
export function fill(ch, color) {
  return div().flex_1().min_w(0).overflow_hidden().whitespace_nowrap().text_color(color).child(ch.repeat(400));
}

// [|] working (spins), [!] blocked (pulses), [+] done, [ ] idle; no status: empty.
export function marker(status, id) {
  if (!status) return div();
  const s = skin(), t = theme();
  const el = div().id(`mk-${id}`).flex_none().whitespace_nowrap();
  if (status === "working") return el.text_color(t.working).frames(s.spin.map((c) => `[${c}]`), 120).child(`[${s.spin[0]}]`);
  if (status === "blocked") return el.text_color(t.blocked).child(`[${s.blocked}]`).loop("opacity", { from: 0.4, to: 1, period: 1000 });
  if (status === "done") return el.text_color(t.done).child(`[${s.done}]`);
  return el.text_color(t.dim).child(`[${s.idle}]`);
}

// The picker opens right under the sidebar's [ Theme ] button, never at the pointer.
// ponytail: fixed spot, assumes the sidebar stays on the left under the 46px brand block.
export function openPicker() {
  openOverlay({ mod: "ascii", kind: "popup", frame: "none", width: 340, height: 190, at: { x: 8, y: 80 }, props: { role: "picker" } });
}

// "ctrl-shift-p" -> "^⇧P"
export function chord(keys) {
  const sym = { ctrl: "^", shift: "⇧", alt: "⌥", cmd: "⌘" };
  return keys.split("-").map((k) => sym[k] ?? k.toUpperCase()).join("");
}

// "#rrggbb" or "#rrggbbaa" -> "#rrggbb" + a
export const alpha = (c, a) => c.slice(0, 7) + a;
