# 03: Corriger une Prise

**What to build:** Je peux corriger mes erreurs sur la Journée en cours. Juste après une Prise, un message « Prise de X cl ajoutée · Annuler » reste affiché 5 secondes. Plus tard, le menu ⋮ d'une Prise me permet de la supprimer ou de modifier son heure.

**Blocked by:** 01 (Squelette de l'application et première Prise)

**Status:** ready-for-agent

- [ ] Après chaque Prise, le message avec « Annuler » s'affiche pendant 5 secondes, puis disparaît.
- [ ] « Annuler » supprime la Prise : la liste et le total reviennent à l'état précédent. C'est la même opération que la suppression depuis le menu.
- [ ] Le menu ⋮ d'une Prise de la Journée en cours propose « Supprimer » et « Modifier l'heure ».
- [ ] La nouvelle heure doit être comprise entre 4 h de la Journée en cours et l'instant présent. Une heure en dehors de cette plage est refusée, et c'est le module de stockage qui le vérifie.
- [ ] Après une modification d'heure, la liste reste triée par heure.
- [ ] Il n'est pas possible de modifier le Format de verre d'une Prise.
- [ ] Tests sur l'application complète : Annuler (avant et après 5 secondes, avec l'horloge simulée), la suppression, et la modification d'heure, y compris le refus d'une heure dans le futur ou avant 4 h.
