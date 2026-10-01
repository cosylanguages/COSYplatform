# Audit de COSYplatform — 1 octobre 2026

## Synthèse

Le dépôt a une base de contenu structurée et ses validations locales passent. Il ne faut toutefois pas le considérer comme prêt pour des contenus privés : le déploiement GitHub Pages publie tout le dépôt, alors que les portails téléchargent aussi les leçons directement depuis ces fichiers publics. Le contrôle Supabase ne protège donc pas les sources statiques.

Les autres écarts les plus visibles sont 515 références de leçons en échec, 924 séquences explicitement planifiées, des modèles Supabase ajoutés mais pas consommés par l’interface, et plusieurs rapports/documentations dont les chiffres ne correspondent plus à l’état courant.

## Constats prioritaires

### P1 — Les leçons statiques contournent la protection Supabase

Le workflow GitHub Pages publie la racine complète (`path: '.'`, [workflow Pages](../.github/workflows/pages.yml#L28)), y compris `lessons/`. Les vues élève et enseignant téléchargent une leçon avec `fetch(lessonPath)` ([student.html](../student.html#L1013), [teacher.html](../teacher.html#L1001)). La classe en direct tente Supabase, puis retombe sur le même fichier statique si aucune ligne n’est retournée ([classroom.html](../classroom.html#L1217)).

Conséquence : RLS ne contrôle pas l’accès à ces fichiers. De plus, le paramètre d’URL `lesson` mène directement au rendu ([student.html](../student.html#L503)); le profil est filtré sur le catalogue, mais n’est pas revalidé contre le cours demandé dans le rendu de la leçon ([shared/js/auth-guard.js](../shared/js/auth-guard.js#L324)). Un utilisateur peut aussi demander une URL de fichier statique directement. Cela contredit l’avertissement du README qui annonce que le contenu de production est servi depuis Supabase ([README.md](../README.md#L9)).

**À régler avant tout contenu réellement confidentiel :** ne pas déployer les sources de leçons dans le site public; supprimer le repli statique en production; appliquer l’autorisation au chargement direct et faire correspondre la politique RLS aux inscriptions/cours, pas seulement à la langue et au niveau.

### P1 — 515 liens de ressources échouent dans les leçons

`npm run check:links` a contrôlé 7 904 références de 833 fichiers et trouvé 515 erreurs dans 510 leçons : 500 URL de manuels de communication en HTTP 404 (réparties sur 11 URL distinctes) et 15 entrées de vocabulaire absentes de l’index COSYdata. Le rapport détaillé a été régénéré dans [link-integrity-report.md](link-integrity-report.md). Ce contrôle n’est pas inclus dans `npm run validate` ni dans le workflow CI.

### P2 — Les migrations Supabase ne forment pas encore un parcours produit cohérent

- L’interface de classe lit `lesson_content`; aucune page ne lit `session_content` ou `manual_content`.
- Le script de publication envoie les dossiers `manuals/`, `teacher-guides/`, etc. dans `lesson_content`, pas dans la table `manual_content` prévue à cet effet ([publish_to_supabase.js](../scripts/publish_to_supabase.js#L25), [publish_to_supabase.js](../scripts/publish_to_supabase.js#L174)).
- `supabase/schema.sql` ne contient que `profiles` et `lesson_content`; les tables `session_content` et `manual_content` ne sont créées que par les migrations 0002 et 0003. Ce fichier seul ne représente donc pas le schéma complet.
- 102 identifiants de leçons sont réutilisés entre les répertoires de langues. C’est cohérent si le chemin est l’identité canonique, mais le script de publication crée aussi un alias global avec l’ID comme clé primaire et conserve seulement la dernière valeur lors d’une collision. Les recherches par chemin restent distinctes; les recherches par ID seul sont ambiguës.

### P2 — La couverture éditoriale est encore partielle

Les compteurs générés actuels indiquent 36 roadmaps, 495 entrées disponibles et 924 planifiées, soit 1 419 entrées au total; seuls 11 cours sur 182 sont actifs dans le manifeste. Le contrôle des roadmaps confirme que les liens disponibles existent, mais cela ne transforme pas les éléments planifiés en contenu utilisable. La couverture affichée dans le README pour le français et le russe ne correspond pas au statut `not_yet_available` de ces cours dans le manifeste.

`data/platform-stats.json` compte 1 289 fichiers de leçon sur disque, dont 796 sans référence depuis les roadmaps. Ce sont des candidats à une revue de rattachement ou d’archivage, pas des fichiers à supprimer automatiquement : certains peuvent être des sources, variantes ou contenus de migration.

### P2 — Les réponses et les parcours commerciaux restent locaux ou absents

Les réponses élève sont enregistrées dans `localStorage` ([student.html](../student.html#L1255-L1273)); elles ne constituent ni un progrès persistant côté serveur, ni un carnet de notes partagé entre enseignant et élève. La classe dispose bien de Jitsi et de synchronisation PeerJS, mais le schéma présent ne définit pas de calendrier de cours, de réservation, de disponibilité enseignante, de facturation ou de flux d’inscription. Ces capacités peuvent exister dans un système extérieur, mais elles ne sont pas implémentées dans ce dépôt.

### P2 — Les registres d’activités ne sont pas intégrés aux vues

`activities/games.json`, `tools.json` et `print.json` contiennent des entrées, mais aucune page ne les charge. Les fichiers PDF ciblés par `print.json` ne sont pas présents dans `activities/`. La migration map les décrit encore comme des tableaux vides, autre indice de documentation non maintenue.

### P3 — Documentation et métriques périmées

- `docs/architecture.md` et `docs/known-limitations.md` décrivent un ancien accès par `data/access-grants.json` et `shared/js/access-grants.js`; ces fichiers n’existent pas et l’application utilise Supabase Auth/RLS.
- `AUDIT.md` et `LINK_AUDIT_REPORT.md` annoncent 30 roadmaps, 494 leçons résolues et un manifeste de 175 cours / 120 actifs. L’état courant est 36, 495 et 182 / 11.
- Le README annonce 30 manifests et plusieurs niveaux actifs qui ne sont pas actifs dans le manifeste courant.
- `docs/CONTENT_MODEL.md` présente A0 comme un niveau CEFR alors que la règle canonique du dépôt indique qu’A0 n’est pas une valeur de données.

### P3 — Entretien, doublons et vulnérabilité de développement

- Les vérifications existantes ne trouvent pas de doublon de curriculum ou de roadmap, et une comparaison des 833 JSON de leçon ne trouve aucun doublon octet pour octet.
- Les 102 collisions d’ID sont des variantes multilingues, pas nécessairement du contenu dupliqué; c’est leur identité Supabase globale qui doit être clarifiée.
- `shared/vocab-resolver.js` et `shared/js/vocab-resolver.js` sont deux variantes proches; `vocab-resolver.js`, `manuals-resolver.js` et `tools-resolver.js` ne sont référencés par aucune page actuelle. À confirmer avant suppression : ils peuvent être des modules en attente de migration.
- `m11_15_vocab.log` est un petit log suivi à la racine, candidat évident au retrait après vérification de son origine.
- `npm audit` signale une vulnérabilité modérée dans `fast-uri` (dépendance de développement d’Ajv, versions 3.0.0–3.1.7; correction disponible). `npm audit --omit=dev` ne signale aucune vulnérabilité.

## Migration : état observé

**En place et validé :** curriculums JSON imbriqués et validés par schéma; manifestes de roadmap; génération des données CEFR; authentification et rôles Supabase; publication manuelle du contenu; salle de classe Jitsi/PeerJS.

**Explicitement incomplet :** 924 éléments de roadmap marqués `planned`; seulement 495 références de leçon actives; migration des anciens curriculums plats encore à réconcilier; références/manuels et activités à intégrer; modules de résolution préparés mais sans consommateur; contenu de sessions et de manuels stocké dans des tables sans flux UI associé.

**À décider avant nettoyage :** destin des 796 fichiers non liés aux roadmaps, portée des IDs de leçon, maintien ou retrait des modules inutilisés, et contenu qui doit réellement être public ou privé. Ne pas supprimer ces éléments par déduction automatique.

## Vérifications exécutées

| Commande | Résultat |
| --- | --- |
| `npm ci` | Réussi; 1 vulnérabilité modérée dans les dépendances de développement. |
| `npm run validate` | Réussi; contrôles de contenu, 118 curriculums, 833 leçons, stats, CEFR, contraste, tests founder/classroom et 15 scénarios smoke. |
| `npm run check:cefr` | Réussi séparément; données générées à jour. |
| `node scripts/test-roadmaps-jsdom.js` | Réussi; 36 roadmaps, 495 liens disponibles et 924 entrées prévues. |
| `node scripts/test-widgets-jsdom.js` | Réussi. |
| `node scripts/verify-acceptance.js` | Réussi. |
| `npm run check:links` | Échoué : 515 références non résolues; rapport régénéré. |
| `npm audit --omit=dev` | 0 vulnérabilité. |
| `npm audit` | 1 vulnérabilité modérée de développement (`fast-uri`). |

Les tests de pages utilisent JSDOM; aucun test navigateur réel contre le projet Supabase déployé, la production GitHub Pages ou les services Jitsi/PeerJS n’a été exécuté. La validation actuelle prouve surtout la cohérence structurelle, pas le fonctionnement bout en bout en production.

## Ordre de remédiation proposé

1. Retirer `lessons/` de l’artefact public et faire échouer proprement le chargement lorsqu’un contenu Supabase autorisé est absent; auditer aussi les fichiers déjà déployés.
2. Vérifier l’autorisation à chaque chargement de leçon et concevoir des politiques RLS alignées sur l’inscription réelle.
3. Réparer les 11 URL partagées et les 15 références vocabulaire; inclure `check:links` dans la CI avec une stratégie reproductible pour les index externes.
4. Décider si `session_content`, `manual_content` et `activities/` sont des migrations actives ou des pistes abandonnées; mettre à jour le schéma de référence et le processus de publication.
5. Rafraîchir README et rapports depuis les données actuelles; ajouter une validation des IDs et des fichiers de leçon non liés.
6. Ajouter des tests de navigateur pour connexion, contrôle d’accès direct, chargement de leçon et parcours enseignant-élève; planifier ensuite les fonctionnalités produit manquantes selon la portée attendue.
7. Mettre à jour Ajv/le verrouillage pour corriger `fast-uri`; supprimer seulement après revue les candidats au nettoyage listés plus haut.