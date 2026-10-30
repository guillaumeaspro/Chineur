# Chineur

Un coup de cœur ? Prends-le en photo : Chineur reconnaît l'objet et te montre où le trouver en seconde main (Vinted, Leboncoin, Back Market, eBay…).

L'appli s'installe sur l'écran d'accueil du téléphone. Les photos sont analysées par Claude via la clé API du propriétaire du site ; elles ne sont pas conservées.

## Réglages sur Vercel (Settings › Environment Variables)

| Variable | Rôle |
| --- | --- |
| `ANTHROPIC_API_KEY` | Obligatoire. Clé API Anthropic utilisée pour l'analyse des photos. |
| `CHINEUR_CODE` | Facultatif. Code d'accès demandé aux visiteurs. Vide : accès libre. |
| `ANTHROPIC_MODEL` | Facultatif. Modèle utilisé (par défaut `claude-sonnet-5-5`). |
| `MAX_PER_HOUR` | Facultatif. Analyses max par visiteur et par heure (par défaut 20). |

Après avoir modifié une variable, relance un déploiement (Deployments › Redeploy) pour qu'elle soit prise en compte.
