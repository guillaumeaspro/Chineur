// Analyse des images pour Chineur (fonction Vercel).
// Reçoit les images déjà converties en JPEG par la page, interroge Claude avec ta clé API
// et renvoie les objets repérés au format attendu par la page.
//
// Réglages (Vercel > Settings > Environment Variables) :
//   ANTHROPIC_API_KEY  obligatoire, ta clé API Anthropic
//   CHINEUR_CODE       facultatif, code d'accès demandé aux visiteurs (vide = accès libre)
//   ANTHROPIC_MODEL    facultatif, modèle utilisé (par défaut claude-sonnet-5-5)
//   MAX_PER_HOUR       facultatif, analyses max par visiteur et par heure (par défaut 20)

const PROMPT_TEMPLATE = "Tu reçois {{COUNT}} envoyée(s) par un utilisateur qui veut retrouver en seconde main des objets qui lui ont plu, sur des sites comme Vinted, Leboncoin, eBay, Back Market, Vestiaire Collective ou Facebook Marketplace. Chaque image peut être :\n- une capture d'une fiche produit sur un site de vente (Zara, Asos, Nike, Apple, Fnac, Ikea, Maisons du Monde, Amazon…) ;\n- une capture d'une vidéo ou d'un post de réseau social (reel Instagram, TikTok, Pinterest…), par exemple une déco d'intérieur ou un « Ikea hack » ;\n- une photo prise sur le vif : une vitrine, un meuble chez quelqu'un, un objet dans la rue.\nLes images sont numérotées dans l'ordre d'envoi, à partir de 1.\n{{HINT}}\nÉtape 1 : repère les objets à rechercher.\n- Sur une capture de fiche produit, ne retiens que le produit principal de la page.\n- Sur une capture de réseau social ou une photo, retiens les objets nettement visibles qu'on pourrait vouloir acheter (meubles, luminaires, déco, vêtements, chaussures, sacs, appareils…), en commençant par le plus mis en valeur. Ignore les éléments flous, minuscules ou impossibles à acheter (murs, plantes en pleine terre, nourriture).\n- Ne décris jamais les personnes elles-mêmes (visage, corps, identité) : seulement les objets. Un vêtement porté peut être retenu s'il est clairement le sujet de l'image.\n- Si le même objet apparaît sur plusieurs images, ne le compte qu'une fois.\n- Au total, 4 objets maximum, triés du plus intéressant au moins intéressant.\n\nÉtape 2 : pour chaque objet, détermine sa catégorie parmi :\n- \"mode\" : vêtements, chaussures, sacs, bijoux, montres, accessoires de mode ;\n- \"high-tech\" : téléphones, ordinateurs, tablettes, consoles, audio, photo, objets connectés ;\n- \"maison\" : meubles, luminaires, déco, vaisselle, linge de maison, électroménager ;\n- \"loisirs\" : sport, vélo, jeux, jouets, livres, puériculture, instruments de musique ;\n- \"autre\" : tout le reste.\n\nÉtape 3 : identifie chaque objet en t'appuyant sur ce qui est visible et sur la précision éventuelle de l'utilisateur. Pour trouver la marque, examine tout le contexte : barre d'adresse ou URL, logo ou nom du site, nom et référence du produit, légende ou texte incrusté d'une vidéo, étiquettes, logos ou textes sur l'objet. Sur un site multimarque, la marque est souvent écrite près du nom du produit. Si la marque est déduite d'indices sans être écrite noir sur blanc, mets \"confiance\" à \"moyenne\".\n- N'invente jamais une marque, un modèle ou une caractéristique technique : si la marque n'est ni visible ni donnée par l'utilisateur, laisse \"marque\" vide et mets \"confiance\" à \"faible\" ou \"moyenne\". Sur une photo prise sur le vif ou une capture de vidéo, c'est le cas le plus fréquent : décris alors l'objet avec précision pour trouver des pièces similaires.\n- Si la marque est inconnue, \"modele\" est un nom descriptif court (ex. \"Manteau long oversize\", \"Buffet bas en bois\").\n- \"matiere\" : matière apparente pour la mode et la maison ; chaîne vide pour la high-tech.\n- \"details\" : 2 à 4 caractéristiques distinctives. En high-tech : capacité, taille d'écran, génération ou année si visibles. En maison : style (scandinave, industriel, vintage…) et dimensions si visibles. En mode : coupe, longueur, col, fermeture, motif.\n\nVocabulaire des requêtes (très important) : les requêtes doivent reprendre les mots que les particuliers écrivent vraiment dans leurs annonces, pas le vocabulaire des fiches produit ni le jargon marketing. Les champs \"modele\" et \"details\" peuvent rester précis, mais dans les requêtes :\n- utilise le terme courant le plus répandu : \"trench\" plutôt que \"gabardine\", \"doudoune\" plutôt que \"parka matelassée\", \"pull\" plutôt que \"maille\", \"baskets\" plutôt que \"sneakers basses\", \"canapé\" plutôt que \"sofa modulable\", \"enceinte\" plutôt que \"haut-parleur connecté\", \"casque\" plutôt que \"headset\" ;\n- n'utilise jamais les noms commerciaux propres à l'enseigne (noms de collection, références internes, \"effet laine\", \"relaxed fit\"…). Exception : en maison, les noms de modèles Ikea et de designers connus sont très recherchés (Kallax, Billy, Poäng, Tulip, Eames…), garde-les ;\n- garde le nom de modèle quand les gens recherchent par ce nom : modèles iconiques de mode (Air Force 1, Stan Smith, Samba, 501, Speedy…) et, en high-tech, toujours le modèle et la génération (iphone 13, ps5, airpods pro 2, macbook air m2) ;\n- en high-tech, ajoute la capacité si elle est visible (\"128 go\") dans la requête précise seulement ;\n- couleurs simples et usuelles : \"beige\" plutôt que \"camel sable\", \"bleu marine\" plutôt que \"navy\", \"kaki\" plutôt que \"vert olive\" ;\n- pas de mots inutiles (femme/homme seulement si l'article est clairement genré, pas d'adjectifs vagues comme \"élégant\", \"tendance\" ou \"premium\").\n\nExigence de précision (prioritaire) : l'utilisateur veut retrouver exactement ses objets.\n- La requête \"Précise\" doit contenir tous les éléments qui distinguent l'objet de ses voisins et qu'un vendeur mettrait dans son titre : modèle exact, version ou génération (pro, max, mini, 2e génération, m2…), capacité ou taille d'écran en high-tech, couleur exacte en mode et en maison. Une requête trop vague (ex. \"iphone\" ou \"baskets nike\") est une erreur.\n- Un mot faux est pire qu'un mot absent : une mauvaise génération, capacité ou couleur fait disparaître les bonnes annonces. N'inclus dans les requêtes que les éléments que tu as lus ou vus avec certitude ; en cas de doute sur un élément, retire-le de la requête et mentionne le doute dans \"details\".\n- Avant de répondre, relis les images et vérifie un par un chaque élément de \"modele\" et de la requête \"Précise\". Sur une fiche produit, si la page affiche une variante sélectionnée (couleur, capacité, taille), c'est celle-là qui compte.\n- \"confiance\" vaut \"haute\" uniquement si la marque ET le modèle exact sont lisibles ou certains.\n\nRéponds uniquement avec un objet JSON de cette forme :\n{\"articles\": [{\"image\": 1, \"categorie_globale\": \"mode\", \"marque\": \"Nike\", \"modele\": \"Air Force 1 '07\", \"categorie\": \"Baskets basses\", \"couleur\": \"Blanc\", \"matiere\": \"Cuir\", \"details\": \"Semelle blanche, swoosh cousu\", \"prix_neuf_estime\": \"≈ 120 €\", \"confiance\": \"haute\", \"requetes\": [{\"type\": \"Précise\", \"q\": \"nike air force 1 07 blanc\"}, {\"type\": \"Large\", \"q\": \"air force 1 blanche\"}, {\"type\": \"Équivalent\", \"q\": \"baskets cuir blanches basses\"}]}]}\n\nRègles : textes en français ; \"image\" est le numéro de l'image où l'objet se voit le mieux ; \"categorie_globale\" vaut exactement \"mode\", \"high-tech\", \"maison\", \"loisirs\" ou \"autre\" ; \"confiance\" vaut \"haute\", \"moyenne\" ou \"faible\" ; utilise une chaîne vide si une information n'est pas visible ; \"prix_neuf_estime\" : le prix affiché s'il est visible, sinon ton estimation du prix neuf, ou vide si tu ne sais pas ; si aucun objet exploitable n'est visible, renvoie {\"articles\": []} ; pour chaque objet, donne exactement 3 requêtes de 2 à 6 mots, en minuscules, rédigées comme un particulier titrerait son annonce sur Leboncoin ou Vinted :\n- \"Précise\" : le même objet (marque + modèle + couleur, ou capacité en high-tech ; sans marque connue : type + détail le plus distinctif + couleur) ;\n- \"Large\" : plus de résultats (marque + type d'objet, ou modèle sans capacité ni couleur en high-tech ; sans marque : type + couleur) ;\n- \"Équivalent\" : une alternative (mode et maison : sans marque, style + matière + couleur ; high-tech : le modèle de la génération précédente ou un concurrent direct du même niveau, ex. \"iphone 12\" pour un iPhone 13, ou \"galaxy buds\" pour des AirPods).";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";
const MAX_PER_HOUR = parseInt(process.env.MAX_PER_HOUR || "20", 10);
const MEDIA = /^image\/(jpeg|png|webp|gif)$/;
const hits = new Map(); // limite indicative par visiteur (propre à chaque instance du serveur)

function buildPrompt(hint, count) {
  const h = String(hint || "").replace(/["\n\r]/g, " ").slice(0, 200).trim();
  return PROMPT_TEMPLATE
    .replace("{{COUNT}}", count > 1 ? count + " images" : "une image")
    .replace("{{HINT}}", h ? `\nL'utilisateur précise : "${h}". Considère ces informations comme fiables (par exemple la marque).\n` : "");
}

function tooMany(ip) {
  const now = Date.now(), hour = 3600e3;
  const list = (hits.get(ip) || []).filter(t => now - t < hour);
  if (list.length >= MAX_PER_HOUR) { hits.set(ip, list); return true; }
  list.push(now); hits.set(ip, list);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some(t => now - t < hour)) hits.delete(k);
  return false;
}

function extractJson(text) {
  const t = String(text || "").replace(/```(?:json)?/g, "");
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  if (a < 0 || b <= a) return null;
  try { return JSON.parse(t.slice(a, b + 1)); } catch { return null; }
}

const norm = s => String(s || "").trim().toLowerCase();

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "method" });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) { console.error("ANTHROPIC_API_KEY manquante"); return res.status(500).json({ error: "server" }); }

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = null; } }
  if (!body || typeof body !== "object") return res.status(400).json({ error: "server" });

  const expected = process.env.CHINEUR_CODE;
  if (expected && norm(body.code) !== norm(expected)) return res.status(401).json({ error: "code" });

  const images = Array.isArray(body.images) ? body.images.slice(0, 4) : [];
  if (!images.length || images.some(im => !im || typeof im.data !== "string" || !im.data || !MEDIA.test(im.mediaType || ""))) {
    return res.status(400).json({ error: "image_rejected" });
  }

  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "inconnu";
  if (tooMany(ip)) return res.status(429).json({ error: "rate_limited" });

  let r;
  try {
    r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 3000,
        messages: [{
          role: "user",
          content: [
            ...images.map(im => ({ type: "image", source: { type: "base64", media_type: im.mediaType, data: im.data } })),
            { type: "text", text: buildPrompt(body.hint, images.length) },
          ],
        }],
      }),
    });
  } catch (e) {
    console.error("Appel à Claude impossible :", e);
    return res.status(502).json({ error: "upstream_error" });
  }

  if (!r.ok) {
    const detail = await r.text().catch(() => "");
    console.error("Réponse de Claude", r.status, detail.slice(0, 500));
    let type = "";
    try { type = JSON.parse(detail)?.error?.type || ""; } catch {}
    if (r.status === 429 || r.status === 529) return res.status(503).json({ error: "upstream_error", detail: type });
    if (r.status === 400 && /image/i.test(detail)) return res.status(400).json({ error: "image_rejected", detail: type });
    // Le type d'erreur (jamais la clé) aide à diagnostiquer : clé refusée, modèle inconnu, crédit épuisé…
    const hint = /credit|billing|balance/i.test(detail) ? "credit" : type;
    return res.status(502).json({ error: "server", detail: hint, status: r.status });
  }

  const data = await r.json().catch(() => null);
  const text = (data?.content || []).filter(c => c.type === "text").map(c => c.text).join("");
  const json = extractJson(text);
  if (!json) return res.status(502).json({ error: "invalid_json" });
  return res.status(200).json(json);
};
