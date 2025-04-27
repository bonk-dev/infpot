# Case study z sieci - notatki
Autor: Dawid Pągowski

## Wstęp
Zadanie przeznaczone do samodzielnej realizacji będzie między innymi polegało na dobraniu adekwatnych adresów zarówno IPv4, jak i IPv6. Oprócz dzielenia na podsieci należy wykonać podstawowe zadania w systemie IOS, takie jak ustawienie aktualnej daty, haseł logowania oraz do trybu uprzywilejowania.

Zostały przewidziane również dodatkowe zadania: skonfigurowanie strefy DNS, aktualizacja oprogramowania i uruchomienie na urządzeniach serwera SSH.

## Przygotowanie topologii
Zanim dodamy urządzenia, muszę wspomnieć o pewnej opcji w ustawieniach: "zawsze pokazuj etykiety portów w logicznym obszarze roboczym". Dzięki tej opcji, po podłączeniu urządzeń, nie będziemy musieli sprawdzać za każdym razem do którego portu wpięte są jakie kable.

Do wykonania zadań będziemy potrzebowali kilku urządzeń: 5 komputerów, 1 serwer, 3 przekaźniki (model 2960) oraz dwa routery (model 1941). Każdemu dodanemu sprzętowi, dla ułatwienia, wolno nam przypisać "nazwy wyświetlania".

W naszym case study przewidziany został test połączenia z Internetem, który w naszym przypadku jest emulowany za pomocą dodatkowego routera, połączonego z naszym krawędziowym za pomocą światłowodu. Jest jeden problem, mianowicie routery 1941 nie posiadają wbudowanego modułu obsługującego takich połączeń. Nic strasznego, akurat te jednostki są modularne, więc jesteśmy w stanie taki moduł po prostu dodać (zanim to zrobimy, musimy najpierw to urządzenie wyłączyć). Konieczna jest również wkładka optyczna (GLC-LH-SMD).

W routerze "R1" brakuje jeszcze jednej rzeczy - portu Ethernet. W topologii występują 3 przekaźniki, a w modelu 1941 występują tylko dwa porty. W tym wypadku musimy dodać kolejny moduł - przekaźnikowy moduł HWIC-4ESW.

Po walce z dodawaniem modułów, zostało nam połączenie położonych jednostek kablami. Router ISP z R1 należy połączyć światłowodem.

### Konfiguracja routera ISP
Zanim przejdziemy do faktycznych zadań, musimy skonfigurować router dostawcy. Gotowe polecenia mamy w dokumencie, wystarczy je przepisać.

## Adresowanie IPv4
Jednym z zadań do wykonania jest podzielenie otrzymanej puli adresów na trzy mniejsze. W IPv4 dzielenie na podsieci odbywa się przez zwiększanie ilości bitów w masce podsieci (czyli ten numer po slashu). Istnieje pewna prosta reguła, pozwalająca na dzielenie podsieci, nawet w pamięci.

Zacznijmy od rozpracowania zadanej puli, co umożliwi nam na wyrobienie sobie ogólnych zasad dotyczących dzielenia na podsieci.

Nasza przydzielona pula to `155.21.22.0/23`. Numer 23 oznacza, że dostępna ilość hostów wynosi `2^(32-23) = 2^9 = 512`. W takim wypadku nasze podsieci będą mogły mieć po 256, 128, 64, 32, 16 itd. adresów. Zadanie wymaga od nas trzech podsieci: 
- SLAN1: maks. 250 urządzeń, 
- SLAN2: maks. 120 urządzeń,
- SLAN3: maks. 80 urządzeń.

Nie mogą one mieć innej ilości adresów, niż potęgi dwójki. W takim razie musimy podzielić naszą pulę na:
- SLAN1: 256 adresów -> maska /24 (`255.255.255.0`),
- SLAN2: 128 adresów -> maska /25 (`255.255.255.128`),
- SLAN3: 128 adresów -> maska /25 (`255.255.255.128`).

Sprawdzimy tylko, czy na pewno zmieścimy się w naszej przydzielonej puli: `256 + 128 + 128 = 512`. Zmieścimy się :)

Mamy już dobrane maski, przejdźmy do ustalania adresów sieci. Najbardziej intuicyjnie będzie umieścić sieć SLAN1 na początku puli (choć nie musi tak być, co pokażę później), zatem ta sieć będzie mieć adres `155.21.22.0/24`. 

Następnie musimy obliczyć kolejny adres sieci, do czego posłuży nam fakt, że w SLAN1 jest 256 adresów - SLAN2 będzie o 256 adresów dalej od `155.21.22.0/24`. Będziemy manipulować czwartym oktetem ze względu na to, że w masce `255.255.255.0` trzy pierwszy oktekty są równe `255`. Dodając 256 do ostatniego oktetu (który wynosił 0) otrzymujemy _155.21.22.[256]_. Wystąpiło 256 w czwartym oktecie, w takim przypadku (gdy występuje wartość równa lub większa 256) odejmujemy 256 i dodajemy do poprzedniego oktetu jedynkę. Otrzymujemy adres `155.21.[22+1].[256-256]` czyli `155.21.23.0`. Zatem adres sieci SLAN2 jest następujący: `155.21.23.0/25`.

W przypadku SLAN3 postępujemy podobnie, mając na uwagę, że w sieci SLAN2 jest 128 adresów, a nie 256. Ponownie manipulujemy czwartym oktetem z tego samego powodu, co w przypadku liczenia adresu sieci SLAN2. Adres sieci SLAN3 będzie odsunięty od 155.21.23.0 o 128 adresów. Liczymy: `155.21.23.[0+128]` czyli `155.21.23.128`. Tym razem w czwartym oktecie mamy wartość mniejszą od 256, więc otrzymany wynik jest adresem sieci SLAN3: `155.21.23.128/25`.

<!-- TODO: Add different layout (for example SLAN2, SLAN1, SLAN3 instead of SLAN1, SLAN2, SLAN3) -->