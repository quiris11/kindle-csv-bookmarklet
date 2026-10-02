**English** | [Polski](README.pl.md)

# Kindle CSV Export

A bookmarklet that exports your entire Kindle library from Amazon's **Manage Your Content and Devices** page to a CSV file, with a live progress bar, right in your browser.

> **Unofficial tool.** Not affiliated with, endorsed by, or connected to Amazon. It only reads the page you already see when you are logged in, and it may stop working if Amazon changes the page layout.

## Features

- Exports every item across all pages (tested with 3,500+ items)
- Title, author, file size, date added, devices, collections and read status
- Live progress overlay with elapsed time and estimated time remaining
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
| `Urządzenia` | Device names | Kindle Paperwhite, Kindle for Android |
| `Kolekcje` | Collections | Do przeczytania, Kryminały |
| `Przeczytane` | Marked as read (`tak` = yes) | tak |
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

1. Open [Manage Your Content and Devices](https://www.amazon.com/hz/mycd/digital-console/contentlist/allcontent/dateDsc/) and log in.
2. In the **View** filter, choose what you want to export (for example **All Content**, **Books** or **Docs**).
3. Wait for the list to load.
4. Click the bookmarklet.
5. Keep the tab in the foreground until the export finishes. The file `kindle-lista.csv` downloads automatically.

The bookmarklet exports only the view that is currently selected. Expect a few minutes for a few thousand items, because Amazon loads 25 items per page and each page is fetched separately.

## Alternative: run from the DevTools console

If you prefer not to use a bookmark, open DevTools (`F12`) and paste the code from `bookmarklet.txt` **without** the leading `javascript:` into the Console. In Chromium-based browsers you can also save it permanently under **Sources → Snippets** and run it with `Ctrl+Enter`.

## Troubleshooting

| Problem | Solution |
|---|---|
| Nothing happens after clicking the bookmark | Check that the URL starts with `javascript:` and that the code was pasted in full. |
| Alert asking you to open the content list | You are on a different Amazon page. Open *Manage Your Content and Devices → Content*. |
| Export gets very slow | Chrome throttles scripts in background tabs. Keep the Amazon tab visible while the export runs. |
| "Next page didn't load" | Usually a slow connection. A file with the data collected so far is still saved. Run the export again. |
| Console full of `ERR_BLOCKED_BY_CLIENT` errors | Your ad blocker is blocking Amazon telemetry. It is harmless, but disabling the blocker on amazon.com keeps the console clean. |
| Dates are not converted to YYYY-MM-DD | Date parsing expects the English UI (`Created on March 14, 2025`). In other languages the original text is kept. |
| Excel shows everything in one column | Your Excel uses a comma as the list separator. Import via **Data → From Text/CSV** and choose semicolon. |

## How it works

The bookmarklet reads the rows of the rendered list, clicks through the pagination, and waits until each new page has actually loaded by watching both the first item on the list and the *Showing X to Y of Z items* counter. Items are deduplicated by content ID. When the last page is done, the CSV is built in memory and downloaded through a Blob URL.

## Privacy

Everything runs inside your browser tab. The bookmarklet makes no requests to third-party servers, and your data never leaves your computer except as the downloaded file.

## Compatibility

- Tested in Chromium-based browsers (Chrome, Edge, Brave) on amazon.com with the English interface.
- Other Amazon marketplaces that use the same page may work but have not been tested.
- Firefox has not been tested.

## Contributing

Amazon changes the page layout from time to time. If the export breaks, please open an issue and include:

- your browser and its version,
- the Amazon marketplace you use (amazon.com, amazon.de, …),
- the HTML of a single list row, with personal information removed.

Pull requests are welcome.

## License

This project is released into the public domain under [The Unlicense](LICENSE). You can copy, modify and use it for any purpose, without asking for permission.
