Codeforces Dark Theme

This repository provides a dark theme for Codeforces packaged as a small browser extension. All runtime assets used by the extension are bundled locally in the `extension/` folder (`darktheme.css`, `desert.css`, `monokai.css`, and `content.js`).

This is the extension version of Codeforces Dark Theme. If you want the userscript version, refer to this repo: [Click](https://github.com/GaurangTandon/codeforces-darktheme)

Screenshot

![screenshot](extension/imgs/screenshot.png)

Quick install (developer mode)

- Chrome / Edge
    1.  Open `chrome://extensions` (or `edge://extensions`).
    2.  Enable "Developer mode".
    3.  Click "Load unpacked" and select this `extension/` folder.
    4.  Open https://codeforces.com and confirm the dark theme is applied.

- Firefox (temporary)
    1.  Open `about:debugging#/runtime/this-firefox`.
    2.  Click "Load Temporary Add-on..." and pick `extension/manifest.json`.

Sources and licenses

- This repository (the extension code and packaging) is licensed under the MIT License [LICENSE](LICENSE) in the repository root.
- The original Codeforces dark theme repository used as source for `darktheme.css` and `image assets` (and upstream reference for `desert.css` and `monokai.css` usage) is MIT-licensed:
  [LICENSE](https://github.com/GaurangTandon/codeforces-darktheme/blob/master/LICENSE)
- The project bundles two third-party styles used for syntax highlighting. Their original projects and licenses are acknowledged here and included as summaries in [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md):
    - Google Code Prettify (`desert.css`) — Apache License 2.0.
        - Source: https://github.com/google/code-prettify
    - Ace editor theme (`monokai.css`) — BSD-style (Ajax.org / ACE).
        - Source: https://github.com/ajaxorg/ace

Notes

- The `extension/` folder contains the unpacked extension files and the third-party styles packaged locally.
- If you redistribute this extension, please respect and include the third-party licenses (see [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md)).
