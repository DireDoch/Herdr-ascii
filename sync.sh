#!/bin/sh
# Dev: copy the layout into Herdr's home (Herdr doesn't watch through symlinks).
cd "$(dirname "$0")/ascii" && cp -r layouts themes mods "${HERDR_APP_HOME:-$HOME/.config/herdr-app}/"
