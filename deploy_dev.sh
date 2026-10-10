#!/usr/bin/env bash
# Applies the installers, builds, then commits and pushes to the dev branch ONLY.
# Run from your project root:  bash deploy_dev.sh   (optional: bash deploy_dev.sh "your commit message")
set -euo pipefail

BRANCH=dev
MSG="${1:-App refresh: Connect flow, peer profiles, merged profile; add /jee landing page}"
INSTALLERS="install_app_refresh.mjs install_jee_landing.mjs"

[ -f package.json ] && [ -d src ] || { echo "Run this from your project root (the folder with package.json)."; exit 1; }

# 1. Be on dev. Never main.
if [ "$(git branch --show-current)" != "$BRANCH" ]; then
  git fetch origin
  git checkout "$BRANCH"
fi
[ "$(git branch --show-current)" = "$BRANCH" ] || { echo "Not on $BRANCH. Stopping."; exit 1; }
echo "On branch: $(git branch --show-current)"

# 2. Start from the latest dev (keeps your uncommitted work safe)
git pull --rebase --autostash origin "$BRANCH"

# 3. Apply installers (picks them up from ~/Downloads if they are not in the project root)
for f in $INSTALLERS; do
  if [ ! -f "$f" ] && [ -f "$HOME/Downloads/$f" ]; then cp "$HOME/Downloads/$f" "$f"; fi
  if [ -f "$f" ]; then
    echo "--- running $f"
    node "$f"
  else
    echo "--- $f not found, skipping"
  fi
done

# 4. Installers are one-off tools: keep them out of git
grep -q 'install_\*' .gitignore 2>/dev/null || printf '\ninstall_*.mjs\ninstall_*\n' >> .gitignore

# 5. Build. Nothing is pushed if this fails.
npm run build

# 6. Stage only the project folders, then refuse to continue if any env file slipped in
for p in src public supabase .gitignore package.json package-lock.json; do
  [ -e "$p" ] && git add "$p"
done
if git diff --cached --name-only | grep -E '(^|/)\.env' >/dev/null; then
  echo "An .env file is staged. Stopping so no secrets are pushed."; exit 1
fi

# 7. Commit (skipped if nothing changed) and push to dev only
if git diff --cached --quiet; then
  echo "Nothing new to commit."
else
  git commit -m "$MSG"
fi
git push -u origin "$BRANCH"

echo
echo "Pushed to $BRANCH: $(git log -1 --oneline)"
echo "main was not touched. Vercel is now building the dev preview."
echo "Still to do by hand: run supabase/migrations/20261010000012_jee_waitlist.sql in the Supabase SQL Editor."
