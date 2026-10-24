# PWA locale, sans backend

Hydrasoif est une PWA (Vite + React + TypeScript) dont toutes les données vivent dans IndexedDB sur le téléphone, sans serveur. C'est une application personnelle (un seul utilisateur, Android), et un Rappel affiché seulement quand l'application est ouverte suffit. On évite ainsi d'héberger une base de données, de gérer une connexion et d'envoyer des notifications Web Push.

## Considered Options

- **PWA + backend (Supabase ou Cloudflare Workers)** : seule option web qui permet d'envoyer un Rappel quand l'application est fermée, grâce à Web Push déclenché par une tâche planifiée côté serveur. Rejetée parce que c'est plus complexe sans être nécessaire pour l'instant.
- **Application native Expo** : notifications locales fiables, mais elle s'éloigne de l'application web demandée et nécessite une installation hors navigateur.

## Consequences

- Aucun Rappel quand l'application est fermée. Pour en avoir, il faudra un backend.
- Les données ne sont stockées que sur le téléphone. Effacer les données du navigateur ou changer de téléphone fait tout perdre, d'où l'export/import JSON dans les réglages.
