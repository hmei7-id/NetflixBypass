# NETFLIX BYPASS WITH API / NETWORK BLOCKED

A browser extension that bypasses Netflix household verification for uninterrupted streaming.

## Project Structure

```
Netflix_Bypass/
├── src/                    # Shared extension source (all browsers)
│   ├── manifest.json       # Extension manifest (Manifest V3)
│   ├── background.js       # Background script — injects content script
│   ├── content.js          # DOM safety net — removes household modals
│   ├── inject_early.js     # Core bypass — patches fetch/XHR at document_start
│   ├── popup.html/css/js   # Extension popup UI
│   ├── rules.json          # Declarative network rules
│   └── icons/              # Extension icons
├── safari/                 # Xcode project for Safari
│   └── FlixBypass/
│       ├── FlixBypass.xcodeproj
│       ├── FlixBypass/           # Container app (Swift)
│       └── FlixBypass Extension/ # Safari extension target
├── chrome/                 # Chrome-specific build
├── edge/                   # Edge-specific build
└── firefox/                # Firefox-specific build
```

## Installation

You can either clone this repository or simply download the pre-packaged zip files directly from the repository.

### Chrome & Edge
1. Download `NetflixBypass-chrome.zip` (or `FlixBypass-edge.zip` for Edge) from this repository, or install directly from the [Edge Add-ons Store](https://microsoftedge.microsoft.com/addons/detail/ddfiepkngijjpldbjlhpidhefgledmia).
2. Extract the downloaded `.zip` file into a folder on your computer.
3. Open your browser and navigate to `chrome://extensions/` (or `edge://extensions/` for Edge).
4. Enable **Developer mode** (usually a toggle in the top right).
5. Click **Load unpacked** and select the extracted folder.

### Firefox
Install directly from the [Firefox Add-ons Store](https://addons.mozilla.org/en-US/firefox/addon/flixbypass/), or load it manually:
1. Download `NetflixBypass-firefox.zip` from this repository.
2. Extract the downloaded `.zip` file into a folder on your computer.
3. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
4. Click **Load Temporary Add-on...**
5. Select the `manifest.json` file inside the extracted folder.

### Safari (macOS)

Safari enforces strict security protocols that make loading sideloaded extensions extremely difficult. Apple does not allow permanent installation of loose `.zip` files unless they are compiled into a macOS app.

**Installation (Requires Xcode & Apple ID)**
*Note: This persists across restarts but requires compiling an app.*
1. Install **Xcode** from the Mac App Store (free).
2. Download the source code of this repository.
3. Open `safari/NetflixBypass/FlixBypass.xcodeproj` in Xcode.
4. Go to `Xcode` → `Settings` → `Accounts` and sign in with your Apple ID.
5. In Xcode's main view, click the `FlixBypass` project on the left. In the **Signing & Capabilities** tab for BOTH the `FlixBypass` target and `FlixBypass Extension` target, select your Apple ID in the **Team** dropdown.
6. Press `⌘R` to build and run the app. A dummy app will open; you can close it.
7. Open Safari, go to **Safari** → **Settings** → **Extensions**, and enable **FlixBypass**.

## How It Works

The extension uses a three-layer defense to keep you streaming:
- **Network Block:** Declarative rules block known Netflix verification endpoints.
- **Response Interception:** Patches network requests at document start to strip household verification payloads before the page sees them.
- **DOM Cleanup:** A background observer acts as a final safety net to visually remove any household modals that slip through.

## Development

Edit files in `src/` — the Xcode project references them directly (no copies to maintain).

## License

MIT License — see [LICENSE](LICENSE) for details.
