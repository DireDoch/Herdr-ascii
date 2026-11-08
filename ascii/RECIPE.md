# Herdr ASCII

Herdr's usual window (sidebar, tabs, framed panes, status bar) redrawn in plain
7-bit ASCII: `[ 1:fish ]` tabs, `+-- name -- ~/dir ----+` pane headers, `== spaces ==`
rules, and agent statuses as `[|]` spinners. A near-black theme with one teal
accent. A skin picker under the sidebar's `[ Theme ^⇧S ]` button switches skins;
only the ASCII skin is finished, CRT, DOS and TUI are listed as "soon".

![Herdr ASCII](preview.png)

## What you see

Left to right, top to bottom. All text is the layout's `ui_font`
(JetBrainsMono Nerd Font, falling back to JetBrains Mono); chrome text is 13px,
pane headers and the status bar 12px.

- **Sidebar, 268px.**
  - Brand block, 46px: Herdr's own `workspace-chrome` (logo, search, collapse).
  - `[ Theme ^⇧S ]` in accent `#1dc7b5`.
  - `== spaces ====[+]`: rule in dim, `[+]` makes a space. One row per space:
    `[*]` (accent) or `[ ]`, name, `(branch)` in dim, the space's status marker.
    The active row has background `selected` `#13304a`.
  - `== agents (N) ====(o)`: one row per agent: status marker, program name,
    space name (dim, hidden when grouped), pin toggle `[ ]` / `[^]` (accent).
    In "Grouped by space" mode each group has a `- space name` subheading.
  - A bare `====` rule, then `[ Settings ]` (`[ Settings * ]` when an update waits)
    and `[ + Machine ]` (dim).
- **Rail** (sidebar under 160px): centered column of `[~]` theme, `===`,
  `[+]`, `[n]` per space (status color if any, else accent when active, dim
  otherwise; active gets the `selected` background), `===`, one marker per agent,
  `>>` expand, `===`, `[#]` settings (`[*]` with an update), `[+]` machine.
- **Tab bar, 32px**, `chrome` background, bottom border: `[ 1:Claude Code [|] ]`
  per tab (active in accent, others muted; unnamed tabs show their agent's or
  first pane's program name; ` Z` when zoomed), then `[+]` (dim). Right side:
  `[ Files]` `[ Changes]`, `[*Files]` when that panel is open.
- **Panes**: gap 4, radius 0, 1px `border`, focused pane 1px accent, framed even
  when alone. 24px header: `+--` name `--` folder (dim, `~` for home), a `-` fill
  to the edge, status marker, `[|]` split right, `[-]` split down, `[Z]` zoom,
  `[x]` close, `+`. Corners and fill are accent on the focused pane, dim otherwise.
- **Side panel**, 368px, hidden by default: Herdr's `files` and `changes` in a stack.
- **Status bar, 24px**, top border: `-- This computer | main | 2 agents 1 working | 1 needs you ----- 05:18 | skin: ascii | ^⇧P commands --`.
- **Theme `ascii`**: background `#0c0d0e`, text `#c5c8c6`, chrome `#0c0d0e`,
  border `#4a4f55`, accent/working `#1dc7b5`, blocked `#e5c07b`, done `#98c379`,
  selected `#13304a`, selection `#1f3b3a`; ANSI colors from Atom One Dark.

## How it behaves

- **Agent status markers** (sidebar, rail, tabs, pane headers):
  working `[|]` `[/]` `[-]` `[\]` every 120ms in `working`; blocked `[!]` in
  `blocked`, opacity pulsing 0.4 to 1 over 1000ms; done `[+]` in `done`;
  idle `[ ]` dim. Tabs and spaces show their most urgent status. Plain shells
  show nothing.
- **Skin picker**: `[ Theme ^⇧S ]`, `[~]`, `skin: ascii` or `ctrl-shift-s` opens
  it at a fixed spot under the button (x 8, y 80), 360x190, ~75% opaque popover
  with a 1px accent border. Pressing again closes it; only one is ever open.
  Rows: cursor `>`, `(*)` current skin / `( )`, name, a sample of the skin's
  characters, three swatches (background, text, accent) or `soon`. Up/Down move
  the cursor only; Enter applies (saves the skin, runs `app.theme`) and closes;
  Esc cancels. Footer: `↑↓ select   ⏎ apply   Esc cancel`. Unfinished skins are
  dim and can't be applied.
- **Sort agents**: `(o)` opens a 230x96 popup at the pointer, same box:
  `(*) Priority` (pinned, then blocked > done > working > idle, then most recent)
  or `( ) Grouped by space`. Saved; `alt-up` / `alt-down` follow the order shown.
- **Sidebar clicks**: space selects it; agent focuses its pane, right-click peeks;
  `[^]` pins; `>>` restores the last width.
- **Tabs**: click selects, double-click renames, middle-click closes, right-click
  opens Herdr's tab menu, wheel moves between tabs. `[+]` opens `ascii-new-menu`.
- **Pane header**: click focuses the pane; the buttons split, zoom, close it.
- **Status bar**: clock refreshes when the minute changes; `^⇧P commands` opens
  the palette (shows the real binding).

## Built from

- `layouts/ascii.json`: root `row` (theme `ascii`, fonts as above, 1px divider):
  `sidebar` column [`brand` block: `workspace-chrome`; `spaces` block:
  `ascii` with `{ role: "sidebar" }`], `work` column [`tabs`: `ascii`
  `{ role: "tabs" }`; `work-body` row [`main`: `{ tab: "active" }` with pane
  header mod `ascii`; `panel` column, hidden, `panel-body` stack of `files` and
  `changes`]; `status`: `ascii` `{ role: "status" }`].
- `mods/ascii/` is one mod. `main.js` picks a part by `props().role`, else
  `pane` when `props().pane` is set (pane headers), and copies that part's
  methods onto itself: `sidebar.js`, `tabs.js`, `pane.js`, `status.js`,
  `picker.js` (role `picker`), `sort.js` (role `sort`). `skins.js` holds the skin
  table (`SKINS`: characters, spinner frames, sample, theme, `ready`) and helpers
  (`marker`, `fill`, `popupBox`, `openPicker`, `chord`, `alpha`).
- `mods/ascii-new-menu/`: a `mod.clone` of Herdr's `new-menu` whose only change
  is the root: 75%-opaque popover background and a 1px accent border, opened
  with `frame: "none"`.
- `themes/ascii.json`; `keys.json`: `{"layout:ascii": {"ctrl-shift-s": "ascii.picker"}}`,
  delivered to the sidebar copy through `nextCommand()`.
- Herdr API: `spaces`, `agents`, `panes`, `layout`, `theme`, `themes`, `keys`,
  `updates`, `shared`/`setShared` (`ascii.skin`, `ascii.picker`,
  `ascii.agentSort`, Herdr's `sidebar.width`, `workspace.panels`),
  `setAgentOrder`, `openOverlay`/`closeOverlay`, `nextCommand`. Commands:
  `space.new|select`, `tab.select|rename|close`, `pane.focus|split|zoom|close`,
  `terminal.peek|pin`, `layout.show|hide|select|resize`, `app.theme|settings|palette`,
  `mod.open` (`machine-add`). No programs run, no network, no files read.

## Watch out

- A mod can't import from another mod's folder: everything shared lives in one
  mod with roles.
- `.child(null)` throws: return `div()` for "nothing".
- `.frames([...])` needs a first `.child(...)` or it draws empty.
- Theme colors may already carry alpha (`selected` is `#ffffff17` in some
  themes): cut to 7 characters before adding your own.
- `openOverlay` with no `at` opens at the pointer, even from a key; and every
  call opens another popup, so keep the id and toggle.
- Herdr doesn't see edits made through symlinks into `~/.config/herdr-app`: copy.
- The picker's fixed spot assumes the sidebar on the left under a 46px brand block.
- Long lines (`-` fills) are a 400-character string clipped by `overflow_hidden`.
- The ASCII skin never uses Nerd Font glyphs, so it looks the same without one.

## Done when

- `herdr-app check mods/ascii` and `mods/ascii-new-menu` pass; `layout.switch {name: "ascii"}` shows no "could not be rendered" box anywhere.
- A working agent spins `[|]` in the sidebar, its tab and its pane header.
- `ctrl-shift-s` opens the picker under `[ Theme ^⇧S ]`; pressing it three times leaves exactly one overlay (`herdr-app status`).
- Enter on ASCII closes the picker; Esc leaves the skin unchanged.
- Collapsing the sidebar (the brand block's collapse button) shows the rail with the active `[n]` highlighted; `>>` brings it back.
- `[+]` by spaces makes a space; `(o)` switches the agents list between priority and grouped.
- `[ Files]` opens the side panel and turns into `[*Files]`.
