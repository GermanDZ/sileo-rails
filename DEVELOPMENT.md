# DEVELOPMENT

This document describes how to work on `sileo-rails`, verify changes, and
publish a new gem version.

## Repository layout

- `lib/` gem runtime code and engine
- `app/assets` gem CSS + assets exposed to host Rails apps
- `app/javascript/sileo` JS modules and Stimulus controller
- `spec/` RSpec suite
- `demo/rails` local Rails app for manual validation

## Local setup

```bash
bundle install
```

Optional demo setup:

```bash
cd demo/rails
bundle install
yarn install
bin/rails db:prepare
```

## Run tests

From repository root:

```bash
bundle exec rspec
```

## Manual verification with demo

```bash
cd demo/rails
bin/dev
```

Then verify:

- Demo page loads successfully
- Toasts triggered from UI show and dismiss correctly
- Controller-triggered notifications render
- No missing asset errors for Sileo stylesheet

## Updating dependencies

1. Update gem constraints in `sileo-rails.gemspec` only when necessary
2. Run `bundle update` selectively (avoid broad updates when possible)
3. Re-run the full test suite
4. Re-run demo app smoke check
5. Update docs/changelog for any behavior change

## Release process

1. Ensure `CHANGELOG.md` has unreleased notes ready
2. Update version in `lib/sileo/version.rb`
3. Move release notes from `Unreleased` to a dated version section
4. Run final checks:

```bash
bundle exec rspec
gem build sileo-rails.gemspec
```

5. Commit release changes
6. Tag release:

```bash
git tag vX.Y.Z
git push origin vX.Y.Z
```

7. Publish gem:

```bash
gem push sileo-rails-X.Y.Z.gem
```

8. Create GitHub release notes for the same tag

## Pre-publish checklist

- [ ] README installation steps are accurate
- [ ] Demo instructions are accurate
- [ ] LICENSE is MIT
- [ ] Specs pass
- [ ] Gem builds locally
- [ ] CHANGELOG updated
- [ ] Version/tag aligned

## Contributing workflow

1. Branch from `main`
2. Make focused changes
3. Add/update specs
4. Run tests locally
5. Submit PR with:
   - problem statement
   - approach
   - verification steps
   - screenshots/GIF (if UI behavior changed)
