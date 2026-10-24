# 04: Navigation et Objectif journalier

**What to build:** Une barre de navigation en bas permet de passer d'Aujourd'hui à l'Historique (encore vide) et aux Réglages. Dans les Réglages, je règle mon Objectif journalier de 1 L à 2 L par pas de 25 cl. Le nouvel objectif s'applique à partir de la Journée en cours, et chaque Journée passée garde le sien.

**Blocked by:** 01 (Squelette de l'application et première Prise)

**Status:** ready-for-agent

- [ ] La barre de navigation en bas propose trois onglets : Aujourd'hui, Historique et Réglages.
- [ ] L'écran Historique existe, avec un message pour dire qu'il est vide. Son contenu est l'objet du ticket 10.
- [ ] Dans les Réglages, les boutons − et + changent l'Objectif journalier de 25 cl à chaque appui, entre 1 L et 2 L. Chaque bouton est désactivé à sa borne.
- [ ] Chaque changement est enregistré avec la date de sa Journée. L'objectif d'une Journée est la dernière valeur fixée au plus tard ce jour-là, ou 1500 ml s'il n'y en a aucune.
- [ ] L'écran Aujourd'hui affiche l'Objectif journalier de la Journée en cours.
- [ ] Tests du module de calcul : un objectif changé aujourd'hui ne modifie pas l'objectif d'une Journée passée, et l'objectif par défaut est 1500 ml.
- [ ] Test sur l'application complète : régler l'objectif dans les Réglages, puis le voir à jour sur l'écran Aujourd'hui.
