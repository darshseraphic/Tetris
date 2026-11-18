# Security Policy

Block Fall is a Chrome Manifest V3 extension designed to run as a local game in Chrome's native side panel. This document describes its current security-related design and how to report a suspected vulnerability.

## Supported environment

- Google Chrome 116 or newer.
- The extension should be installed from the official project repository or an official, unmodified release supplied by the project maintainer.

## Permissions and access

The current `manifest.json` requests these Chrome permissions:

| Permission | Why it is used |
| --- | --- |
| `sidePanel` | Allows Chrome to display the game's side-panel page and open it from the toolbar action. |
| `storage` | Saves the personal-best score and theme preference in the extension's local storage area. |

The extension does not declare `host_permissions`, website content scripts, or access to browser tabs. The service worker only configures the toolbar action to open the side panel. The game and theme code are packaged with the extension; no remote scripts or external libraries are required.

## Data handling

- The personal-best score is saved with `chrome.storage.local`.
- The selected theme (System, Light, or Dark) is saved with `chrome.storage.local`.
- The current playfield and in-progress game session are not described by the code as a cloud or account-backed service; there is no account sign-in or analytics integration in the extension.
- When the scripts are run outside the Chrome extension environment for local development or inspection, they include a `localStorage` fallback for the score and theme. In the installed extension, the Chrome extension storage API is used.
- The project does not include network requests as part of normal game operation.

Chrome and the browser profile remain responsible for enforcing extension storage isolation and extension permissions. Removing the extension or clearing its stored site/extension data may remove locally saved preferences and scores.

## Reporting a vulnerability

Please do not publish details of an exploitable security issue in a public issue before the maintainer has had an opportunity to review it.

Send a private report to:

**Darshseraphic**  
Darsh.seraphic@gmail.com

Include, where possible:

1. A concise description of the suspected vulnerability and its potential impact.
2. The affected Block Fall version and Chrome version.
3. The steps needed to reproduce the issue.
4. A proof of concept or relevant logs, with passwords, personal information, and unrelated private data removed.
5. Any suggested mitigation, if you have one.

The maintainer can follow up to request additional details. Please allow time for investigation before disclosing the issue publicly. No response or remediation timeline is guaranteed.

## User safety recommendations

- Install only an unmodified copy from the project maintainer's repository or official release channel.
- Check the extension's requested permissions before loading it.
- Do not install repackaged builds from unknown sources.
- Keep Chrome updated.
- If an extension folder has been changed by an untrusted party, remove it from `chrome://extensions` and reinstall a trusted copy.

## Scope and limitations

This file documents the permissions and behavior visible in the current project source. It is not a claim that the extension has undergone an independent security audit, penetration test, or formal certification. Please report suspected issues even if you are unsure whether they are security vulnerabilities.
