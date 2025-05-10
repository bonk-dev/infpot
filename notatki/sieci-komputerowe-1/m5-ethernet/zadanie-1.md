import CenteredImage from '@site/src/components/CenteredImage'
import NetworkDiagramSvg from './assets/zadanie1-0-topology.svg'

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