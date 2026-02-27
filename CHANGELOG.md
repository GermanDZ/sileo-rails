## [Unreleased]

## [0.1.1] - 2026-02-27

- Fix: remove redundant `app/assets` parent path from engine initializer to prevent Propshaft `dedup` collision that caused `MissingAssetError` for `sileo.css`
- Fix: update stylesheet references from `stylesheets/sileo` to `sileo` to match corrected Propshaft logical path
- Docs: refreshed README with installation, Propshaft stylesheet path guidance, contribution section, and attribution to the original Sileo project
- Docs: expanded demo instructions and added `DEVELOPMENT.md` with setup, upgrade, and release workflow
- Tests: added coverage for configuration, helper behavior, controller methods, and engine entrypoints
- Tests: added regression spec asserting the engine does not register the redundant `app/assets` parent path
- Tooling: added `rake release:check` task for pre-publish verification

## [0.1.0] - 2026-02-17

- Initial release
