# Block Fall

![alt text](assets/icon-128.png)

Block Fall is a classic falling-block puzzle game packaged as a **Chrome Manifest V3 extension**. It runs in Chrome's native side panel, so you can keep the game beside the page you're browsing without opening a separate tab, popup, or floating window.

The game uses a monochrome interface with System, Light, and Dark themes. It includes a 10 × 20 playfield, falling-piece previews, a hold slot, a ghost landing guide, score and level tracking, and keyboard or on-screen controls.

## Requirements

- Google Chrome **116 or newer**.
- Developer mode enabled for a manual installation from source.
- No account, external service, or network connection is required to play.

## Get Block Fall

### Option 1 — Download the project ZIP

1. Open the [Block Fall GitHub repository](https://github.com/darshseraphic/Titris).
2. On GitHub, open **Code** and choose **Download ZIP**.
3. Extract the downloaded archive to a folder on your computer.
4. Find the extension folder — the folder that contains `manifest.json` directly.

When an official packaged extension ZIP is provided with a project release, you can download and extract that package instead. Keep the extracted folder available because Chrome loads the extension from that folder.

### Option 2 — Clone the repository

Open a terminal and run:

```bash
git clone https://github.com/darshseraphic/Titris.git
cd Titris
```

After cloning, locate the folder containing `manifest.json`. That is the folder to load in Chrome. The repository name is `Titris`; the extension's displayed name is **Block Fall**.

## Install in Chrome

1. Open Chrome and go to `chrome://extensions`.
2. Turn on **Developer mode** using the switch near the top-right corner.
3. Select **Load unpacked**.
4. Choose the Block Fall extension folder — make sure `manifest.json` is directly inside the selected folder, not one folder deeper.
5. Confirm that Block Fall appears in your extensions list.
6. Select the Block Fall toolbar icon to open the game in Chrome's side panel. If the icon is hidden, open Chrome's Extensions menu and pin Block Fall to the toolbar.

To install an updated copy, replace or extract the updated project folder, return to `chrome://extensions`, and select **Reload** on the Block Fall card. If you moved the folder, use **Remove** and then **Load unpacked** with the new folder.

## How to play

The playfield is 10 columns wide and 20 rows tall. Arrange the falling pieces to complete horizontal lines. Completed lines disappear, your score increases, and the game gets faster as your level rises. The ghost piece indicates where the current piece will land if dropped straight down.

You can store one piece in the **Hold** slot and use the three-piece **Up Next** preview to plan ahead. A held piece can be swapped only once for each newly spawned piece.

### Controls

| Action | Keyboard | On-screen control |
| --- | --- | --- |
| Move left / right | `←` / `→` | Left / right buttons |
| Soft drop | `↓` | Down button |
| Rotate clockwise | `↑` or `X` | Rotate button |
| Rotate counter-clockwise | `Z` | Keyboard |
| Hard drop | `Space` | Hard drop button |
| Hold / swap piece | `C` | Hold piece button |
| Pause / resume | `P` or `Esc` | Pause / Resume button |
| Restart | `R` | Restart button |
| Start from the ready screen or after game over | `Enter` | Start game / Play again button |

For keyboard play, click the playfield first so it has focus. On-screen controls can be used instead of the keyboard. The game automatically pauses when the document becomes hidden, such as when the side panel is no longer visible.

## Features

- Native Chrome side panel opened from the extension toolbar icon.
- Classic 10 × 20 falling-block playfield.
- Seven-piece shuffled-bag generator.
- Ghost landing guide and three-piece next preview.
- Hold and swap piece, once per turn.
- Wall-aware rotation, line clears, scoring, and increasing levels.
- Score, current level, lines cleared, and personal-best display.
- Ready, playing, paused, and game-over states.
- System, Light, and Dark themes, cycled with the theme button.
- Keyboard and touch-friendly on-screen controls.
- Reduced-motion styling and visible keyboard focus treatment.
- Personal best and theme preference saved locally through Chrome extension storage.

## How the extension works

- `manifest.json` declares the Manifest V3 extension, toolbar action, side-panel page, service worker, icons, Chrome minimum version, and required permissions.
- `service-worker.js` tells Chrome to open the side panel when the toolbar action is clicked.
- `sidepanel.html` provides the interface and loads the local styles and scripts.
- `game.js` runs the game rules, animation loop, rendering, scoring, controls, and personal-best storage.
- `theme.js` cycles and saves the System, Light, and Dark theme preference.
- `sidepanel.css` contains the layout, visual design, responsive behavior, and theme styles.
- `assets/` contains the SVG brand mark and PNG extension icons.

The game is executed locally in the side panel. The extension does not declare website access (`host_permissions`), content scripts, or remote code. Its manifest permissions are `sidePanel` and `storage`; storage is used for the personal-best score and theme preference. No analytics or account system is included in the project.

## Project files

| File or folder | Purpose |
| --- | --- |
| `manifest.json` | Chrome Manifest V3 configuration, permissions, toolbar action, side panel, service worker, and icon declarations. |
| `service-worker.js` | Configures the toolbar action to open the native Chrome side panel. |
| `sidepanel.html` | Main side-panel document and interface structure. |
| `sidepanel.css` | Monochrome styling, layout, themes, responsive rules, and accessibility-related presentation. |
| `game.js` | Tetris-style game engine, piece generation, movement, rotation, collision, line clearing, scoring, drawing, game states, keyboard controls, and best-score persistence. |
| `theme.js` | System / Light / Dark theme cycling and local preference persistence. |
| `assets/logo.svg` | Scalable SVG Block Fall logo. |
| `assets/icon-12.png` | 12 × 12 pixel logo export. |
| `assets/icon-16.png` | 16 × 16 pixel Chrome toolbar icon. |
| `assets/icon-32.png` | 32 × 32 pixel logo export. |
| `assets/icon-48.png` | 48 × 48 pixel Chrome extension icon. |
| `assets/icon-64.png` | 64 × 64 pixel logo export. |
| `assets/icon-128.png` | 128 × 128 pixel Chrome extension/store-style icon. |
| `license.txt` | Proprietary source-available license supplied for this project. Read it before using the source or release. |
| `contributing.md` | How to report bugs and suggest improvements within the project license. |
| `security.md` | Extension permissions, local storage behavior, and vulnerability reporting guidance. |
| `changelog.md` | User-facing release history. |

## Privacy and security

Block Fall does not need access to the websites you visit. The extension stores the personal-best score and selected theme locally using Chrome's extension storage. See [security.md](security.md) for the permission and security notes.

## Contributing and license

Bug reports and improvement suggestions are welcome; see [contributing.md](contributing.md). The project is distributed under the proprietary source-available terms in [`license.txt`](license.txt), not an OSI-approved open-source license. In particular, viewing the public repository does not grant general rights to modify, redistribute, or commercially use the Software. Read the license before proceeding.

## Links

- **Repository:** <https://github.com/darshseraphic/Titris>
- **Security reports:** Darsh.seraphic@gmail.com
