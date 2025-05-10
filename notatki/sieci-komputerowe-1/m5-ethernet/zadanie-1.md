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
  src={require('./assets/zadanie1-1-gateways.jpg').default} 
  alt='Okienka konfiguracji komputerów PC-A (po lewej) oraz PC-B (po prawej), zakładka z bramami domyślnymi'/>

Następnie konfigurujemy adresy IP w komputerach:
<CenteredImage 
  src={require('./assets/zadanie1-2-ipaddresses.jpg').default} 
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

Sprawdzimy jeszcze czy możemy spingować naszą bramę domyślną oraz PC-B z poziomu PC-A.
Polecenie `ping` jest dostępne z poziomu programu "Command Prompt" z pulpitu komputera PC-A:
<CenteredImage 
  src={require('./assets/zadanie1-3-desktop.jpg').default} 
  alt='Pulpit komputera PC-A w programie Packet Tracer ze strzałką wskazującą Command Prompt'/>

Uruchamiamy dwa polecenia `ping`: jedno pingujące bramę i drugie pingujące PC-B:
<CenteredImage 
  src={require('./assets/zadanie1-4-ping.jpg').default} 
  alt='Wyjście dwóch poleceń ping wskazujące na poprawne działanie sieci'/>

## Odczyt adresu MAC w Windowsie
W tym kroku musimy odczytać adres MAC karty sieciowej w naszym systemie Windows.
Zrobimy to za pomocą wiersza poleceń (`cmd.exe`), wykorzystując polecenie `ipconfig` z przełącznikiem `/all`:
<CenteredImage 
  src={require('./assets/zadanie1-5-ipconfig-all-windows.jpg').default} 
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
  src={require('./assets/zadanie1-7-vm-mac.png').default} 
  alt='Wynik wyszukania na maclookup.app - adres LAA'/>
Mój adres okazał się adresem zarządzanym lokalnie (LAA), zatem część OUI nie odpowiada żadnemu producentowi. Na potrzeby przykładu załóżmy, że adres MAC interfejsu był inny: `50:EB:F6:42:75:02`:
<CenteredImage 
  src={require('./assets/zadanie1-8-asustek-mac.png').default} 
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