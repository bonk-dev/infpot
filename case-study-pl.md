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

Ostateczny rozkład sieci:
- SLAN1: `155.21.22.0/24`
- SLAN2: `155.21.23.0/25`
- SLAN3: `155.21.23.128/25`

### Alternatywne rozkłady sieci
Sieć SLAN1 umieściliśmy na początku, ale tak naprawdę mogliśmy utrudnić sobie trochę zadanie i umieścić ją np. w środku. Utrudniłoby to artymetykę adresów. Dla przykładu umieścimy SLAN2 na początku puli: `155.21.22.0/25`.

Przechodzimy do liczenia adresu SLAN1 (adres sieci będzie odsunięty o 128 adresów, bo tyle miała podsieć SLAN2): `155.21.22.[0+128]` czyli `155.21.22.128`. Zatem adres podsieci SLAN1 to `155.21.22.128/24`.

Na koniec musimy obliczyć adres SLAN3 (tym razem odsuwamy adres o 256 adresów): `155.21.22.[128+256] = 155.21.22.[384]`. W ostatnim oktecie wystąpiło 384, co jest większe od 256, zatem: `155.21.[22+1].[384-256]` czyli `155.21.23.128`. W takim wypadku adres sieci SLAN3: `155.21.23.128/25`.

Ciekawostka: w SLAN1 adresami hostów mogą być wtedy adresy: `155.21.22.255` oraz `155.21.23.0`, co jest w pełni prawidłowe w tym wypadku.

Ostateczny (alternatywny) rozkład sieci:
- SLAN2: `155.21.22.0/25`
- SLAN1: `155.21.22.128/24`
- SLAN3: `155.21.23.128/25`

**Na potrzeby zadań będziemy korzystać z poprzedniego układu**.

## Adresowanie IPv6
Sieci IPv6 dzieli się w ten sam sposób, z tym że mamy narzucony mechanizm SLAAC, który działa wyłącznie na podsieciach /64, co znacznie ułatwia segmentację naszej puli.

Do naszej dyspozycji dostaliśmy pulę `2001:ACAD:A::/48`, w której dostępne jest `2^(128-48) = 2^80` adresów, czyli `1 208 925 819 614 629 174 706 176` (dużo). 

SLAAC wymusza na nas podział wyłącznie na podsieci /64, które mają `2^64` (również dużo) adresów, więc spokojnie pomieścimy w nich nasze 250, 120 i 80 urządzeń.

Prefiksy /16, /32, /48, /64 w IPv6 są odpowiednikami prefiksów /8, /16, /24, /32 z IPv4 w kontekście liczenia adresów sieci (tutaj są to n-te niezerowe wielokrotności liczby 16, w IPv4 liczby 8). W takim przypadku obliczenia kolejnych adresów sieci zostają sprowadzone do zwiększania n-tego bloku o jeden, przykładowo:
- sieć #1: `2001:BBBB:A:0::0/64`,
- sieć #2: `2001:BBBB:A:1::0/64`,
- sieć #3: `2001:BBBB:A:2::0/64`.

gdzie `64` to 4 niezerowa wielokrotność liczby 16, zatem zwiększamy czwarty blok. 

### Wyjaśnienie zależności n-tego bloku
Skąd wynika ta zależność? Z takiej samej arytmetyki adresów jak w przypadku IPv4. Jeżeli chcemy obliczyć adres sieci 2, to odsuwamy adres sieci 1 o 2^64 adresów.

Postaram się to zobrazować następującą tabelką:

| 2001 | BBBB | 000A | 0000 | 0000 | 0000 | 0000 | 0000 | ile adresów w zakresie |
|------|------|------|------|------|------|------|------| ---------------------- |
| 2001 | BBBB | 000A | 0000 | 0000 | 0000 | 0000 | 0000 |                      1 |
| 2001 | BBBB | 000A | 0000 | 0000 | 0000 | 0000 | 0001 |                      2 |
| 2001 | BBBB | 000A | 0000 | 0000 | 0000 | 0000 | FFFF |                   2^16 |
| 2001 | BBBB | 000A | 0000 | 0000 | 0000 | FFFF | FFFF |                   2^32 |
| 2001 | BBBB | 000A | 0000 | 0000 | FFFF | FFFF | FFFF |                   2^48 |
| 2001 | BBBB | 000A | 0000 | FFFF | FFFF | FFFF | FFFF |                   2^64 |
| 2001 | BBBB | 000A | 0001 | 0000 | 0000 | 0000 | 0000 |                2^64 + 1|

widać, że sieć 2001:BBBB:A:0::0/64 to zakres adresów: `2001:BBBB:A:0::0`-`2001:BBBB:A:0:FFFF:FFFF:FFFF:FFFF`; adres sieci 2 to kolejny następny. Gdy dodamy `1` do ostatniego hekstetu, otrzymamy `10000`, zatem wstawiamy `0000` (bo `10000` > `FFFF`), przenosimy jedynkę do poprzedniego hekstetu i tak aż do momenntu, gdy nie będziemy musieli dalej jej przenosić.

### Faktyczne zadanie
Przechodząc do podziału naszej puli `2001:ACAD:A::/48`, dzielimy ją na trzy podsieci /64 (ze względu na SLAAC):
- SLAN1: `2001:ACAD:A:0::0/64`,
- SLAN2: `2001:ACAD:A:1::0/64`,
- SLAN3: `2001:ACAD:A:2::0/64`.

## Przypisywanie (na papierze) adresów do urządzeń
Mając najtrudniejszy etap za sobą, przechodzimy do nadawania adresów urządzeniom w naszej sieci, zaczynając od sieci SLAN1. Każdemu urządzeniu musimy nadać adres IPv4, a adresy IPv6 tylko interfejsom routera oraz serwerowi.

### SLAN1
Sieci SLAN1 nadaliśmy następujące adresy:  
- IPv4: `155.21.22.0/24`,
- IPv6: `2001:ACAD:A:0::0/64`.

i znajdują się w niej 4 urządzenia:
- PC1,
- PC2,
- przekaźnik SLAN1_{nazwisko},
- router R1 (interfejs G0/0).

W nadawaniu adresów mamy pełną swobodę, dopóki używamy adresów z zakresu wydzielonej sieci oraz **nie** wykorzystujemy adresów sieci (pierwszego) oraz rozgłaszania (ostatniego) dla hostów.

Przykładowe przypisanie:
| Urządzenie | IPv4 | Maska podsieci | Brama domyślna |
| ---------- | ---- | -------------- | -------------- |
| R1 (G0/0) | 155.21.22.1 | 255.255.255.0 | nd. |
| przekaźnik SLAN1 (VLAN 1) | 155.21.22.2 | 255.255.255.0 | 155.21.22.1 |
| PC1 | 155.21.22.20 | 255.255.255.0 | 155.21.22.1 |
| PC2 | 155.21.22.21 | 255.255.255.0 | 155.21.22.1 |

| Urządzenie | IPv6 | Prefiks | Brama domyślna |
| ---------- | ---- | ------- | -------------- |
| R1 (G0/0) | 2001:ACAD:A:0::1 | /64 | nd. |

Dla reszty urządzeń w SLAN1 (i w innych sieciach) nie przypisujemy ręcznie adresów IPv6, ponieważ zostaną one wygenerowane przez SLAAC.

Dlaczego PC1 ma adres z końcówką `.20` a nie `.3`? Zostawiłem sobie bufor na przyszłe urządzenia sieciowe (takie jak dodatkowe switche), choć mógłbyć on troszkę mały :).

### SLAN2
W sieci SLAN2 wygląda to praktycznie tak samo, z tym że używamy adresów z puli `155.21.23.0/25` oraz `2001:ACAD:A:1::0/64`:

| Urządzenie | IPv4 | Maska podsieci | Brama domyślna |
| ---------- | ---- | -------------- | -------------- |
| R1 (G0/1) | 155.21.23.1 | 255.255.255.128 | nd. |
| przekaźnik SLAN2 (VLAN 1) | 155.21.23.2 | 255.255.255.128 | 155.21.23.1 |
| PC3 | 155.21.23.20 | 255.255.255.128 | 155.21.23.1 |
| PC4 | 155.21.23.21 | 255.255.255.128 | 155.21.23.1 |

| Urządzenie | IPv6 | Prefiks | Brama domyślna |
| ---------- | ---- | ------- | -------------- |
| R1 (G0/1) | 2001:ACAD:A:1::1 | /64 | nd. |

### SLAN3
W sieci SLAN3 również wygląda to tak samo, z tym że nadajemy adres IPv6 serwerowi i używamy adresów z puli `155.21.23.128/25` oraz `2001:ACAD:A:2::0/64`:

| Urządzenie | IPv4 | Maska podsieci | Brama domyślna |
| ---------- | ---- | -------------- | -------------- |
| R1 (F0/1/0) | 155.21.23.129 | 255.255.255.128 | nd. |
| przekaźnik SLAN3 (VLAN 1) | 155.21.23.130 | 255.255.255.128 | 155.21.23.129 |
| PC5 | 155.21.23.150 | 255.255.255.128 | 155.21.23.129 |
| Server1 | 155.21.23.151 | 255.255.255.128 | 155.21.23.129 |

| Urządzenie | IPv6 | Prefiks | Brama domyślna |
| ---------- | ---- | ------- | -------------- |
| R1 (F0/1/0) | 2001:ACAD:A:2::1 | /64 | nd. |
| Server1 | 2001:ACAD:A:2::2 | /64 | 2001:ACAD:A:2::1 |

## Konfiguracja urządzeń
Mając przygotowaną listę adresów IP, możemy przejść do konfiguracji urządzeń w Cisco Packet Tracerze.

### Router R1
R1 jest urządzeniem, które będzie kierowało ruchem pomiędzy sieciami SLAN1/2/3 oraz pomiędzy tymi sieciami i _"naszym Internetem"_.

Wchodzimy w tryb uprzywilejowany, a następnie w tryb konfiguracji globalnej za pomocą komend: `enable` i `configure terminal`. Wykonujemy po kolei polecenia:

#### Nazwa routera
Zmiana nazwy routera na `R1_Mickiewicz`:
```
Router(config)#hostname R1_Mickiewicz
R1_Mickiewicz(config)#
```

#### Hasło logowania (tryb EXEC)
Ustawianie hasła do trybu EXEC dla wszystkich linii:
Najłatwiej jest wyświetlić sobie dostępne linie, każdemu typowi po kolei nadać hasło i włączyć logowanie:

Gdy konfigurujemy kilka linii naraz, używamy polecenia:
```
R1_Mickiewicz(config)#line <typ> <start-zakresu> <koniec-zakresu>
```
W przypadku gdzie zmieniamy ustawienia pojedynczej linii, pomijamy _koniec-zakresu_:
```
R1_Mickiewicz(config)#line <typ> <nr linii>
```

Ustawmy hasło (_Zaq12wsx_) dla wszystkich linii:
```
R1_Mickiewicz(config)#line ?
  <2-499>  First Line number
  aux      Auxiliary line
  console  Primary terminal line
  tty      Terminal controller
  vty      Virtual terminal
  x/y/z    Slot/Subslot/Port for Modems
R1_Mickiewicz(config)#line aux ?
  <0-0>  First Line number
R1_Mickiewicz(config)#line aux 0
R1_Mickiewicz(config-line)#password Zaq12wsx
R1_Mickiewicz(config-line)#login
R1_Mickiewicz(config)#line console 0
R1_Mickiewicz(config-line)#password Zaq12wsx
R1_Mickiewicz(config-line)#login
R1_Mickiewicz(config-line)#exit
R1_Mickiewicz(config)#
R1_Mickiewicz(config)#line tty ?
  <2-90>  First Line number
R1_Mickiewicz(config)#line tty 2 90
No physical hardware support for line 2
R1_Mickiewicz(config)#line vty ?
  <0-15>  First Line number
R1_Mickiewicz(config)#line vty 0 15
R1_Mickiewicz(config-line)#password Zaq12wsx
R1_Mickiewicz(config-line)#login
R1_Mickiewicz(config-line)#exit
R1_Mickiewicz(config)#
```
Na liniach TTY nie da się ustawić hasła, ponieważ nie ma w routerze sprzętowego portu, który byłby obsługiwany przez linię 2 (o czym poinformował nas IOS: _No physical hardware support for line 2_).

#### Hasło do uprzywilejowanego trybu EXEC
W tym kroku skonfigurujemy hasło, które będziemy musieli podać po użyciu polecenia `enable`.

W trybie konfiguracji globalnej:
```
R1_Mickiewicz(config)#enable secret AdamX@a12#
R1_Mickiewicz(config)#
```

Warto wspomnieć, że hasło możemy ustawić zarówno za pomocą `secret` jak i `password`. Różnica pomiędzy tymi dwoma metodami jest znacząca: hasło ustawione przy użyciu `secret` będzie zahashowane w konfiguracji (będzie niemożliwe do odczytania), podczas gdy `password` zapisze je ot tak w formie możliwej do odzyskania.

#### Adresowanie interfejsów
