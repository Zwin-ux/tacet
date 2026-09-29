<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/tacet-banner-dark.png">
    <img src=".github/assets/tacet-banner-light.png" alt="Tacet: a stripped-down VS Code fork for writing. Mac and Windows. No AI, no account.">
  </picture>
</p>

<p align="center">
  <a href="#build-and-run">Build from source</a> ·
  <a href="https://www.mazenzwin.com">Website</a>
</p>

Tacet is a stripped-down fork of VS Code (Code - OSS) for writing Markdown and plain text. It keeps the editor, file explorer, search and terminal, and removes AI features, the extension marketplace, source control, debugging and telemetry. Your notes stay plain files on disk.

> **Early.** No signed release yet. Build it from source.

<p align="center">
  <img src=".github/assets/tacet-writing.png" alt="Tacet on a Mac: a note titled 'A quieter morning' with a paragraph, a checklist and a quote on a plain white page">
</p>

## Build and run

Node must match [`.nvmrc`](.nvmrc).

**macOS** (Apple silicon or Intel, Xcode command line tools):

```sh
nvm use
VSCODE_INSTALL_CONCURRENCY=3 npm ci
npm run compile
./scripts/code.sh                          # run
npm run gulp vscode-darwin-arm64-min       # package Tacet.app
```

**Windows** (x64, Visual Studio 2022 with the C++ workload and Spectre-mitigated libraries):

```powershell
nvm use 24.18.0
$env:VSCODE_INSTALL_CONCURRENCY=3; npm ci
npm run compile
.\scripts\code.bat
npm run gulp vscode-win32-x64-min
```

## License

MIT, with one exception for a few first-boot components (see [LICENSE.txt](LICENSE.txt)). Built on [Code - OSS](https://github.com/microsoft/vscode); not affiliated with Microsoft.

Made by [Mazen Zwin](https://www.mazenzwin.com). [Contributing](CONTRIBUTING.md) · [Security](SECURITY.md)
