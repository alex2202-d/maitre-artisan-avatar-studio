# Premier pack vestiaire — Maître Artisan Avatar Studio

Base visuelle maître : `Meshy_AI_Orange_Toy_Figure_0917125408_texture(1).glb`.

Base technique optimisée : `model.glb`.

Base riggée V1 : `rigged_character.glb`.

Le master visuel reste la référence de silhouette et de direction artistique. La base riggée V1 est la fondation technique du vestiaire.

## Règles de production — VERROUILLÉES

Ces règles priment sur toute suggestion ultérieure tant que l'utilisateur ne demande pas explicitement de les modifier.

- **Un seul asset à la fois.** Une génération Meshy/Fal ne doit produire qu'un asset nommé et identifié.
- **Aucun mockup de pack.** Ne jamais générer une planche regroupant yeux, sourcils, bouches, vêtements ou accessoires, sauf demande explicite de l'utilisateur.
- **Une référence 2D = un seul asset isolé.** Si une image 2D est créée pour Image-to-3D, elle doit représenter uniquement l'asset en cours, sans texte, sans grille, sans autres variantes et sans décor.
- **Validation avant la suite.** On ne passe pas à l'asset suivant tant que l'asset courant n'a pas été contrôlé et validé.
- **Pas de régénération du corps validé.** Le corps/master et la base riggée ne sont plus régénérés sauf défaut technique démontré ou décision explicite de l'utilisateur.
- **Pas de dépense inutile.** Aucun nouvel essai payant du même asset avant analyse du résultat précédent.
- **Variantes simples côté moteur.** Couleurs, teintes et matières simples doivent être paramétrées dans l'application plutôt que régénérées.
- **Prompts limités à l'étape courante.** Quand un prompt est fourni, il concerne uniquement l'asset en production et aucun autre élément du pack.
- **Modularité obligatoire.** Aucun nouvel élément de visage, cheveux, vêtement ou accessoire ne doit être fusionné définitivement au corps de base.

## Pack V1 — 10 assets prioritaires

1. `face_eyes_01` — paire d'yeux séparée, compatible tête lisse.
2. `face_brows_01` — paire de sourcils séparée.
3. `face_mouth_01` — bouche neutre/souriante de base.
4. `hair_short_01` — coiffure courte simple.
5. `top_work_jacket_01` — veste chantier premium.
6. `bottom_work_pants_01` — pantalon de travail.
7. `shoes_safety_01` — chaussures de sécurité.
8. `headwear_hardhat_01` — casque de chantier.
9. `headwear_beanie_01` — bonnet simple.
10. `accessory_toolbelt_01` — ceinture porte-outils.

## Ordre strict

### Gate 1 — Visage modulaire

Valider `face_eyes_01`, puis `face_brows_01`, puis `face_mouth_01` sur la tête lisse.

Critères :
- aucun élément fusionné au corps ;
- placement stable en rotation 360° ;
- possibilité de masquer/remplacer chaque élément ;
- rendu cohérent avec la référence maître.

### Gate 2 — Casque

Produire `headwear_hardhat_01` et valider l'ancrage tête/casque.

Critères :
- pas de clipping majeur ;
- compatible tête nue et future coiffure ;
- taille et silhouette cohérentes avec la DA.

### Gate 3 — Tenue chantier

Produire séparément veste, pantalon et chaussures, avec validation entre chaque asset.

Critères :
- éléments séparés ;
- silhouette fidèle au master ;
- aucune dépendance à une texture couleur unique ;
- compatibilité avec le rig technique retenu.

### Gate 4 — Variantes

Ajouter coiffure, bonnet et ceinture outils seulement après validation de la tenue chantier.

## Ce qui doit rester séparé

Toujours séparés : visage, cheveux, haut, bas, chaussures, couvre-chef, accessoires.

Le master visuel peut rester monobloc. La base technique riggée sert de fondation commune aux futurs assets.

## Budget

Budget global utilisateur : 50 € maximum.

Ne jamais lancer plusieurs générations payantes d'un même asset sans avoir audité la précédente.
