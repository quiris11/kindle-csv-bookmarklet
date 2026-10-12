**English** | [Polski](README.pl.md)

# Kindle CSV Export

A bookmarklet that exports your entire Kindle library from Amazon's **Manage Your Content and Devices** page to a CSV file in a few seconds, right in your browser.

> **Unofficial tool.** Not affiliated with, endorsed by, or connected to Amazon. It reads the same data the page loads when you are logged in, using Amazon's internal (undocumented) API, so it may stop working if Amazon changes it.

## Features

- Exports every item in the selected view (tested with 3,500+ items)
- Fast: a few seconds for thousands of items, fetched 500 per request with several requests in parallel
- Respects the list, search phrase and sort order selected on the page
- Title, author, file size, date added, devices, collections and read status
- Progress overlay with elapsed time
- **Stop and save** button that keeps everything collected so far
- Excel-friendly CSV (UTF-8 with BOM, semicolon-separated)
- Runs locally: no browser extension, no password sharing, no external servers

## Exported data

| CSV column | Meaning | Example |
|---|---|---|
| `Tytuł` | Title | Latarnik z Mglistej Zatoki |
| `Autor` | Author(s) | Anna Przykładowa, Jan Testowy |
| `Rozmiar` | File size | 2.4 MB |
| `Data dodania` | Date added (YYYY-MM-DD) | 2025-03-14 |
| `Liczba urządzeń` | Number of devices with the item | 2 |
| `Urządzenia` | Device names, as named in your Amazon account | Kindle Paperwhite, Kindle for Android |
| `Kolekcje` | Collections | Do przeczytania, Kryminały |
| `Przeczytane` | Marked as read (`tak` = yes; empty for unread or unknown) | tak |
| `ID` | Amazon content ID | 0123456789ABCDEF0123456789ABCDEF |

The column headers are currently in Polish.

## Installation

1. Show the bookmarks bar: `Ctrl+Shift+B` (Windows/Linux) or `Cmd+Shift+B` (macOS).
2. Right-click the bar and choose **Add page…**
3. Name it, for example, `Kindle Export`.
4. In the **URL** field, paste the entire contents of [`kindle-csv-bookmarklet.txt`](kindle-csv-bookmarklet.txt). It is a single line starting with `javascript:`.
5. Save.

> Some browsers strip the `javascript:` prefix when you paste. If that happens, type it back in front of the code.

## Usage

1. Open [Manage Your Content and Devices](https://www.amazon.com/hz/mycd/digital-console/contentlist/pdocs/dateDsc/) and log in. The link opens **Docs** (personal documents sent to Kindle).
2. If you want a different list, choose it on the page: **Books**, **Audiobooks**, **Dictionaries & User Guides** or one of your collections. You can also type a search phrase to export only the matching items.
3. Wait for the list to load.
4. Click the bookmarklet.
5. The file `kindle-lista.csv` downloads automatically, usually within a few seconds.

The bookmarklet exports only the list that is currently shown. When it starts, the list jumps to the neighbouring page. This is expected: the bookmarklet clicks a page button once to learn which parameters the page uses.

If the list fits on one page (*Showing All (N)*, for example after a search), there is no page button. The bookmarklet then builds the request from the page address. This currently works for **Docs** and **Books**. For other lists that fit on one page (Audiobooks, Dictionaries & User Guides, small collections) it shows a message instead.

## Alternative: run from the DevTools console

If you prefer not to use a bookmark, open DevTools (`F12`) and paste the contents of [`kindle-csv-bookmarklet.js`](kindle-csv-bookmarklet.js) (the readable source) into the Console. In Chromium-based browsers you can also save it permanently under **Sources → Snippets** and run it with `Ctrl+Enter`.

## Troubleshooting

| Problem | Solution |
|---|---|
| Nothing happens after clicking the bookmark | Check that the URL starts with `javascript:` and that the code was pasted in full. |
| Alert asking you to open the content list | You are on a different Amazon page. Open *Manage Your Content and Devices → Content*. |
| "Couldn't read the list parameters" | The page did not load another page after the click. Reload the page, wait for the list and try again. |
| "Download error, partial data saved" | A request failed three times in a row. The file contains what was fetched so far. Run the export again. |
| "The page shows X items, Y were fetched" | The list changed during the export, or Amazon returned fewer items. Run the export again. |
| "This view is not supported when the list fits on one page" | Single-page lists are supported only in Docs and Books. Export a larger list that contains these items, or remove the search phrase. |
| A device ID appears instead of a device name | This usually means the item is on a device that is no longer registered to your account. |
| Console full of `ERR_BLOCKED_BY_CLIENT` errors | Your ad blocker is blocking Amazon telemetry. It is harmless, but disabling the blocker on amazon.com keeps the console clean. |
| Excel shows everything in one column | Your Excel uses a comma as the list separator. Import via **Data → From Text/CSV** and choose semicolon. |

## How it works

1. The bookmarklet briefly listens to the page's own network requests and clicks a pagination button once. The page then calls Amazon's `GetContentOwnershipData` endpoint, and the bookmarklet copies its parameters: the selected list, search phrase, sort order and the session's CSRF token. If the list fits on one page, there is nothing to click, so the parameters are built from the page address and the session's CSRF token is taken from the page.
2. It calls the same endpoint (`/hz/mycd/digital-console/ajax`) directly, requesting 500 items per call with 4 calls in parallel. Failed calls are retried up to three times.
3. Device names come from the `GetDeviceDetailsBatch` endpoint, which the page also uses.
4. Titles and authors are decoded from HTML entities and normalized to Unicode NFC. The date comes from a timestamp, so it does not depend on the interface language.
5. The CSV is built in memory and downloaded through a Blob URL.

## Privacy

Everything runs inside your browser tab. The bookmarklet only sends requests to amazon.com, to the same endpoints the page itself uses, with your existing session. It makes no requests to third-party servers, and your data never leaves your computer except as the downloaded file.

## Compatibility

- Tested in Chromium-based browsers on amazon.com.
- Other Amazon marketplaces that use the same page may work but have not been tested.
- Firefox has not been tested.

## Development

| File | Purpose |
|---|---|
| [`kindle-csv-bookmarklet.js`](kindle-csv-bookmarklet.js) | Readable, commented source. Edit this file. |
| [`kindle-csv-bookmarklet.txt`](kindle-csv-bookmarklet.txt) | Minified bookmarklet, generated by `build.sh`. Do not edit by hand. |
| [`build.sh`](build.sh) | Minifies the source with [terser](https://terser.org/) (via `npx`, requires Node.js) and adds the `javascript:` prefix. |

After changing the source, run `./build.sh` and commit both files.

## Contributing

Amazon changes its pages and internal API from time to time. If the export breaks, please open an issue and include:

- your browser and its version,
- the Amazon marketplace you use (amazon.com, amazon.de, …),
- the message shown in the export window and any errors from the DevTools console.

Do not attach HAR files or full API responses without removing personal data first: they contain your session tokens, device names and account IDs.

Pull requests are welcome.

## License

This project is released into the public domain under [The Unlicense](LICENSE). You can copy, modify and use it for any purpose, without asking for permission.
