# 06: Rappel, avec la référence de démarrage

**What to build:** Quand je suis en Retard, une carte Rappel apparaît en haut de l'écran Aujourd'hui : « À 11h tu as normalement bu 45 cl ! Reprends un verre de 20 cl pour rester dans la course :) ». Un bouton enregistre directement le verre proposé. Pour l'instant, la Quantité attendue se base sur la référence de démarrage : l'Objectif journalier réparti de façon égale entre 8 h et 22 h. L'application vérifie le Retard chaque minute et passe toute seule à la nouvelle Journée à 4 h.

**Blocked by:** 04 (Navigation et Objectif journalier)

**Status:** ready-for-agent

- [ ] Le module de calcul donne la référence de démarrage : 0 avant 8 h, 1 après 22 h, et une progression linéaire entre les deux. La Quantité attendue vaut cette référence multipliée par l'Objectif journalier de la Journée en cours.
- [ ] Le Retard vaut la Quantité attendue moins ce qui a été bu, quand l'écart est positif. Un Rappel s'affiche si le Retard atteint au moins 12,5 cl.
- [ ] Le verre proposé est le plus petit Format de verre qui comble le Retard, au maximum 50 cl.
- [ ] La carte affiche l'heure, la Quantité attendue et le Retard, arrondis au centilitre, ainsi qu'un bouton « + X cl » qui enregistre une Prise.
- [ ] Le Rappel disparaît dès qu'une Prise a comblé le Retard. S'il reste au moins 12,5 cl de Retard (Retard initial de plus de 50 cl), il reste affiché.
- [ ] Le Retard est vérifié à l'ouverture de l'application, puis chaque minute.
- [ ] À 4 h, l'écran Aujourd'hui passe tout seul à la nouvelle Journée, même si l'application est restée ouverte.
- [ ] Un changement d'Objectif journalier modifie aussitôt la Quantité attendue de la Journée en cours.
- [ ] Le Rappel est une carte dans l'application, pas une notification système.
- [ ] Tests du module de calcul : la référence de démarrage avant 8 h, à 15 h et après 22 h, le seuil de 12,5 cl, le choix du verre proposé et son plafond à 50 cl, un changement d'objectif dans la Journée.
- [ ] Tests sur l'application complète : avec l'horloge simulée, le Rappel apparaît, sa Prise est enregistrée par le bouton, il disparaît, et l'application passe à la nouvelle Journée à 4 h.
