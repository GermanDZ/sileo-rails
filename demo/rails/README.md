# Sileo Rails Demo

This Rails 8 app lives inside the gem repository and demonstrates toast behavior
using the local gem source.

## Prerequisites

- Ruby matching the `.ruby-version` used in your environment
- Bundler version matching `Gemfile.lock`
- Node.js + Yarn (for CSS bundling in `bin/dev`)

## First-time setup

```bash
cd demo/rails
bundle install
yarn install
bin/rails db:prepare
```

## Run the demo

```bash
cd demo/rails
bin/dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

If port `3000` is in use:

```bash
PORT=3008 bin/dev
```

## Troubleshooting

- If assets look stale, stop `bin/dev`, then run it again.
- If CSS is missing, ensure `yarn install` completed and the CSS watcher is running.
- If Bundler complains about version mismatch, install the locked Bundler version.

## Notes

- The app uses `gem "sileo-rails", path: "../.."`.
- The layout links the gem stylesheet via Propshaft logical path:
  `sileo`.
