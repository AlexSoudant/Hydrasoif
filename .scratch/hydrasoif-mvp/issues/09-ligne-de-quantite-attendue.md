# 09: Ligne de Quantité attendue sur le verre

**What to build:** Une ligne pointillée discrète sur le verre de progression indique la Quantité attendue à l'instant présent. Je vois d'un coup d'œil si je suis en Retard, même quand le Rappel est masqué.

**Blocked by:** 05 (Verre de progression), 06 (Rappel, avec la référence de démarrage)

**Status:** ready-for-agent

- [ ] La ligne est placée à la hauteur de la Quantité attendue divisée par l'Objectif journalier, quelle que soit la référence utilisée (démarrage ou Rythme habituel).
- [ ] Elle avance à chaque vérification, c'est-à-dire chaque minute.
- [ ] Elle disparaît une fois l'Objectif journalier atteint.
- [ ] Elle reste visible quand le Rappel est masqué.
- [ ] Elle a un libellé accessible (par exemple « Attendu : 45 cl »).
- [ ] Tests sur l'application complète : présence et libellé de la ligne en cours de Journée, mise à jour après une minute avec l'horloge simulée, disparition une fois l'objectif atteint.
