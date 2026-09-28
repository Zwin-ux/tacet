# Changelog

All notable changes to Tacet are recorded here. The format follows
[Keep a Changelog 1.1](https://keepachangelog.com/en/1.1.0/) and the project
uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

Based on Code OSS 1.139.0 (2242ebbb).

### Added
- Tacet product identity: name, window title, centered page, quiet default theme.
- Rich Markdown editor: `.md` files open writable in a document view.
- First-boot flow: look, import, notes folder, optional extras.
- Agent-files support: a plain editor for the files your agents read.
- Welcome extension built with React, Radix primitives and Motion.
- Bundled fonts: Cascadia Code and Source Serif 4 (SIL OFL 1.1).
- macOS and Windows builds from one branch; CI compiles both.
- Open-source files: README, CONTRIBUTING, SECURITY, CODE_OF_CONDUCT, issue forms, CodeQL, Dependabot for GitHub Actions.
- Third-party notices for what Tacet adds to upstream.

### Changed
- License file credits Tacet contributors and keeps Microsoft's MIT notice.
- Tacet-authored files carry Tacet copyright headers.

### Removed
- AI features (Copilot, chat, sessions), telemetry, source control UI, notebooks, and debug entry points.
- Tunnel forwarding built-in extension.
- Upstream workflows, agent instruction files, CODEOWNERS, dev container and Azure Pipelines definitions.
