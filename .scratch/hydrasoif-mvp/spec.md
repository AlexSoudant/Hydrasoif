# Spec : Hydrasoif MVP

Status: ready-for-agent

## Problem Statement

Je n'arrive pas à savoir si je bois assez d'eau au fil de la journée. Je m'en rends compte le soir, quand il est trop tard pour rattraper. Les applications existantes me rappellent de boire à heures fixes, sans tenir compte de mon rythme réel. Elles ne me disent pas, à un instant donné, si je suis en avance ou en retard par rapport à mes habitudes ni combien il me faudrait boire pour rattraper.

## Solution

Une application web installable sur mon téléphone Android (PWA), en français et pour moi seul. Elle fonctionne hors ligne et toutes ses données restent sur le téléphone.

- J'enregistre chaque Prise d'un seul appui, en choisissant un Format de verre : 12,5 cl, 25 cl ou 50 cl.
- Un verre d'eau dessiné à l'écran se remplit au fil de la Journée, jusqu'à être plein quand l'Objectif journalier est atteint.
- Une ligne pointillée sur ce verre indique la Quantité attendue à l'instant présent, calculée à partir de mon Rythme habituel et de l'objectif du jour.
- Quand je suis en Retard, un Rappel me dit combien j'aurais normalement dû boire et me propose un verre pour rattraper.
- Je peux consulter mes Journées passées, régler mon Objectif journalier et sauvegarder ou restaurer mes données dans un fichier.

## User Stories

### Enregistrer une Prise

1. En tant qu'utilisateur, je veux enregistrer une Prise de 12,5 cl, 25 cl ou 50 cl d'un seul appui, pour que le suivi ne me demande presque aucun effort.
2. En tant qu'utilisateur, je veux que les trois boutons de Format de verre soient en bas de l'écran, pour les atteindre avec le pouce en tenant le téléphone d'une main.
3. En tant qu'utilisateur, je veux qu'une Prise soit horodatée automatiquement à l'heure actuelle, pour ne rien avoir à saisir.
4. En tant qu'utilisateur, je veux qu'un message « Prise de X cl ajoutée · Annuler » reste affiché 5 secondes après chaque Prise, pour corriger tout de suite un appui sur le mauvais bouton.
5. En tant qu'utilisateur, je veux que « Annuler » supprime complètement la Prise, pour que le total et le verre reviennent à l'état précédent.
6. En tant qu'utilisateur, je veux voir la liste des Prises de la Journée en cours avec leur heure et leur Format de verre, pour savoir ce que j'ai déjà bu.
7. En tant qu'utilisateur, je veux supprimer une Prise de la Journée en cours depuis son menu, pour retirer une Prise enregistrée par erreur.
8. En tant qu'utilisateur, je veux modifier l'heure d'une Prise de la Journée en cours, pour enregistrer après coup un verre bu plus tôt.
9. En tant qu'utilisateur, je veux que la nouvelle heure reste entre 4 h et maintenant dans la Journée en cours, pour ne pas déplacer une Prise vers une autre Journée ou dans le futur.
10. En tant qu'utilisateur, je veux corriger une erreur de Format de verre en supprimant la Prise puis en la refaisant, sans écran de modification supplémentaire.

### Journée

11. En tant qu'utilisateur, je veux qu'une Journée aille de 4 h du matin à 4 h le lendemain, pour qu'un verre bu à 0 h 30 compte encore pour ma soirée.
12. En tant qu'utilisateur, je veux que l'écran Aujourd'hui passe automatiquement à la nouvelle Journée à 4 h, même si l'application est restée ouverte.
13. En tant qu'utilisateur, je veux voir la date de la Journée en cours en haut de l'écran Aujourd'hui, pour savoir quelle Journée je consulte.

### Verre de progression

14. En tant qu'utilisateur, je veux qu'un verre d'eau dessiné se remplisse en proportion de ce que j'ai bu par rapport à mon Objectif journalier, pour voir ma progression d'un coup d'œil.
15. En tant qu'utilisateur, je veux lire dans le verre la quantité bue, l'objectif et le pourcentage (par exemple « 25 cl / 1,50 L · 17 % »), pour connaître les chiffres exacts.
16. En tant qu'utilisateur, je veux que le niveau monte en environ 0,6 s avec une légère vague à chaque Prise, pour que l'enregistrement soit agréable à faire.
17. En tant qu'utilisateur, je veux que cette animation soit désactivée quand mon téléphone demande de réduire les animations, pour respecter mes réglages d'accessibilité.
18. En tant qu'utilisateur, je veux qu'une ligne pointillée discrète sur le verre indique la Quantité attendue à l'instant présent, pour voir si je suis en Retard même quand le Rappel est masqué.
19. En tant qu'utilisateur, je veux que cette ligne avance au fil de la Journée, pour qu'elle reste juste à chaque instant.
20. En tant qu'utilisateur, je veux que la ligne disparaisse une fois l'Objectif journalier atteint, puisqu'elle ne sert plus à rien.
21. En tant qu'utilisateur, je veux que le verre reste plein et déborde de quelques gouttes quand je dépasse mon objectif, pour voir que je l'ai dépassé.
22. En tant qu'utilisateur, je veux lire le dépassement (par exemple « 1,62 / 1,50 L · +12 cl ») quand j'ai dépassé mon objectif, pour savoir de combien je l'ai dépassé.
23. En tant qu'utilisateur, je veux voir un petit message de félicitations dans le verre quand j'atteins mon Objectif journalier, pour être encouragé.
24. En tant qu'utilisateur, je veux pouvoir continuer à enregistrer des Prises après avoir atteint mon objectif.

### Rappel

25. En tant qu'utilisateur, je veux voir un Rappel quand je suis en Retard, pour savoir qu'il faut que je boive.
26. En tant qu'utilisateur, je veux que le Rappel dise combien j'aurais normalement dû boire à cette heure et combien il me manque, par exemple : « À 11h tu as normalement bu 45 cl ! Reprends un verre de 20 cl pour rester dans la course :) ».
27. En tant qu'utilisateur, je veux que la Quantité attendue soit calculée à partir de mon Rythme habituel appliqué à l'Objectif journalier du jour, pour que le Rappel suive mes habitudes tout en me poussant vers mon objectif actuel.
28. En tant qu'utilisateur, je veux que mon Rythme habituel soit calculé à la minute près, pour que le Rappel et la ligne pointillée avancent progressivement, sans sauter d'un coup à chaque heure pile.
29. En tant qu'utilisateur, je veux que le Rythme habituel ne porte que sur les 14 dernières Journées passées qui comptent au moins une Prise, pour qu'il suive l'évolution de mes habitudes sans être faussé par les jours où je n'ai rien enregistré.
30. En tant qu'utilisateur, je veux que la Journée en cours ne compte pas dans le calcul de mon Rythme habituel.
31. En tant que nouvel utilisateur avec moins de 3 Journées passées qui comptent au moins une Prise, je veux que l'Objectif journalier soit réparti de façon égale entre 8 h et 22 h, pour avoir des Rappels utiles dès le premier jour.
32. En tant qu'utilisateur, je veux que le Retard soit vérifié à l'ouverture de l'application, puis chaque minute tant qu'elle reste ouverte.
33. En tant qu'utilisateur, je veux qu'un Rappel ne s'affiche que si le Retard atteint au moins 12,5 cl, pour ne pas être relancé pour quelques centilitres.
34. En tant qu'utilisateur, je veux que le Rappel s'affiche sous forme de carte en haut de l'écran Aujourd'hui, pas comme notification système.
35. En tant qu'utilisateur, je veux que le Rappel propose un bouton pour enregistrer le plus petit Format de verre qui comble mon Retard, pour rattraper d'un seul appui.
36. En tant qu'utilisateur avec un Retard de plus de 50 cl, je veux que le Rappel me propose 50 cl et reste affiché après la Prise tant que le Retard est d'au moins 12,5 cl.
37. En tant qu'utilisateur, je veux masquer le Rappel avec ✕ pendant 30 minutes, pour qu'il ne m'encombre pas quand je ne peux pas boire tout de suite.
38. En tant qu'utilisateur, je veux que le Rappel masqué revienne après 30 minutes si le Retard est toujours d'au moins 12,5 cl.
39. En tant qu'utilisateur, je veux qu'aucun Rappel ne s'affiche une fois mon Objectif journalier atteint, jusqu'à la fin de la Journée.
40. En tant qu'utilisateur, je veux que le Rappel disparaisse dès que ma Prise a comblé le Retard.
41. En tant qu'utilisateur, je veux que le Rappel suive aussitôt un changement de mon Objectif journalier dans la Journée, pour que la Quantité attendue reste cohérente avec le nouvel objectif.

### Objectif journalier

42. En tant qu'utilisateur, je veux régler mon Objectif journalier de 1 L à 2 L, par pas de 25 cl, depuis les Réglages.
43. En tant que nouvel utilisateur, je veux un Objectif journalier de 1,5 L par défaut, pour pouvoir commencer sans rien régler.
44. En tant qu'utilisateur, je veux qu'un changement d'Objectif journalier s'applique à partir de la Journée en cours, pour que mes Journées passées gardent l'objectif qu'elles avaient.
45. En tant qu'utilisateur, je veux que les boutons − et + soient désactivés aux bornes de 1 L et 2 L, pour ne pas pouvoir sortir de la plage autorisée.

### Historique

46. En tant qu'utilisateur, je veux voir la liste de mes Journées passées, de la plus récente à la plus ancienne, avec pour chacune la quantité bue et l'Objectif journalier.
47. En tant qu'utilisateur, je veux voir un ✓ à côté des Journées où j'ai atteint mon objectif, pour repérer mes bons jours.
48. En tant qu'utilisateur, je veux toucher une Journée passée pour voir la liste de ses Prises.
49. En tant qu'utilisateur, je veux que le détail d'une Journée passée soit en lecture seule, pour ne pas modifier mon Rythme habituel après coup.
50. En tant qu'utilisateur, je veux que les Journées sans aucune Prise n'apparaissent pas dans l'Historique.

### Sauvegarde

51. En tant qu'utilisateur, je veux exporter toutes mes données dans un fichier JSON depuis les Réglages, pour les sauvegarder hors du navigateur.
52. En tant qu'utilisateur, je veux importer un fichier JSON exporté auparavant, pour restaurer mes données sur un nouveau téléphone ou après avoir effacé le navigateur.
53. En tant qu'utilisateur, je veux qu'une confirmation m'avertisse avant l'import que mes N Journées actuelles vont être remplacées, pour éviter d'écraser mes données par erreur.
54. En tant qu'utilisateur, je veux qu'un fichier invalide soit refusé avec un message clair, sans toucher à mes données actuelles.

### Application

55. En tant qu'utilisateur, je veux installer l'application sur l'écran d'accueil de mon téléphone Android, pour l'ouvrir comme une application normale.
56. En tant qu'utilisateur, je veux que l'application fonctionne entièrement hors ligne, pour enregistrer mes Prises même sans réseau.
57. En tant qu'utilisateur, je veux passer d'un écran à l'autre (Aujourd'hui, Historique, Réglages) grâce à une barre de navigation en bas.
58. En tant qu'utilisateur, je veux que l'application suive le thème clair ou sombre de mon téléphone.
59. En tant qu'utilisateur, je veux que l'application soit entièrement en français.
60. En tant que développeur, je veux que chaque push sur `main` déploie l'application sur GitHub Pages, pour que mon téléphone ait toujours la dernière version.

## Implementation Decisions

### Architecture

- PWA locale sans backend, conformément à l'ADR 0001 : Vite, React et TypeScript, données dans IndexedDB via Dexie, installation et mise en cache hors ligne via vite-plugin-pwa, mise en forme avec Tailwind CSS, sans bibliothèque de composants.
- Hébergement sur GitHub Pages. Une GitHub Action construit et déploie l'application à chaque push sur `main` (le dépôt est public). La configuration de Vite doit tenir compte du chemin de base imposé par GitHub Pages.

### Modules

- **Module de calcul du Rappel (pur, sans React ni Dexie).** C'est le cœur du domaine. Il prend en entrée les Prises, l'Objectif journalier de chaque Journée et l'instant présent, et il calcule :
  - la Journée à laquelle appartient un instant (coupure à 4 h, heure locale) ;
  - ce qui a été bu depuis le début de la Journée en cours ;
  - le Rythme habituel à un instant donné de la Journée : pour chacune des 14 dernières Journées passées qui comptent au moins une Prise, la part du total de cette Journée déjà bue au même instant, puis la moyenne de ces parts ;
  - la référence de démarrage, quand il y a moins de 3 Journées utilisables : 0 avant 8 h, 1 après 22 h, et une progression linéaire entre les deux ;
  - la Quantité attendue, égale au Rythme habituel (ou à la référence de démarrage) multiplié par l'Objectif journalier du jour ;
  - le Retard, et la décision d'afficher ou non un Rappel : Retard ≥ 12,5 cl, objectif pas encore atteint, Rappel non masqué ;
  - le Format de verre proposé : le plus petit qui comble le Retard, au maximum 50 cl.

  L'instant présent est toujours un paramètre du module, qui ne lit jamais l'horloge lui-même.
- **Module de stockage (Dexie).** Il expose des opérations du domaine : ajouter, supprimer et changer l'heure d'une Prise ; lire et modifier l'Objectif journalier ; lire les Prises d'une Journée ou des Journées passées ; exporter et importer. Il vérifie lui-même que l'heure d'une Prise reste dans la Journée en cours et pas dans le futur.
- **Horloge.** Une source unique de l'instant présent, rafraîchie chaque minute et injectable. Elle déclenche la nouvelle vérification du Retard, l'avancée de la ligne pointillée et le passage à la nouvelle Journée à 4 h.
- **Interface.** Trois écrans (Aujourd'hui, Historique, Réglages) et une barre de navigation en bas. Le verre de progression est un composant SVG : le niveau, la vague, la ligne de Quantité attendue et le débordement au-delà de 100 %.

### Données

- **Prise** : un identifiant, un Format de verre (125, 250 ou 500 ml) et un horodatage. La Journée d'une Prise se déduit toujours de son horodatage et n'est jamais stockée.
- **Objectif journalier** : les quantités sont stockées en millilitres entiers (125, 250, 500, 1000 à 2000 par pas de 250), pour éviter les erreurs d'arrondi. Pour garder l'objectif de chaque Journée, on enregistre l'historique des changements d'objectif (date de Journée → valeur). L'objectif d'une Journée est la dernière valeur fixée au plus tard ce jour-là, ou 1500 ml par défaut.
- **Masquage du Rappel** : l'instant jusqu'auquel le Rappel est masqué (✕ + 30 min). Cet état n'a pas besoin de survivre à un rechargement de la page.
- **Format d'export JSON** : un objet versionné, par exemple `{ version: 1, prises: [...], objectifs: [...] }`. L'import vérifie le format et la version, puis remplace toutes les données en une seule transaction. Un fichier invalide ne modifie rien.

### Comportements précis

- Le Rappel affiche des quantités arrondies au centilitre, avec l'heure de l'instant présent (par exemple « À 11h » ou « À 11h37 »).
- « Annuler » supprime la Prise elle-même : c'est la même opération que la suppression depuis le menu.
- Le passage à la Journée suivante a lieu à 4 h précises, à l'heure locale du téléphone.

## Testing Decisions

- Un bon test vérifie uniquement ce qui est visible de l'extérieur : ce qu'affiche l'interface, ou ce que renvoie le module de calcul. Aucun test ne porte sur l'organisation interne des composants React, sur l'état interne ou sur la structure de la base Dexie. On doit pouvoir réorganiser le code sans casser un seul test.
- **Point d'entrée 1, le principal : l'application complète.** Vitest et Testing Library dans jsdom, avec une base IndexedDB en mémoire (fake-indexeddb) et une horloge simulée (fake timers et horloge injectée). Les tests enregistrent des Prises en appuyant sur les boutons de Format de verre, puis vérifient ce qu'affiche l'écran : le niveau du verre et son texte, l'apparition du Rappel et son contenu, l'effet du ✕ puis 30 minutes plus tard, Annuler, la modification d'heure, le passage à 4 h, l'Historique et le détail en lecture seule, le réglage de l'objectif, l'export et l'import (fichier valide et fichier invalide).
- **Point d'entrée 2 : le module de calcul du Rappel.** Des tests unitaires de fonctions pures avec des données construites à la main. Ils couvrent les cas limites qu'il serait trop lourd de tester via l'interface :
  - une Prise à 3 h 59 ou à 4 h 00 ;
  - la référence de démarrage avec 0, 1 ou 2 Journées utilisables, puis le Rythme habituel à partir de 3 ;
  - les Journées sans Prise ignorées ;
  - la limite à 14 Journées ;
  - le calcul à la minute près ;
  - le seuil de 12,5 cl ;
  - le choix du Format de verre proposé et son plafond à 50 cl ;
  - l'objectif atteint et l'objectif dépassé ;
  - un changement d'Objectif journalier dans la Journée.
- Il n'existe pas encore de tests dans le dépôt : ces deux points d'entrée serviront de modèle aux suivants.

## Out of Scope

- Les notifications quand l'application est fermée : pas de Web Push et pas de serveur (voir l'ADR 0001).
- La synchronisation entre plusieurs appareils et les comptes utilisateurs.
- La modification des Journées passées et l'ajout d'une Prise dans une Journée passée.
- La modification du Format de verre d'une Prise existante : on la supprime et on la refait.
- Les graphiques et statistiques avancées dans l'Historique.
- Des Formats de verre personnalisés en plus de 12,5, 25 et 50 cl.
- Une heure de coupure de la Journée réglable, ou une plage horaire de démarrage réglable.
- La fusion de données à l'import : l'import remplace toujours tout.
- Toute autre langue que le français.
- Le support d'iOS : l'application cible Android et Chrome.

## Further Notes

- Le vocabulaire utilisé est celui de `GLOSSARY.md` : Prise, Format de verre, Objectif journalier, Journée, Rythme habituel, Quantité attendue, Retard, Rappel.
- Une Journée qui ne compte qu'une Prise, par exemple parce que j'ai oublié d'enregistrer les autres, fausse un peu le Rythme habituel. C'est un compromis accepté : on pourra plus tard ignorer les Journées dont le total est très bas.
- L'export JSON est la seule sauvegarde possible. Il vaudra la peine de l'utiliser de temps en temps.
