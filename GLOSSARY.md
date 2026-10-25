# Hydrasoif

Application personnelle de suivi de la quantité d'eau bue au cours de la journée.

## Language

**Prise**:
Un enregistrement d'eau bue : un Format de verre et l'heure à laquelle il a été bu.
_Avoid_: Prise d'eau, consommation, entrée, log

**Format de verre**:
L'une des trois contenances qu'on peut enregistrer : 12,5 cl, 25 cl ou 50 cl.
_Avoid_: Taille, dose, verre (quand on parle de la contenance)

**Objectif journalier**:
La quantité d'eau visée pour une Journée, comprise entre 1 L et 2 L. Chaque Journée garde l'objectif qu'elle avait.
_Avoid_: Cible, but, quota

**Journée**:
La période de 4 h du matin à 4 h le lendemain. Chaque Prise appartient à une Journée.
_Avoid_: Jour calendaire, date

## Rappel

**Rythme habituel**:
Pour chaque instant de la Journée, à la minute près, la part de l'eau de la Journée qui a en moyenne déjà été bue à cet instant. La moyenne porte sur les 14 dernières Journées passées qui comptent au moins une Prise.
_Avoid_: Taux moyen, moyenne, courbe

**Référence de démarrage**:
L'Objectif journalier réparti de façon égale entre 8 h et 22 h. Elle remplace le Rythme habituel tant qu'il y a moins de 3 Journées passées avec au moins une Prise.
_Avoid_: Rythme par défaut, courbe linéaire

**Quantité attendue**:
Ce qu'on devrait avoir bu à un instant donné : le Rythme habituel à cet instant (ou la Référence de démarrage) multiplié par l'Objectif journalier du jour.
_Avoid_: Taux moyen, cible horaire

**Retard**:
L'écart entre la Quantité attendue et ce qui a été bu depuis le début de la Journée, quand cet écart est positif.
_Avoid_: Déficit, manque

**Rappel**:
Le message qui signale un Retard et propose de boire pour le rattraper.
_Avoid_: Notification, alerte, reminder
