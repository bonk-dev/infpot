---
title: "Zadanie 2"
description: "Opracowanie zadania 2. z modułu 5 \"Ethernet\" z sieci komputerowych 1"
keywords: 
  - sieci komputerowe 1
  - polsl
  - moduł 5
  - laboratorium
  - cisco
  - cisco packet tracer
---

import CenteredImage from '@site/src/components/CenteredImage'
import NetworkDiagramSvg from './assets/5-2/0-topology.svg'

# Zadanie 2
Autor: Dawid Pągowski

## Wstęp
To zadanie polega na zbadaniu współpracy protokołów ICMP, ARP oraz Neighbour Discovery.
Z tego powodu nie musimy przygotowywać żadnej skomplikowanej sieci, ale będą nam potrzebne dwa 
komputery, przy czym jeden musi mieć dostęp do Internetu.

<CenteredImage 
  src={<NetworkDiagramSvg/>} 
  alt='Diagram sieci potrzebnej do zrobienia zadania. Sieć składa się z dwóch komputerów z Windowsem 10'/>

## Przygotowanie środowiska
Przed przystąpieniem do zadania musimy najpierw:
- zainstalować [Wiresharka](https://www.wireshark.org),
- skonfigurować zaporę w Windowsach.

### Reguła ICMPv4 w zaporze
Konfigurowanie zapory polega na dodaniu dwóch reguł przychodzących: dla ICMPv4 oraz ICMPv6.
Reguły te można dodać w ustawieniach zaawansowanych zapory systemu Windows, dostępnych 
w przystawce MMC o nazwie `wf.msc`. Przystawkę możemy uruchomić naciskając na klawiaturze
kombinację skrótów `Win+R` i podając jej nazwę:

<CenteredImage 
  src={require('./assets/5-2/1-run.webp').default} 
  alt='Okienko "Uruchamianie" z wpisaną nazwą przystawki - "wf.msc"'/>

Musimy dodać reguły przychodzące, zatem z listy po lewej wybieramy "Reguły przychodzące".
Jako pierwszą dodamy regułę pozwalającą na żądania ICMPv4, klikamy na "Nowa reguła...":

<CenteredImage 
  src={require('./assets/5-2/2-inbound.webp').default} 
  alt='Okienko przystawki wf.msc z zaznaczonymi przyciskami "Reguły przychodzące" oraz "Nowa reguła..."'/>

Zaznaczamy "Niestandardowa" jako nasz wybrany typ reguły:
<CenteredImage 
  src={require('./assets/5-2/3-custom-type.webp').default} 
  alt='Kreator nowej reguły, zaznaczona typ "Niestandardowy"'/>

Zostawiamy zanznaczoną opcję "Wszystkie programy":
<CenteredImage 
  src={require('./assets/5-2/4-all-apps.webp').default} 
  alt='Kreator nowej reguły, zaznaczona opcja "Wszystkie programy"'/>

Z rozwijanej listy wyiberamy typ "ICMPv4" i klikamy na "Nazwa" na lewym panelu:
<CenteredImage 
  src={require('./assets/5-2/5-icmpv4.webp').default} 
  alt='Kreator nowej reguły, wybrany typ protokołu ICMPv4'/>

Nadajemy nazwę naszej regule i klikamy przycisk "Zakończ":
<CenteredImage 
  src={require('./assets/5-2/6-icmpv4-finish.webp').default} 
  alt='Kreator nowej reguły, w pole nazwa wpisane "Zezwól na żądania ICMPv4"'/>

### Reguła ICMPv6 w zaporze
Analogicznie postępujemy dla protokołu ICMPv6, mając na uwadze to, że w kroku gdzie wybieramy protokół, musimy wskazać ICMPv6:
<CenteredImage 
  src={require('./assets/5-2/7-icmpv6.webp').default} 
  alt='Kreator nowej reguły, wybrany typ protokołu ICMPv6'/>

## Odczytanie danych adresowych
W pierwszym kroku musimy odczytać dane adresowe TCP/IP z naszego interfejsu sieciowego:
- adres IPv4,
- maskę podsieci,
- adres bramy domyślnej,
- adres MAC,
- adres IPv6 link-local.

Możemy to zrobić za pomocą polecenia `ipconfig /all` w wierszu poleceń:

```
Microsoft Windows [Version 10.0.19045.2965]
(c) Microsoft Corporation. Wszelkie prawa zastrzeżone.

C:\Users\bonk>ipconfig /all

Windows IP Configuration

   Host Name . . . . . . . . . . . . : DPAGO-1
   Primary Dns Suffix  . . . . . . . :
   Node Type . . . . . . . . . . . . : Hybrid
   IP Routing Enabled. . . . . . . . : No
   WINS Proxy Enabled. . . . . . . . : No
   DNS Suffix Search List. . . . . . : network

Ethernet adapter Ethernet:

   Connection-specific DNS Suffix  . : network
   Description . . . . . . . . . . . : Red Hat VirtIO Ethernet Adapter
   Physical Address. . . . . . . . . : 52-54-00-B0-C9-24
   DHCP Enabled. . . . . . . . . . . : Yes
   Autoconfiguration Enabled . . . . : Yes
   Link-local IPv6 Address . . . . . : fe80::6522:99de:ef9a:dc70%14(Preferred)
   IPv4 Address. . . . . . . . . . . : 192.168.100.244(Preferred)
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Lease Obtained. . . . . . . . . . : sobota, 17 maja 2025 22:23:33
   Lease Expires . . . . . . . . . . : niedziela, 18 maja 2025 00:21:38
   Default Gateway . . . . . . . . . : 192.168.100.1
   DHCP Server . . . . . . . . . . . : 192.168.100.1
   DHCPv6 IAID . . . . . . . . . . . : 340939776
   DHCPv6 Client DUID. . . . . . . . : 00-01-00-01-2F-BA-A7-7E-52-54-00-B0-C9-24
   DNS Servers . . . . . . . . . . . : 192.168.100.1
   NetBIOS over Tcpip. . . . . . . . : Enabled
```
W moim przypadku dane adresowe to:
| Parametr | Wartość |
| -- | -- |
| Adres IPv4 | 192.168.100.244 |
| Maska podsieci | 255.255.255.0 |
| Adres bramy | 192.168.100.1 |
| Adres MAC | 52-54-00-B0-C9-24 |
| Adres IPv6 link-local | fe80::6522:99de:ef9a:dc70 |