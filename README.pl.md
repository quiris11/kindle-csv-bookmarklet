[English](README.md) | **Polski**

# Kindle CSV Export

Skryptozakładka, która eksportuje całą bibliotekę Kindle ze strony Amazon **Manage Your Content and Devices** (Zarządzaj zawartością i urządzeniami) do pliku CSV w kilka sekund. Działa bezpośrednio w przeglądarce.

> **Narzędzie nieoficjalne.** Nie jest powiązane z Amazonem ani przez niego wspierane. Pobiera te same dane, które strona wczytuje po zalogowaniu, korzystając z wewnętrznego (nieudokumentowanego) API Amazona, więc może przestać działać, jeśli Amazon je zmieni.

## Możliwości

- Eksport wszystkich pozycji z wybranego widoku (sprawdzone na ponad 3500 pozycjach)
- Szybkość: kilka sekund nawet dla tysięcy pozycji, bo dane są pobierane po 500 pozycji na zapytanie, kilkoma zapytaniami równolegle
- Uwzględnia listę, wyszukiwanie i sortowanie wybrane na stronie
- Tytuł, autor, rozmiar pliku, data dodania, urządzenia, kolekcje i status przeczytania
- Okienko z paskiem postępu i czasem, który minął
- Przycisk **Zatrzymaj i zapisz**, który zachowuje wszystko, co zostało już zebrane
- Plik CSV gotowy do otwarcia w Excelu (UTF-8 z BOM, separator: średnik)
- Działa lokalnie: bez wtyczek, bez podawania hasła, bez zewnętrznych serwerów

## Eksportowane dane

| Kolumna w CSV | Znaczenie | Przykład |
|---|---|---|
| `Tytuł` | Tytuł | Latarnik z Mglistej Zatoki |
| `Autor` | Autor lub autorzy | Anna Przykładowa, Jan Testowy |
| `Rozmiar` | Rozmiar pliku | 2.4 MB |
| `Data dodania` | Data dodania (RRRR-MM-DD) | 2025-03-14 |
| `Liczba urządzeń` | Na ilu urządzeniach jest pozycja | 2 |
| `Urządzenia` | Nazwy urządzeń, takie jak na koncie Amazon | Kindle Paperwhite, Kindle for Android |
| `Kolekcje` | Kolekcje | Do przeczytania, Kryminały |
| `Przeczytane` | Czy oznaczono jako przeczytane (puste: nieprzeczytane lub nieznane) | tak |
| `ID` | Identyfikator pozycji w Amazonie | 0123456789ABCDEF0123456789ABCDEF |

## Instalacja

1. Pokaż pasek zakładek: `Ctrl+Shift+B` (Windows/Linux) lub `Cmd+Shift+B` (macOS).
2. Kliknij pasek prawym przyciskiem i wybierz **Dodaj stronę…**
3. Nadaj nazwę, np. `Eksport Kindle`.
4. W polu **URL** wklej całą zawartość pliku [`kindle-csv-bookmarklet.txt`](kindle-csv-bookmarklet.txt). To jedna linia zaczynająca się od `javascript:`.
5. Zapisz.

> Niektóre przeglądarki ucinają przedrostek `javascript:` przy wklejaniu. Jeśli tak się stanie, dopisz go ręcznie przed kodem.

## Użycie

1. Otwórz stronę [Manage Your Content and Devices](https://www.amazon.com/hz/mycd/digital-console/contentlist/pdocs/dateDsc/) i zaloguj się. Odnośnik otwiera **Docs** (dokumenty osobiste wysłane na Kindle).
2. Jeśli chcesz inną listę, wybierz ją na stronie: **Books** (książki), **Audiobooks** (audiobooki), **Dictionaries & User Guides** (słowniki i instrukcje) albo jedną ze swoich kolekcji. Możesz też wpisać wyszukiwaną frazę, żeby wyeksportować tylko pasujące pozycje.
3. Poczekaj, aż lista się wczyta.
4. Kliknij skryptozakładkę.
5. Plik `kindle-lista.csv` pobierze się automatycznie, zwykle po kilku sekundach.

Eksportowana jest tylko lista widoczna na stronie. Po uruchomieniu lista przeskoczy na sąsiednią stronę. To zamierzone: skryptozakładka raz klika przycisk strony, żeby poznać parametry, których używa strona.

Jeśli lista mieści się na jednej stronie (*Showing All (N)*, np. po wyszukiwaniu), nie ma przycisku strony. Skryptozakładka buduje wtedy zapytanie na podstawie adresu strony. Na razie działa to dla **Docs** i **Books**. Dla innych list mieszczących się na jednej stronie (Audiobooks, Dictionaries & User Guides, małe kolekcje) pokazuje komunikat.

## Alternatywa: uruchomienie z konsoli DevTools

Jeśli nie chcesz używać zakładki, otwórz DevTools (`F12`) i wklej do zakładki Console zawartość pliku [`kindle-csv-bookmarklet.js`](kindle-csv-bookmarklet.js) (czytelne źródło). W przeglądarkach opartych na Chromium możesz też zapisać go na stałe w **Sources → Snippets** i uruchamiać skrótem `Ctrl+Enter`.

## Rozwiązywanie problemów

| Problem | Rozwiązanie |
|---|---|
| Po kliknięciu zakładki nic się nie dzieje | Sprawdź, czy adres zakładki zaczyna się od `javascript:` i czy kod został wklejony w całości. |
| Komunikat z prośbą o otwarcie listy zawartości | Jesteś na innej stronie Amazona. Otwórz *Manage Your Content and Devices → Content*. |
| „Nie udało się odczytać parametrów listy” | Po kliknięciu strona nie wczytała kolejnej strony listy. Odśwież stronę, poczekaj na listę i spróbuj ponownie. |
| „Błąd pobierania, zapisano część danych” | Zapytanie nie powiodło się trzy razy z rzędu. Plik zawiera to, co udało się pobrać. Uruchom eksport ponownie. |
| „Strona pokazuje X pozycji, pobrano Y” | Lista zmieniła się w trakcie eksportu albo Amazon zwrócił mniej pozycji. Uruchom eksport ponownie. |
| „Ten widok nie jest obsługiwany, gdy lista mieści się na jednej stronie” | Listy jednostronicowe są obsługiwane tylko w Docs i Books. Wyeksportuj większą listę, która zawiera te pozycje, albo usuń wyszukiwaną frazę. |
| Zamiast nazwy urządzenia widać identyfikator | Zwykle oznacza to, że pozycja jest na urządzeniu, które nie jest już zarejestrowane na Twoim koncie. |
| Konsola pełna błędów `ERR_BLOCKED_BY_CLIENT` | Bloker reklam blokuje telemetrię Amazona. To nieszkodliwe, ale wyłączenie blokera dla amazon.com usuwa te błędy. |
| Excel pokazuje wszystko w jednej kolumnie | Twój Excel używa przecinka jako separatora listy. Zaimportuj plik przez **Dane → Z pliku tekstowego/CSV** i wybierz średnik. |

## Jak to działa

1. Skryptozakładka na chwilę podsłuchuje zapytania sieciowe strony i raz klika przycisk paginacji. Strona wywołuje wtedy endpoint Amazona `GetContentOwnershipData`, a skryptozakładka kopiuje jego parametry: wybraną listę, wyszukiwaną frazę, sortowanie i token CSRF sesji. Jeśli lista mieści się na jednej stronie, nie ma czego kliknąć, więc parametry powstają z adresu strony, a token CSRF jest pobierany ze strony.
2. Wywołuje ten sam endpoint (`/hz/mycd/digital-console/ajax`) bezpośrednio, po 500 pozycji na zapytanie i 4 zapytania równolegle. Nieudane zapytania są ponawiane do trzech razy.
3. Nazwy urządzeń pochodzą z endpointu `GetDeviceDetailsBatch`, z którego korzysta też strona.
4. Tytuły i autorzy są dekodowane z encji HTML i normalizowane do Unicode NFC. Data pochodzi ze znacznika czasu, więc nie zależy od języka interfejsu.
5. Plik CSV jest budowany w pamięci i pobierany przez adres Blob.

## Prywatność

Wszystko dzieje się w karcie przeglądarki. Skryptozakładka wysyła zapytania wyłącznie do amazon.com, do tych samych endpointów, których używa strona, w ramach Twojej bieżącej sesji. Nie łączy się z żadnymi zewnętrznymi serwerami, a Twoje dane nie opuszczają komputera inaczej niż jako pobrany plik.

## Zgodność

- Sprawdzone w przeglądarkach opartych na Chromium na amazon.com.
- Inne sklepy Amazona korzystające z tej samej strony mogą działać, ale nie były testowane.
- Firefox nie był testowany.

## Rozwój

| Plik | Przeznaczenie |
|---|---|
| [`kindle-csv-bookmarklet.js`](kindle-csv-bookmarklet.js) | Czytelne źródło z komentarzami. Zmiany wprowadzaj tutaj. |
| [`kindle-csv-bookmarklet.txt`](kindle-csv-bookmarklet.txt) | Skondensowana skryptozakładka generowana przez `build.sh`. Nie edytuj ręcznie. |
| [`build.sh`](build.sh) | Minifikuje źródło narzędziem [terser](https://terser.org/) (przez `npx`, wymaga Node.js) i dodaje przedrostek `javascript:`. |

Po zmianie źródła uruchom `./build.sh` i zatwierdź oba pliki.

## Współtworzenie

Amazon co jakiś czas zmienia swoje strony i wewnętrzne API. Jeśli eksport przestanie działać, zgłoś problem (Issue) i podaj:

- przeglądarkę i jej wersję,
- sklep Amazona, z którego korzystasz (amazon.com, amazon.de, …),
- komunikat z okienka eksportu i ewentualne błędy z konsoli DevTools.

Nie dołączaj plików HAR ani pełnych odpowiedzi API bez usunięcia danych osobistych: zawierają tokeny sesji, nazwy urządzeń i identyfikatory konta.

Pull requesty są mile widziane.

## Licencja

Projekt jest udostępniony jako domena publiczna na zasadach [The Unlicense](LICENSE). Możesz go kopiować, zmieniać i wykorzystywać w dowolnym celu bez pytania o zgodę.
