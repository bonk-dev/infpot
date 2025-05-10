---
title: "Zadanie 1"
description: "Opracowanie zadania 1. z modułu 5 \"Ethernet\" z sieci komputerowych 1"
keywords: 
  - sieci komputerowe 1
  - polsl
  - moduł 5
  - laboratorium
  - cisco
  - cisco packet tracer
---

import CenteredImage from '@site/src/components/CenteredImage'
import NetworkDiagramSvg from './assets/zadanie1-0-topology.svg'
import MacAddressStructureSvg from './assets/zadanie1-6-mac.svg'

# Zadanie 1
Autor: Dawid Pągowski

## Przygotowanie topologii
Na początek musimy przygotować odpowiednią topologię w Packet Tracerze.

<CenteredImage 
  src={<NetworkDiagramSvg/>} 
  alt='Diagram sieci do przygotowania w programie Cisco Packet Tracker'/>

Ustawiamy bramy domyślne na obu komputerach:
<CenteredImage 
  src={require('./assets/zadanie1-1-gateways.webp').default} 
  alt='Okienka konfiguracji komputerów PC-A (po lewej) oraz PC-B (po prawej), zakładka z bramami domyślnymi'/>

Następnie konfigurujemy adresy IP w komputerach:
<CenteredImage 
  src={require('./assets/zadanie1-2-ipaddresses.webp').default} 
  alt='Okienka konfiguracji komputerów PC-A (po lewej) oraz PC-B (po prawej), zakładka FastEthernet0'/>

Mamy jeszcze do wykonania kilka zadań w routerze. Musimy:
- nadać mu nazwę hosta "R1",
- skonfigurować interfejsy G0/0 i G0/1,
- zapisać konfigurację.

Najpierw musimy wejść w tryb konfiguracji globalnej:
```
Router>en
Router#
Router#conf t
Enter configuration commands, one per line.  End with CNTL/Z.
Router(config)#
```

Następnie ustawiamy nazwę hosta:
```
Router(config)#hostname R1
R1(config)#
```

Teraz ustawiamy adres na interfejsie G0/0 według tabeli, oraz włączamy go:
```
R1(config)#interface G0/0
R1(config-if)#ip address 192.168.1.1 255.255.255.0
R1(config-if)#no shut

R1(config-if)#
%LINK-5-CHANGED: Interface GigabitEthernet0/0, changed state to up

%LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/0, changed state to up
```

Analogicznie postępujemy z interfejsem G0/1:
```
R1(config-if)#interface G0/1
R1(config-if)#ip address 192.168.0.1 255.255.255.0
R1(config-if)#no shut

R1(config-if)#
%LINK-5-CHANGED: Interface GigabitEthernet0/1, changed state to up

%LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to up
```

Na koniec zapisujemy konfigurację (wcześniej wychodząc z trybu konfiguracji):
```
R1(config-if)#exit
R1(config)#exit
R1#wr
Building configuration...
[OK]
```

I gotowe! Wszystko razem:

```
Router#
Router#conf t
Enter configuration commands, one per line.  End with CNTL/Z.
Router(config)#hostname R1
R1(config)#interface G0/0
R1(config-if)#ip address 192.168.1.1 255.255.255.0
R1(config-if)#no shut

R1(config-if)#
%LINK-5-CHANGED: Interface GigabitEthernet0/0, changed state to up

%LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/0, changed state to up

R1(config-if)#interface G0/1
R1(config-if)#ip address 192.168.0.1 255.255.255.0
R1(config-if)#no shut

R1(config-if)#
%LINK-5-CHANGED: Interface GigabitEthernet0/1, changed state to up

%LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to up

R1(config-if)#exit
R1(config)#exit
R1#wr
Building configuration...
[OK]
R1#
```

### Test połączenia
Sprawdzimy jeszcze czy możemy spingować naszą bramę domyślną oraz PC-B z poziomu PC-A.
Polecenie `ping` jest dostępne z poziomu programu "Command Prompt" z pulpitu komputera PC-A:
<CenteredImage 
  src={require('./assets/zadanie1-3-desktop.webp').default} 
  alt='Pulpit komputera PC-A w programie Packet Tracer ze strzałką wskazującą Command Prompt'/>

Uruchamiamy dwa polecenia `ping`: jedno pingujące bramę i drugie pingujące PC-B:
<CenteredImage 
  src={require('./assets/zadanie1-4-ping.webp').default} 
  alt='Wyjście dwóch poleceń ping wskazujące na poprawne działanie sieci'/>

## Odczyt adresu MAC w Windowsie
W tym kroku musimy odczytać adres MAC karty sieciowej w naszym systemie Windows.
Zrobimy to za pomocą wiersza poleceń (`cmd.exe`), wykorzystując polecenie `ipconfig` z przełącznikiem `/all`:
<CenteredImage 
  src={require('./assets/zadanie1-5-ipconfig-all-windows.webp').default} 
  alt='Wynik polecenia ipconfig /all. Zaznaczony adres MAC interfejsu sieciowego "Ethernet 4"'/>

Z powyższego zrzutu możemy odczytać, że adres fizyczny interfejsu "Ethernet 4" to `52-54-00-22-54-89`.

<!-- TODO: Replace with a better SVG, as draw.io doesn't export monospace text properly I guess -->
Z odczytanego adresu mamy wypisać identyfikator OUI, oraz część opisującą numer seryjny urządzenia:
<CenteredImage
  src={<MacAddressStructureSvg/>}
  alt='Schemat przedstawiąjący dwie części Ethernetowego adresu MAC'/>

Zatem w naszym adresie:
- OUI: `52-54-00`,
- część seryjna: `22-54-89`.

Dodatkowo musimy jeszcze znaleźć nazwę producenta na podstawie jego identyfikatora (OUI). W tym celu możemy posłużyć się stroną [maclookup.app](https://maclookup.app):
<CenteredImage 
  src={require('./assets/zadanie1-7-vm-mac.webp').default} 
  alt='Wynik wyszukania na maclookup.app - adres LAA'/>
Mój adres okazał się adresem zarządzanym lokalnie (LAA), zatem część OUI nie odpowiada żadnemu producentowi. Na potrzeby przykładu załóżmy, że adres MAC interfejsu był inny: `50:EB:F6:42:75:02`:
<CenteredImage 
  src={require('./assets/zadanie1-8-asustek-mac.webp').default} 
  alt='Wynik wyszukania na maclookup.app - adres 50:EB:F6:42:75:02'/>
W tym adresie OUI to `50:EB:F6`, który, jak widać, odpowiada producentowi "ASUSTek COMPUTER INC.".

## Odczyt adresu MAC w routerze
W tej sekcji zajmiemy się odczytaniem adresu MAC jednego z interfejsów (`G0/0`) w routerze R1.

### Wyświetlenie informacji o interfejsie
W konsoli routera:
```
R1>show interfaces g0/0
GigabitEthernet0/0 is up, line protocol is up (connected)
  Hardware is CN Gigabit Ethernet, address is 0090.2b4a.9601 (bia 0090.2b4a.9601)
  Internet address is 192.168.1.1/24
  MTU 1500 bytes, BW 1000000 Kbit, DLY 100 usec,
     reliability 255/255, txload 1/255, rxload 1/255
  Encapsulation ARPA, loopback not set
[...]
```

W moim przypadku adres MAC interfejsu G0/0 to `00:90:2B:4A:96:01`, OUI to `00:90:2B`, numer seryjny to `4A:96:01`, a producent to "Cisco Systems, Inc" (pozyskany za pomocą [maclookup.app](https://maclookup.app/search/result?mac=00:90:2B:4A:96:01)).

W wyniku polecenia `show interfaces` uzyskaliśmy dwa jednakowe adresy MAC. Pierwszy z nich jest aktualnie wykorzystywanym adresem, który możemy zmienić za pomocą polecenia `mac aaaa.bbbb.cccc` będąc w trybie konfiguracji interfejsu. 

Drugi z tych adresów (poprzedzony napisem `bia`) jest adresem na stałe wypalonym w pamięci ROM karty sieciowej - "burned-in address". Adres BIA jest używany jako domyślny efektywny adres. Nie jesteśmy w stanie go zmienić.

### Wyświetlenie tablicy ARP
W konsoli routera możemy jeszcze wyświetlić tablicę ARP, która zawiera odwzorowania adresów IP na adresy MAC, za pomocą polecenia `show arp`:
```
R1>show arp
Protocol  Address          Age (min)  Hardware Addr   Type   Interface
Internet  192.168.0.1             -   0090.2B4A.9602  ARPA   GigabitEthernet0/1
Internet  192.168.1.1             -   0090.2B4A.9601  ARPA   GigabitEthernet0/0
```

W moim przypadku wyświetliły się dwa adresy warstwy 2 (adresy MAC):
- `0090.2B4A.9602` (`00:90:2B:4A:96:02`)
- `0090.2B4A.9601` (`00:90:2B:4A:96:01`)

oraz dwa odpowiadające im adresy warstwy 3 (adresy IP):
- `192.168.0.1`
- `192.168.1.1`

W tablicy nie widać niczego o naszym przełączniku S1. Jest to spowodowane tym, że nie nadaliśmy przełącznikowi adresu IP (a tablica ARP zawiera odwzorowania adresów IP na adresy MAC). Jednakże samo skonfigurowanie adresu IP na przełączniku mogłoby nie wystarczyć - musiałaby zajść komunikacja pomiędzy routerem a switchem, żeby router wprowadził odwzorowanie do swojej tablicy.

## Odczyt adresów MAC w przełączniku
Odczytaliśmy już adresy MAC w Windowsie i routerze, teraz zajmiemy się przełącznikiem.

### Interfejsy F0/5 i F0/6
Na początek odczytamy adres interfejsu `F0/5`:
```
Switch>show interfaces f0/5
FastEthernet0/5 is up, line protocol is up (connected)
  Hardware is Lance, address is 0090.2b0d.2e05 (bia 0090.2b0d.2e05)
 BW 100000 Kbit, DLY 1000 usec,
     reliability 255/255, txload 1/255, rxload 1/255
  Encapsulation ARPA, loopback not set
  Keepalive set (10 sec)
  Full-duplex, 100Mb/s
[...]
```
Adres MAC interfejsu F0/5: `0090.2b0d.2e05`.

Następnie z interfejsu `F0/6`:
```
Switch>show interfaces f0/6
FastEthernet0/6 is down, line protocol is down (disabled)
  Hardware is Lance, address is 0090.2b0d.2e06 (bia 0090.2b0d.2e06)
 BW 100000 Kbit, DLY 1000 usec,
     reliability 255/255, txload 1/255, rxload 1/255
  Encapsulation ARPA, loopback not set
  Keepalive set (10 sec)
  Half-duplex, 100Mb/s
[...]
```
Adres MAC interfejsu F0/6: `0090.2b0d.2e06`.

Porównując OUI interfejsów przełącznika i routera R1:
- Przełącznik - `F0/5`: `00:90:2B`,
- Przełącznik - `F0/6`: `00:90:2B`,
- R1 - `G0/0`: `00:90:2B`,

widzimy, że w moim przypadku są takie same.

### Tablica adresów MAC
W naszym przełączniku możemy wyświetlić tablicę adresów MAC za pomocą polecenia `show mac-address-table`:
```
Switch>show mac-address-table 
          Mac Address Table
-------------------------------------------

Vlan    Mac Address       Type        Ports
----    -----------       --------    -----

   1    0090.2b4a.9601    DYNAMIC     Fa0/1
```

W mojej tablicy pojawił się tylko adres routera R1, który jest podłączony do portu `Fa0/1`.

Po ponownym spingowaniu komputera PC-B z poziomu komputera PC-A (jak w kroku [Test połączenia](#test-połączenia)):
```
C:\>ping 192.168.0.3

Pinging 192.168.0.3 with 32 bytes of data:

Request timed out.
Reply from 192.168.0.3: bytes=32 time<1ms TTL=127
Reply from 192.168.0.3: bytes=32 time<1ms TTL=127
Reply from 192.168.0.3: bytes=32 time<1ms TTL=127

Ping statistics for 192.168.0.3:
    Packets: Sent = 4, Received = 3, Lost = 1 (25% loss),
Approximate round trip times in milli-seconds:
    Minimum = 0ms, Maximum = 0ms, Average = 0ms
```
i po powtórzeniu polecenia `show mac-address-table ` w przełączniku:
```
Switch>show mac-address-table 
          Mac Address Table
-------------------------------------------

Vlan    Mac Address       Type        Ports
----    -----------       --------    -----

   1    0007.eca6.c7d8    DYNAMIC     Fa0/5
   1    0090.2b4a.9601    DYNAMIC     Fa0/1
```
pojawił się wpis z adresem MAC komputera PC-A. Komputer PC-A jest podłączony do portu `Fa0/5`.

## Transmisja rozgłoszeniowa - warstwa 2
Na poziomie warstwy 2 jest możliwa transmisja rozgłoszeniowa. Jak podaje norma:
“_All 1’s in the Destination Address field shall be predefined to be the Broadcast Address._” [IEEE Std 802.3-2022, Sec. 3.2.3.1, p. 241].

Zatem taki adres będzie miał postać: `11111111:11111111:11111111:11111111:11111111:11111111`

czyli po prostu: `FF:FF:FF:FF:FF:FF`.