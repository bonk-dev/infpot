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