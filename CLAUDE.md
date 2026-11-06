# Chineur

Appli web pour retrouver en seconde main un objet repéré en photo : l'utilisateur prend ou importe une photo, l'appli identifie l'objet et l'aide à le trouver d'occasion.

## Statut
- En phase de test : partagée à quelques testeurs depuis octobre 2026.
- Le nom « Chineur » est définitif (« Déniche » écarté).

## Stack
- Appli en une seule page (`index.html`), HTML/CSS/JS sans framework ; installable (PWA : `manifest.webmanifest`, `sw.js`).
- Hébergement : Vercel (déploiement depuis `main`).
- Analyse des photos : fonction Vercel `api/identify.js`, qui envoie les images à Claude via ma clé API et renvoie les objets repérés ; les photos ne sont pas conservées.
- Réglages dans Vercel (variables d'environnement) : `ANTHROPIC_API_KEY` (obligatoire), `CHINEUR_CODE`, `ANTHROPIC_MODEL`, `MAX_PER_HOUR`. Après un changement de variable, il faut relancer un déploiement.
- Ne jamais écrire la clé API dans le code ni dans le dépôt (il est public).

## Règles
- Interface 100 % en français, ton chaleureux et un peu « brocante ».
- Pensée mobile first : on l'utilise surtout sur place, téléphone en main.
- Je travaille au marketing, pas au développement : explique les changements en langage clair.
- Les testeurs utilisent l'appli : ne casse pas l'existant, et préviens-moi avant tout changement visible pour eux.
- Ne pas ajouter de dépendance ou de service payant sans me demander.

## Marketing
Je m'occupe aussi de la promo de l'appli : quand je demande des textes (accroches, posts, description), garde le ton de la marque et reste concis.
