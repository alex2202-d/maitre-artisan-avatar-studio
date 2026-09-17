# Premier pack vestiaire — Maître Artisan Avatar Studio

Base officielle de travail : `Meshy_AI_Orange_Toy_Figure_0917125408_texture(1).glb`.

Le GLB est la référence visuelle maître. Toute version technique ou tout nouvel asset doit conserver sa silhouette générale et sa direction artistique.

## Règle de production

On ne régénère plus le corps de base aujourd'hui. Les dépenses Meshy/Fal sont réservées aux assets qui apportent une vraie valeur au vestiaire. Les recolorations, teintes de peau et variantes simples ne doivent pas consommer de génération payante.

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
Valider `face_eyes_01`, `face_brows_01` et `face_mouth_01` sur la tête lisse avant tout autre détail du visage.

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
Produire veste, pantalon et chaussures.

Critères :
- éléments séparés ;
- silhouette fidèle au master ;
- aucune dépendance à une texture couleur unique ;
- compatibilité avec le rig technique retenu.

### Gate 4 — Variantes
Ajouter coiffure, bonnet et ceinture outils seulement après validation de la tenue chantier.

## Ce qui doit rester séparé

Toujours séparés : visage, cheveux, haut, bas, chaussures, couvre-chef, accessoires.

Le corps de base peut rester monobloc dans le master visuel. La copie technique devra être optimisée et riggée avant animation et industrialisation du catalogue.

## Budget

Budget global utilisateur : 50 € maximum.

Règle : ne jamais lancer plusieurs générations payantes d'un même asset sans avoir audité la précédente. Les variantes de couleur et matières simples doivent être réalisées côté moteur 3D et non régénérées.
