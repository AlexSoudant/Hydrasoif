# 11: Export et import JSON

**What to build:** Dans les Réglages, je peux exporter toutes mes données dans un fichier JSON, puis les importer sur un autre téléphone ou après avoir effacé le navigateur. L'import remplace tout, après une confirmation.

**Blocked by:** 04 (Navigation et Objectif journalier)

**Status:** ready-for-agent

- [ ] « Exporter » télécharge un fichier JSON versionné qui contient toutes les Prises et tous les changements d'Objectif journalier.
- [ ] « Importer » ouvre un sélecteur de fichier. Si le fichier est valide, une confirmation s'affiche : « Ceci remplacera tes N Journées actuelles ».
- [ ] Après confirmation, toutes les données sont remplacées en une seule transaction.
- [ ] Un fichier invalide (JSON illisible, mauvaise structure ou version inconnue) est refusé avec un message clair, sans rien modifier.
- [ ] Annuler la confirmation ne modifie rien.
- [ ] Test d'aller-retour : des données exportées puis importées dans une base vide redonnent les mêmes Journées, les mêmes Prises et les mêmes objectifs.
- [ ] Tests sur l'application complète : import valide avec confirmation, confirmation annulée, fichier invalide refusé.
