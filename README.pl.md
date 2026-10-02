[English](README.md) | **Polski**

# Kindle CSV Export

Skryptozakładka, która eksportuje całą bibliotekę Kindle ze strony Amazon **Manage Your Content and Devices** (Zarządzaj zawartością i urządzeniami) do pliku CSV. Działa bezpośrednio w przeglądarce i pokazuje postęp na bieżąco.

> **Narzędzie nieoficjalne.** Nie jest powiązane z Amazonem ani przez niego wspierane. Odczytuje wyłącznie stronę, którą i tak widzisz po zalogowaniu, i może przestać działać, jeśli Amazon zmieni jej wygląd.

## Możliwości

- Eksport wszystkich pozycji ze wszystkich stron listy (sprawdzone na ponad 3500 pozycjach)
- Tytuł, autor, rozmiar pliku, data dodania, urządzenia, kolekcje i status przeczytania
- Okienko z paskiem postępu, czasem, który minął, i szacowanym czasem do końca
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
| `Urządzenia` | Nazwy urządzeń | Kindle Paperwhite, Kindle for Android |
| `Kolekcje` | Kolekcje | Do przeczytania, Kryminały |
| `Przeczytane` | Czy oznaczono jako przeczytane | tak |
| `ID` | Identyfikator pozycji w Amazonie | 0123456789ABCDEF0123456789ABCDEF |

## Instalacja

1. Pokaż pasek zakładek: `Ctrl+Shift+B` (Windows/Linux) lub `Cmd+Shift+B` (macOS).
2. Kliknij pasek prawym przyciskiem i wybierz **Dodaj stronę…**
3. Nadaj nazwę, np. `Eksport Kindle`.
4. W polu **URL** wklej całą zawartość pliku [`kindle-csv-bookmarklet`](kindle-csv-bookmarklet.txt). To jedna linia zaczynająca się od `javascript:`.
5. Zapisz.

> Niektóre przeglądarki ucinają przedrostek `javascript:` przy wklejaniu. Jeśli tak się stanie, dopisz go ręcznie przed kodem.

## Użycie

1. Otwórz stronę [Manage Your Content and Devices](https://www.amazon.com/hz/mycd/digital-console/contentlist/allcontent/dateDsc/) i zaloguj się.
2. W filtrze **View** wybierz, co chcesz wyeksportować, np. **All Content** (wszystko), **Books** (kupione książki) albo **Docs** (dokumenty wysłane na Kindle).
3. Poczekaj, aż lista się wczyta.
4. Kliknij skryptozakładkę.
5. Nie przełączaj się na inną kartę, dopóki eksport się nie skończy. Plik `kindle-lista.csv` pobierze się automatycznie.

Eksportowany jest tylko widok wybrany w filtrze. Przy kilku tysiącach pozycji eksport trwa kilka minut, bo Amazon wyświetla 25 pozycji na stronę i każdą stronę wczytuje osobno.

## Alternatywa: uruchomienie z konsoli DevTools

Jeśli nie chcesz używać zakładki, otwórz DevTools (`F12`) i wklej do zakładki Console kod z pliku `bookmarklet.txt` **bez** początkowego `javascript:`. W przeglądarkach opartych na Chromium możesz też zapisać go na stałe w **Sources → Snippets** i uruchamiać skrótem `Ctrl+Enter`.

## Rozwiązywanie problemów

| Problem | Rozwiązanie |
|---|---|
| Po kliknięciu zakładki nic się nie dzieje | Sprawdź, czy adres zakładki zaczyna się od `javascript:` i czy kod został wklejony w całości. |
| Komunikat z prośbą o otwarcie listy zawartości | Jesteś na innej stronie Amazona. Otwórz *Manage Your Content and Devices → Content*. |
| Eksport bardzo zwalnia | Chrome spowalnia skrypty w kartach w tle. Zostaw kartę Amazona na wierzchu do końca eksportu. |
| Komunikat, że następna strona się nie wczytała | Zwykle to wolne połączenie. Plik z dotychczas zebranymi danymi i tak zostanie zapisany. Uruchom eksport ponownie. |
| Konsola pełna błędów `ERR_BLOCKED_BY_CLIENT` | Bloker reklam blokuje telemetrię Amazona. To nieszkodliwe, ale wyłączenie blokera dla amazon.com usuwa te błędy. |
| Daty nie są zamieniane na format RRRR-MM-DD | Rozpoznawanie dat zakłada angielski interfejs (`Created on March 14, 2025`). W innych językach zostaje oryginalny tekst. |
| Excel pokazuje wszystko w jednej kolumnie | Twój Excel używa przecinka jako separatora listy. Zaimportuj plik przez **Dane → Z pliku tekstowego/CSV** i wybierz średnik. |

## Jak to działa

Skryptozakładka odczytuje wiersze wyświetlonej listy, przechodzi przez kolejne strony i za każdym razem czeka, aż nowa strona faktycznie się wczyta. Sprawdza przy tym zarówno pierwszą pozycję na liście, jak i licznik *Showing X to Y of Z items*. Duplikaty są usuwane na podstawie identyfikatora pozycji. Po ostatniej stronie plik CSV jest budowany w pamięci i pobierany przez adres Blob.

## Prywatność

Wszystko dzieje się w karcie przeglądarki. Skryptozakładka nie wysyła żadnych zapytań do zewnętrznych serwerów, a Twoje dane nie opuszczają komputera inaczej niż jako pobrany plik.

## Zgodność

- Sprawdzone w przeglądarkach opartych na Chromium (Chrome, Edge, Brave) na amazon.com z angielskim interfejsem.
- Inne sklepy Amazona korzystające z tej samej strony mogą działać, ale nie były testowane.
- Firefox nie był testowany.

## Współtworzenie

Amazon co jakiś czas zmienia wygląd strony. Jeśli eksport przestanie działać, zgłoś problem (Issue) i podaj:

- przeglądarkę i jej wersję,
- sklep Amazona, z którego korzystasz (amazon.com, amazon.de, …),
- kod HTML jednego wiersza listy, z usuniętymi danymi osobistymi.

Pull requesty są mile widziane.

## Licencja

Projekt jest udostępniony jako domena publiczna na zasadach [The Unlicense](LICENSE). Możesz go kopiować, zmieniać i wykorzystywać w dowolnym celu bez pytania o zgodę.
