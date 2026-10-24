# 08: Rythme habituel

**What to build:** Dès que j'ai assez d'historique, le Rappel se base sur mon propre rythme et non plus sur une répartition égale de l'objectif. À un instant donné, il prend la part de leur total que j'avais en moyenne déjà bue à ce même instant lors des Journées passées, et l'applique à l'Objectif journalier du jour.

**Blocked by:** 06 (Rappel, avec la référence de démarrage)

**Status:** ready-for-agent

- [ ] Le module de calcul donne le Rythme habituel à un instant donné de la Journée, à la minute près. Pour chaque Journée prise en compte, il calcule la part du total de cette Journée déjà bue à ce même instant, puis fait la moyenne de ces parts.
- [ ] Les Journées prises en compte sont les 14 dernières Journées passées qui comptent au moins une Prise. La Journée en cours n'en fait jamais partie.
- [ ] Avec au moins 3 Journées utilisables, la Quantité attendue vaut le Rythme habituel multiplié par l'Objectif journalier du jour. Avec moins de 3, on reste sur la référence de démarrage.
- [ ] Le Rappel, son seuil et le verre proposé fonctionnent comme dans les tickets 06 et 07.
- [ ] Tests du module de calcul : basculement à exactement 3 Journées utilisables, Journées sans Prise ignorées, limite à 14 Journées (la 15e Journée la plus ancienne est ignorée), valeur à la minute près (11 h 37 différent de 11 h 00 quand des Prises tombent entre les deux), Rythme habituel combiné à un objectif différent de celui des Journées passées.
- [ ] Test sur l'application complète : avec des Journées passées enregistrées dans la base, le Rappel affiche la Quantité attendue tirée du Rythme habituel.
