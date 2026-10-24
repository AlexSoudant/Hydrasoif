# 01: Squelette de l'application et première Prise

**What to build:** Une première version utilisable de l'écran Aujourd'hui. On appuie sur 12,5 cl, 25 cl ou 50 cl, et la Prise est enregistrée à l'heure actuelle. Elle s'ajoute à la liste des Prises du jour, et le total « X cl / 1,50 L » se met à jour. Les données sont conservées quand on recharge la page. Ce ticket met aussi en place la base du projet (Vite, React, TypeScript, Tailwind et Dexie, conformément à l'ADR 0001) et les deux points d'entrée de test décrits dans la spec : l'application complète rendue avec fake-indexeddb et une horloge injectable, et le module de calcul du Rappel.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Les trois boutons de Format de verre sont en bas de l'écran Aujourd'hui. Un appui enregistre une Prise horodatée à l'instant présent.
- [ ] Les quantités sont stockées en millilitres entiers (125, 250, 500).
- [ ] La liste des Prises du jour affiche l'heure et le Format de verre de chaque Prise.
- [ ] Le total bu de la Journée en cours s'affiche avec l'Objectif journalier par défaut (1,50 L).
- [ ] La date de la Journée en cours est affichée en haut de l'écran.
- [ ] Le module de calcul rattache une Prise à sa Journée (coupure à 4 h, heure locale) et calcule le total bu. L'instant présent est un paramètre : le module ne lit jamais l'horloge lui-même.
- [ ] L'horloge est une source unique et injectable, que les tests peuvent remplacer.
- [ ] Les Prises survivent à un rechargement de la page (IndexedDB).
- [ ] Test sur l'application complète : un appui sur un bouton fait apparaître la Prise dans la liste et met le total à jour.
- [ ] Tests du module de calcul : une Prise à 3 h 59 appartient à la Journée précédente, une Prise à 4 h 00 à la nouvelle Journée.
- [ ] L'interface est en français. Le thème clair ou sombre suit le réglage du téléphone, avec une couleur principale bleu eau.
