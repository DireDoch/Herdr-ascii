// Herdr ASCII: one mod, one part per place. Layout blocks pass props.role
// (sidebar, tabs, status); a pane header gets props.pane; the popup gets props.overlay.
import { View, div } from "gpui-kit";
import { props } from "herdr";
import Sidebar from "./sidebar.js";
import Tabs from "./tabs.js";
import Status from "./status.js";
import Pane from "./pane.js";
import Picker from "./picker.js";
import Sort from "./sort.js";

const PARTS = { sidebar: Sidebar, tabs: Tabs, status: Status, pane: Pane, picker: Picker, sort: Sort };

function role() {
  const p = props() ?? {};
  return p.role ?? (p.pane ? "pane" : p.overlay ? "picker" : null);
}

export default class Ascii extends View {
  init(p, cx) {
    const Part = PARTS[role()];
    if (!Part) return;
    for (const k of Object.getOwnPropertyNames(Part.prototype)) if (k !== "constructor" && k !== "init") this[k] = Part.prototype[k];
    Part.prototype.init?.call(this, p, cx);
  }

  render() { return div(); }
}
