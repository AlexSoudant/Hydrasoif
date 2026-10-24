# 02: Installation et déploiement

**What to build:** Je peux installer l'application sur l'écran d'accueil de mon téléphone Android depuis son adresse GitHub Pages, et l'utiliser sans réseau. Chaque push sur `main` déploie automatiquement la nouvelle version.

**Blocked by:** 01 (Squelette de l'application et première Prise)

**Status:** ready-for-agent

- [ ] Un manifeste web est fourni (nom, icônes, couleur bleu eau, affichage en plein écran sans l'interface du navigateur) et Chrome Android propose d'installer l'application.
- [ ] Un service worker (vite-plugin-pwa) met en cache l'application : après une première visite, elle s'ouvre et enregistre des Prises sans réseau.
- [ ] Une GitHub Action construit l'application et la déploie sur GitHub Pages à chaque push sur `main`.
- [ ] La configuration de Vite tient compte du chemin de base imposé par GitHub Pages : les fichiers, le manifeste et le service worker se chargent correctement.
- [ ] Une nouvelle version déployée finit par remplacer l'ancienne sur le téléphone, au plus tard après fermeture et réouverture de l'application.
