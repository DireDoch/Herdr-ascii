# Herdr ASCII

An ASCII layout for [Herdr](https://herdr.dev): sidebar, tabs, pane headers and
status bar drawn with plain `+ - | [ ]` characters, plus a skin picker
(`ctrl-shift-s`).

Early work in progress. Only the ASCII skin is ready; CRT, DOS and TUI skins
are planned.

## Install

Copy the `ascii/` folder's `layouts/`, `themes/` and `mods/` into
`~/.config/herdr-app/`, merge `ascii/keys.json` into your `keys.json`, then
switch layouts with `ctrl-shift-l`. Or give an agent this repo and let it follow
[`ascii/RECIPE.md`](ascii/RECIPE.md).

Developing: edit here, then run `./sync.sh` (Herdr doesn't follow symlinks).

## License

MIT
