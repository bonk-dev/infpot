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
