# 07: Masquer le Rappel et objectif atteint

**What to build:** Je peux fermer le Rappel avec ✕. Il disparaît pendant 30 minutes, puis revient si je suis toujours en Retard. Une fois mon Objectif journalier atteint, plus aucun Rappel ne s'affiche jusqu'à la fin de la Journée.

**Blocked by:** 06 (Rappel, avec la référence de démarrage)

**Status:** ready-for-agent

- [ ] Un bouton ✕ sur la carte Rappel la masque pendant 30 minutes.
- [ ] Après 30 minutes, le Rappel revient si le Retard est toujours d'au moins 12,5 cl.
- [ ] Le masquage n'a pas besoin de survivre à un rechargement de la page.
- [ ] Une fois l'Objectif journalier atteint, aucun Rappel ne s'affiche jusqu'à la fin de la Journée.
- [ ] Tests du module de calcul : un Rappel masqué ne s'affiche pas, et aucun Rappel ne s'affiche une fois l'objectif atteint, même avec un Retard théorique.
- [ ] Test sur l'application complète : ✕, puis 29 minutes sans Rappel, puis son retour à 30 minutes, avec l'horloge simulée.
