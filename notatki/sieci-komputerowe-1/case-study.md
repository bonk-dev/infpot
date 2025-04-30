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
- przekaźnik SLAN1_\{nazwisko\},
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
W tym kroku skorzystamy z wcześniej przygotowanej tabelki z adresami IP.

Przechodząc do konfiguracji interfejsu `G0/0`, który należy do sieci SLAN1:
```
R1_Mickiewicz(config)#interface g0/0
R1_Mickiewicz(config-if)#ip address 155.21.22.1 255.255.255.0
R1_Mickiewicz(config-if)#ipv6 address 2001:ACAD:A:0::1/64
R1_Mickiewicz(config-if)#no shutdown

R1_Mickiewicz(config-if)#
%LINK-5-CHANGED: Interface GigabitEthernet0/0, changed state to up
```
Gdzie polecenie `no shutdown` włącza administracyjnie nasz interfejs (w routerze wszystkie są domyślnie wyłączone).

Interfejs `G0/1` należący do sieci SLAN2 konfigurujemy analogicznie:
```
R1_Mickiewicz(config)#interface g0/1
R1_Mickiewicz(config-if)#ip address 155.21.23.1 255.255.255.128
R1_Mickiewicz(config-if)#ipv6 address 2001:ACAD:A:1::1/64
R1_Mickiewicz(config-if)#no shutdown

R1_Mickiewicz(config-if)#
%LINK-5-CHANGED: Interface GigabitEthernet0/1, changed state to up
```

Następnie zajmiemy się interfejsem `F0/1/0`. Interfejs ten pochodzi z wcześniej dodanego modułu przekaźnikowego, zatem nie możemy mu bezpośrednio nadać adresu IP. Żądany efekt możemy osiągnąć nadając adres interfejsowi SVI (_Switched Virtual Interface_) - konkretnie interfejsowi odpowiadającemu domyślnemu VLANowi o numerze `1`:
```
R1_Mickiewicz(config)#interface vlan 1
R1_Mickiewicz(config-if)#ip address 155.21.23.129 255.255.255.128
R1_Mickiewicz(config-if)#ipv6 address 2001:ACAD:A:2::1/64
R1_Mickiewicz(config-if)#no shutdown

R1_Mickiewicz(config-if)#
%LINK-5-CHANGED: Interface Vlan1, changed state to up
```

#### Obsługa IPv6
Routery Cisco domyślnie nie są routerami IPv6. Obsługę tego adresowania (i trasowania) włącza się następującym poleceniem:

```
R1_Mickiewicz(config)#ipv6 unicast-routing 
R1_Mickiewicz(config)#
```

Dzięki temu nasze urządzenie będzie w stanie trasować ruch IPv6 oraz wysyłać pakiety RA (_Router Advertisement_), które są potrzebne do automatycznego obliczania adresów IPv6 hostów.

#### Zegar i wyszukiwanie DNS
W IOSie datę i godzinę ustawiamy za pomocą polecenia (NIE w trybie globalnej konfiguracji, tylko w trybie uprzywilejowania):
```
R1_Mickiewicz#clock set godzina:minuta:sekunda dzień nazwa_miesiąca rok
```

Przykład użycia:
```
R1_Mickiewicz#clock set ?
  hh:mm:ss  Current Time
R1_Mickiewicz#clock set 19:44:00 ?
  <1-31>  Day of the month
  MONTH   Month of the year
R1_Mickiewicz#clock set 19:44:00 28 ?
  MONTH  Month of the year
R1_Mickiewicz#clock set 19:44:00 28 April ?
  <1993-2035>  Year
R1_Mickiewicz#clock set 19:44:00 28 April 2025
```

Gdy nie pamiętasz składni jakiegoś polecenia (np. tego) to wystarczy że wstawisz znak zapytania, a IOS podpowie Ci, co należy teraz podać.

Teraz wyłączmy odwzorowywanie nazw DNS w linii poleceń (to już w trybie konf. globalnej):
```
R1_Mickiewicz(config)#no ip domain-lookup
```

#### Trasa domyślna
Następnie musimy ustawić trasę domyślną, z której router będzie korzystał, gdy nie znajdzie zdefiniowanej trasy dla jakiegoś adresu IP. Takim przypadkiem będzie komunikacja z urządzeniami z Internetu - routery (a przynajmniej nasz lokalny) nie mają zdefiniowanych tras dla każdego możliwego zakresu, czy adresu IP, jaki może wystąpić w Internecie - byłoby to strasznie niepraktyczne. Z tego powodu definiujemy trasę domyślną (lub też adres bramy domyślnej). 

Robimy to następującymi poleceniami (dla IPv4 oraz IPv6):
```
R1_Mickiewicz(config)#ip route 0.0.0.0 0.0.0.0 155.21.1.2
R1_Mickiewicz(config)#ipv6 route ::/0 2001:ACAD:B:1::1
```

#### Baner
IOS ma funkcję baneru - tekstu wyświetlanego przy logowaniu, lub też przy łączeniu.

Nasz router R1 obsługuje dwa typy banerów:
```
R1_Mickiewicz(config)#banner ?
  login  Set login banner
  motd   Set Message of the Day banner
```

- `login` - wyświetla się wyłącznie przy logowaniu
- `motd` - wyświetla się przy każdym łączeniu

Użyjemy baneru `MOTD` (_message of the day_):
```
R1_Mickiewicz(config)#banner motd #
Enter TEXT message.  End with the character '#'.
Nieautoryzowany dostep jest zabroniony i scigany w pelnym zakresie prawa.
Administrator urzadzenia: Adam Mickiewicz#

R1_Mickiewicz(config)#
```

Znak `#` na końcu polecenia pozwala nam umieścić w banerze kilka linii. Treść naszego baneru możemy zakończyć właśnie tym znakiem.


#### Zapis konfiguracji
Zapis konfiguracji możemy wykonać poleceniem: `copy running-config startup-config` lub też krócej: `wr`.

Pamiętaj, żeby robić to z trybu uprzywilejowania, a nie z trybu konfiguracji globalnej:

```
R1_Mickiewicz#wr
Building configuration...
[OK]
R1_Mickiewicz#copy running-config startup-config 
Destination filename [startup-config]? 
Building configuration...
[OK]
R1_Mickiewicz#
```

### Przekaźniki SLAN1/2/3
Przekaźniki w sieciach SLAN1, SLAN2 i SLAN3 konfiguruje się dokładnie tak samo. Jedynie co się zmienia to nazwa urządzenia (`hostname`) oraz adresy IPv4 (dla przekaźników mieliśmy nie konfigurować adresów IPv6). Z tego powodu opiszę wyłącznie konfigurację przekaźnika SLAN1.

#### Nazwa przekaźnika
Zmiana nazwy przekaźnika na `SLAN1_Mickiewicz`:
```
Switch(config)#hostname SLAN1_Mickiewicz
SLAN1_Mickiewicz(config)#
```

#### Hasło do trybu EXEC dla wszystkich linii
Hasło do trybu EXEC ustawia się dokładnie tak samo, jak w routerze, mając na uwadze to, że w przekaźnikach zarówno ilość, jak i typy linii będą różne.

```
SLAN1_Mickiewicz(config)#line ?
  <0-16>   First Line number
  console  Primary terminal line
  vty      Virtual terminal
SLAN1_Mickiewicz(config)#line console
% Incomplete command.
SLAN1_Mickiewicz(config)#line console ?
  <0-0>  First Line number
SLAN1_Mickiewicz(config)#line console 0
SLAN1_Mickiewicz(config-line)#password Zaq12wsx
SLAN1_Mickiewicz(config-line)#login
SLAN1_Mickiewicz(config-line)#exit
SLAN1_Mickiewicz(config)#line ?
  <0-16>   First Line number
  console  Primary terminal line
  vty      Virtual terminal
SLAN1_Mickiewicz(config)#line vty ?
  <0-15>  First Line number
SLAN1_Mickiewicz(config)#line vty 0 15
SLAN1_Mickiewicz(config-line)#password Zaq12wsx
SLAN1_Mickiewicz(config-line)#login
SLAN1_Mickiewicz(config-line)#exit
SLAN1_Mickiewicz(config)#
```

#### Hasło do uprzywilejowanego trybu EXEC
W tym kroku skonfigurujemy hasło, które będziemy musieli podać po użyciu polecenia `enable`.

W trybie konfiguracji globalnej:
```
SLAN1_Mickiewicz(config)#enable secret AdamX@a12#
SLAN1_Mickiewicz(config)#
```

#### Adresowanie IPv4
Adres IPv4 możemy nadać przekaźnikowi ustawiając adres na interfejsie SVI (_Switched Virtual Interface_) odpowiadającemu domyślnemu VLANowi o numerze `1`.

```
SLAN1_Mickiewicz(config)#interface vlan 1
SLAN1_Mickiewicz(config-if)#ip address 155.21.22.2 255.255.255.0
SLAN1_Mickiewicz(config-if)#no shutdown

SLAN1_Mickiewicz(config-if)#
%LINK-5-CHANGED: Interface Vlan1, changed state to up
```

#### Zegar, data i wyszukiwanie DNS
Zegar i datę ustawiamy dokładnie tak samo jak w routerze R1:

```
SLAN1_Mickiewicz#clock set 19:44:00 28 April 2025
SLAN1_Mickiewicz#
```

Wyszukiwanie DNS również wyłączamy w identyczny sposób:
```
SLAN1_Mickiewicz(config)#no ip domain-lookup 
SLAN1_Mickiewicz(config)#
```

#### Baner
Przekaźnik 2960 obsługuje wyłącznie baner `motd`:
```
SLAN1_Mickiewicz(config)#banner ?
  motd  Set Message of the Day banner
```

Co za tym idzie, baner skonfigurujemy dokładnie tak, jak zrobiliśmy to w R1:
```
SLAN1_Mickiewicz(config)#banner motd #
Enter TEXT message.  End with the character '#'.
Nieautoryzowany dostep jest zabroniony i scigany w pelnym zakresie prawa.
Administrator urzadzenia: Adam Mickiewicz#

SLAN1_Mickiewicz(config)#
```

#### Zapis konfiguracji
Konfigurację możemy zapisać (tak jak w R1) na dwa sposoby: `wr` oraz `copy running-config startup-config`:
```
SLAN1_Mickiewicz#wr
Building configuration...
[OK]
SLAN1_Mickiewicz#copy running-config startup-config 
Destination filename [startup-config]? 
Building configuration...
[OK]
SLAN1_Mickiewicz#
```

#### Inne przełączniki
Przełącznik w sieci SLAN2 oraz przełącznik w SLAN3 konfiguruje się identycznie, jedynie zmieniając adres IPv4 (**oraz maskę podsieci**) i nazwę urządzenia (`hostname`).

### Urządzenia dostępowe
Po skonfigurowaniu urządzeń sieciowych (routera oraz trzech przełączników) zostaje nam to samo zrobić z komputerami oraz serwerem.

#### Komputery osobiste
Każdy komputer osobisty konfigurujemy tak samo: ustawiamy adres IPv4, bramę domyślną, oraz włączamy autokonfigurację adresu IPv6. Wszystko to zrobimy za pomocą nakładki graficznej, w zakładce "Config".

<!-- TODO: Add screenshots -->

#### Serwer
W serwerze również musimy ustawić ręcznie adres IPv4 oraz bramę domyślną. Konfiguracja różni się od PCtów tym, że adresację IPv6 ustawiamy ręcznie - adres, oraz bramę. 

## Test komunikacji
Przedostanim zadaniem z częsci obowiązkowej zostało nam wyłącznie przeprowadzenie testów komunikacji między urządzeniami.

### PC1 oraz PC3 z sieciami lokalnymi
Z komputerów PC1 oraz PC3 testujemy działanie połączenia między wszystkimi innymi urządzeniami za pomocą polecenia `ping`:

Przykładowo z PC1, test z PC2:
```
C:\>ping 155.21.22.21

Pinging 155.21.22.21 with 32 bytes of data:

Reply from 155.21.22.21: bytes=32 time<1ms TTL=128
Reply from 155.21.22.21: bytes=32 time<1ms TTL=128
Reply from 155.21.22.21: bytes=32 time<1ms TTL=128
Reply from 155.21.22.21: bytes=32 time<1ms TTL=128

Ping statistics for 155.21.22.21:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 0ms, Maximum = 0ms, Average = 0ms
```

oraz PC1 z PC5 (IPv6):
```
C:\>ping 2001:ACAD:A:2::2

Pinging 2001:ACAD:A:2::2 with 32 bytes of data:

Reply from 2001:ACAD:A:2::2: bytes=32 time<1ms TTL=127
Reply from 2001:ACAD:A:2::2: bytes=32 time<1ms TTL=127
Reply from 2001:ACAD:A:2::2: bytes=32 time<1ms TTL=127
Reply from 2001:ACAD:A:2::2: bytes=32 time=8ms TTL=127

Ping statistics for 2001:ACAD:A:2::2:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 0ms, Maximum = 8ms, Average = 2ms
```

Na początku pingi mogą nie przechodzić, ponieważ urządzenia muszą się znaleźć (swoje adresy MAC).

### PC1 oraz PC3 z Internetem
Test z Internetem odbywa się na tej samej zasadzie, tylko tym razem pingujemy wyłącznie dwa adresy: `80.1.1.1` oraz `2001:DB8:ACAD::1`:

```
C:\>ping 80.1.1.1

Pinging 80.1.1.1 with 32 bytes of data:

Reply from 80.1.1.1: bytes=32 time<1ms TTL=254
Reply from 80.1.1.1: bytes=32 time<1ms TTL=254
Reply from 80.1.1.1: bytes=32 time<1ms TTL=254
Reply from 80.1.1.1: bytes=32 time<1ms TTL=254

Ping statistics for 80.1.1.1:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 0ms, Maximum = 0ms, Average = 0ms

C:\>ping 2001:DB8:ACAD::1

Pinging 2001:DB8:ACAD::1 with 32 bytes of data:

Reply from 2001:DB8:ACAD::1: bytes=32 time<1ms TTL=254
Reply from 2001:DB8:ACAD::1: bytes=32 time<1ms TTL=254
Reply from 2001:DB8:ACAD::1: bytes=32 time<1ms TTL=254
Reply from 2001:DB8:ACAD::1: bytes=32 time<1ms TTL=254

Ping statistics for 2001:DB8:ACAD::1:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 0ms, Maximum = 0ms, Average = 0ms
```

## Odczyt informacji z urządzeń sieciowych
Pozstaje nam odczytać zadane informacje z przełącznika SLAN1 oraz routera R1.

### Przełącznik SLAN1
Z przełącznika mamy odczytać adresy MAC komputerów PC1 oraz PC2, znając jedynie ich adresy IPv4 (`155.21.22.20` oraz `155.21.22.21`), oraz interfejsy do jakich są podłączone.

#### Adresy MAC
Do odwzorowywania adresów IP na adresy MAC służy tablica ARP, zatem zobaczmy czy znajdują się tam nasze komputery:

```
SLAN1_Mickiewicz#show arp
Protocol  Address          Age (min)  Hardware Addr   Type   Interface
Internet  155.21.22.2             -   0009.7C79.7365  ARPA   Vlan1
```

Niestety, w tablicy znajduje się jedynie nasz przełącznik. Jak możemy zmusić przełącznik do użycia protokołu ARP do znalezenia adresu fizycznego naszych komputerów? W IOSie (tak jak na PCtach) dostępne jest polecenie ping:

```
SLAN1_Mickiewicz#ping 155.21.22.20

Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 155.21.22.20, timeout is 2 seconds:
.!!!!
Success rate is 80 percent (4/5), round-trip min/avg/max = 0/0/0 ms
```

Nie dostaliśmy odpowiedzi na pierwsze zapytanie (przełącznik pewnie dowiadywał się na jaki adres fizyczny je w ogóle wysłać). Wykonam również ping kompputera PC2: `ping 155.21.22.21`. Sprawdźmy, czy w tablicy tym razem będą nasze szukane urządzenia:

```
SLAN1_Mickiewicz#show arp
Protocol  Address          Age (min)  Hardware Addr   Type   Interface
Internet  155.21.22.2             -   0009.7C79.7365  ARPA   Vlan1
Internet  155.21.22.20            2   0030.F2B1.C99B  ARPA   Vlan1
Internet  155.21.22.21            0   0002.4A8D.53DD  ARPA   Vlan1
```

Z powyższej tablicy wynika, że `PC1` o adresie IP `155.21.22.20` posiada adres fizyczny `00:30:F2:B1:C9:9B`, natomiast adres MAC `PC2` to `00:02:4A:8D:53:DD`.

#### Interfejsy
Nazwy interfejsów, do jakich podpięte są PC1 i PC2 możemy odczytać za pomocą polecenia `show mac-address-table`:

```
SLAN1_Mickiewicz#show mac-address-table 
          Mac Address Table
-------------------------------------------

Vlan    Mac Address       Type        Ports
----    -----------       --------    -----

   1    0001.974a.c101    DYNAMIC     Gig0/1
   1    0002.4a8d.53dd    DYNAMIC     Fa0/11
   1    0030.f2b1.c99b    DYNAMIC     Fa0/10
```
Znając adresy MAC `PC1` i `PC2`, z powyższej możemy odczytać, że `PC1` jest podpięty do portu `Fa0/10`, a `PC2` do `Fa0/11`.

_Jeżeli jednego z komputerów (albo dwóch) nie ma w tabeli, wykonaj jeszcze raz ping - wpis mógł wygasnąć._

### Router R1
Ostatnim zadaniem jest odczytanie pewnych informacji z poziomu konsoli routera R1.

#### Grupy multicastowe G0/1
Grupy multicastowe są częścią protokołu IPv6. Informacje o stanie działaniu IPv6 w danym interfejsie (w tym przypadku G0/1) możemy odczytać za pomocą `show ipv6 interface g0/1`:

```
R1_Mickiewicz#show ipv6 interface g0/1
GigabitEthernet0/1 is up, line protocol is up
  IPv6 is enabled, link-local address is FE80::201:97FF:FE4A:C102
  No Virtual link-local address(es):
  Global unicast address(es):
    2001:ACAD:A:1::1, subnet is 2001:ACAD:A:1::/64
  Joined group address(es):
    FF02::1
    FF02::2
    FF02::1:FF00:1
    FF02::1:FF4A:C102
  MTU is 1500 bytes
[...]
```

Z wyniku polecenia możemy odczytać, że interfejs przystąpił do grup:
- FF02::1
- FF02::2
- FF02::1:FF00:1
- FF02::1:FF4A:C102

#### Adresy IPv4 i IPv6
Adresy IP możemy odczytać za pomocą tego samego polecenia, z pominięciem nazwy interfejsu. Zamiast nazwy możemy dodać `brief`, co spowoduje wyświetlenie mniejszej ilości informacji:

```
R1_Mickiewicz#show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol 
GigabitEthernet0/0     155.21.22.1     YES manual up                    up 
GigabitEthernet0/1     155.21.23.1     YES manual up                    up 
GigabitEthernet0/0/0   155.21.1.2      YES manual up                    up 
FastEthernet0/1/0      unassigned      YES unset  up                    up 
FastEthernet0/1/1      unassigned      YES unset  up                    down 
FastEthernet0/1/2      unassigned      YES unset  up                    down 
FastEthernet0/1/3      unassigned      YES unset  up                    down 
Vlan1                  155.21.23.129   YES manual up                    up
```

Teraz dla IPv6:
```
R1_Mickiewicz#show ipv6 interface brief
GigabitEthernet0/0         [up/up]
    FE80::201:97FF:FE4A:C101
    2001:ACAD:A::1
GigabitEthernet0/1         [up/up]
    FE80::201:97FF:FE4A:C102
    2001:ACAD:A:1::1
GigabitEthernet0/0/0       [up/up]
    FE80::230:F2FF:FED7:AE84
    2001:ACAD:B:1::2
FastEthernet0/1/0          [up/up]
FastEthernet0/1/1          [up/down]
FastEthernet0/1/2          [up/down]
FastEthernet0/1/3          [up/down]
Vlan1                      [up/up]
    FE80::240:BFF:FE2B:1DBD
    2001:ACAD:A:2::1
```

#### Wersja IOS i rozmiar flash
Informacje o sprzęcie, czy też wersji IOS odczytujemy za pomocą `show version`:

```
R1_Mickiewicz#show version
Cisco IOS Software, C1900 Software (C1900-UNIVERSALK9-M), Version 15.1(4)M4, RELEASE SOFTWARE (fc2)

[...]

Cisco CISCO1941/K9 (revision 1.0) with 491520K/32768K bytes of memory.
Processor board ID FTX152400KS
4 FastEthernet interface(s)
3 Gigabit Ethernet interfaces
DRAM configuration is 64 bits wide with parity disabled.
255K bytes of non-volatile configuration memory.
249856K bytes of ATA System CompactFlash 0 (Read/Write)

[...]
```

Z powyższej ściany tekstu można odczytać:
- wersję IOSa: `15.1(4)M4`,
- rozmiar dysku flash: `249856K`.

<!-- TODO: Add extra tasks -->