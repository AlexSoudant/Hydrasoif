# 05: Verre de progression

**What to build:** Sur l'écran Aujourd'hui, le total devient un verre d'eau dessiné qui se remplit au fil de mes Prises, jusqu'à être plein quand l'Objectif journalier est atteint. Au-delà, il déborde et affiche le dépassement, avec un message de félicitations.

**Blocked by:** 01 (Squelette de l'application et première Prise)

**Status:** ready-for-agent

- [ ] Un verre en SVG affiche un niveau proportionnel à la quantité bue divisée par l'Objectif journalier.
- [ ] Le verre affiche la quantité bue, l'objectif et le pourcentage (par exemple « 25 cl / 1,50 L · 17 % »).
- [ ] À chaque Prise, le niveau monte en environ 0,6 s avec une légère vague.
- [ ] L'animation est désactivée quand le téléphone demande de réduire les animations.
- [ ] Une fois l'objectif atteint, le verre est plein et un petit message de félicitations s'affiche.
- [ ] Au-delà de l'objectif, le verre reste plein, quelques gouttes débordent, et le texte affiche le dépassement (par exemple « 1,62 / 1,50 L · +12 cl »).
- [ ] On peut continuer à enregistrer des Prises au-delà de 100 %.
- [ ] Tests sur l'application complète : ils vérifient le texte affiché et le niveau, rendu accessible avec un rôle progressbar et ses attributs aria, à 0 %, en cours de Journée, à 100 % et au-delà.
