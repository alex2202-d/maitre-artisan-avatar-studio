# Pipeline de production verrouillé — Avatar Studio 3D

## But
Garantir que le rendu final reste fidèle à la référence visuelle validée tout en restant entièrement configurable.

Le projet avance uniquement par gates. Une gate non validée bloque la suivante.

## Règle n°1 — La référence maître ne change pas en cours de route
La référence visuelle validée sert de cible officielle pour :
- proportions générales
- rapport tête/corps
- taille et placement des yeux
- longueur bras/jambes
- volume des mains/pieds
- silhouette
- matériaux
- niveau de stylisation
- lumière studio
- qualité perçue

Aucune variation de production n’est acceptée si elle dégrade cette cohérence.

## Règle n°2 — Le personnage n’est jamais monolithique
Le personnage final doit rester modulaire.

Slots obligatoires :
- morphology
- body
- head
- face
- eyes
- brows
- mouth/expression
- hair
- facial_hair
- top
- outerwear
- bottom
- shoes
- headwear
- gloves
- belt
- accessory_left
- accessory_right

Chaque slot doit pouvoir être remplacé indépendamment.

## Règle n°3 — Le vrai rendu premium vient des assets 3D
Le prototype procédural Three.js sert au moteur, aux interactions et aux tests.
Le rendu final doit venir de vrais meshes 3D exportés en GLB/GLTF.

Les primitives simples ne sont jamais considérées comme assets finaux.

---

# GATE A — Golden Character

## Livrable
Un seul personnage 3D premium, morphologie standard, sans vestiaire complet.

## Vues obligatoires
- face
- 3/4 droite
- profil droit
- dos
- 3/4 gauche
- rotation 360°

## Critères de validation
- silhouette immédiatement cohérente avec la référence maître
- tête nettement surdimensionnée
- membres courts et compacts
- mains/pieds simples et stylisés
- visage propre et lisible
- proportions stables sous tous les angles
- matériaux mats / semi-mats cohérents
- aucun détail réaliste qui casse la DA
- aucune ressemblance directe avec un personnage protégé précis

## Blocage
Aucun vêtement final n’est produit avant validation explicite du Golden Character.

---

# GATE B — Topologie et séparation

## Livrable
Golden Character proprement découpé en composants.

## Contrôles
- tête séparée du corps
- yeux indépendants
- bouche/expression indépendante
- cheveux indépendants
- mains et pieds correctement intégrés au rig
- body mesh propre sous les vêtements
- zones cachables définies pour éviter le clipping

## Validation
Chaque pièce doit être remplaçable sans casser la silhouette globale.

---

# GATE C — Rig maître

## Livrable
Un seul rig partagé pour tout le système.

Bones minimum :
- root
- pelvis
- spine
- chest
- neck
- head
- upper_arm_L / lower_arm_L / hand_L
- upper_arm_R / lower_arm_R / hand_R
- upper_leg_L / lower_leg_L / foot_L
- upper_leg_R / lower_leg_R / foot_R

## Tests
- pose neutre
- bras levés
- bras croisés approximés
- marche simple
- rotation du buste
- rotation de tête

## Validation
Aucune pièce ne flotte ni ne décroche pendant les poses.

---

# GATE D — Morphologies

## Morphologies prévues
- svelte
- standard
- robuste
- XL

## Méthode
Pas de simple scale global.
Chaque morphologie utilise une silhouette cohérente avec la même DA et le même rig logique.

## Validation
Pour chaque morphologie :
- face/profil/dos cohérents
- vêtements de référence compatibles
- mains/pieds/tête restent stylistiquement cohérents

---

# GATE E — Visage et identité

## Minimum avant passage
- 3 têtes
- 3 jeux d’yeux
- 3 sourcils
- 5 expressions
- 4 coiffures
- barbe/moustache optionnelles

## Validation
- couvre-chefs compatibles
- aucun cheveu traverse casque/bonnet
- expressions lisibles sans déformer la DA
- teinte de peau indépendante du reste

---

# GATE F — Vestiaire étalon

## Pack minimum
- 3 hauts
- 1 veste/surcouche
- 2 pantalons
- 2 chaussures
- 1 bonnet
- 1 casque de chantier
- 1 ceinture à outils
- 1 accessoire métier

## Validation
Chaque pièce doit fonctionner avec les morphologies validées.

Pour chaque tenue de référence :
- face
- profil
- dos
- rotation 360°
- bras levés
- marche simple

## Refus automatique
- clipping important
- trous visibles
- pièce flottante
- vêtement qui déforme la silhouette de façon incohérente
- couleur impossible à modifier alors qu’elle doit l’être

---

# GATE G — Contrat de configuration

## Principe
La sauvegarde référence uniquement des ids et couleurs.

Exemple :
```json
{
  "version": 1,
  "morphology": "standard",
  "head": "head-01",
  "eyes": "eyes-02",
  "expression": "neutral",
  "hair": "hair-03",
  "top": "work-jacket-01",
  "bottom": "work-pants-01",
  "shoes": "safety-boots-01",
  "headwear": "hardhat-01",
  "belt": "toolbelt-01",
  "colors": {
    "skin": "#D7A06F",
    "top": "#243046",
    "bottom": "#26303A",
    "headwear": "#F4B72A"
  }
}
```

## Validation
- save
- reload
- export JSON
- import JSON
- migration de version
- reprise exacte après rafraîchissement

---

# GATE H — QA combinatoire

## Matrice de test
Avant validation d’un pack, tester au minimum :
- chaque couvre-chef avec chaque coiffure compatible
- chaque haut avec chaque morphologie
- chaque pantalon avec chaque chaussure
- chaque expression avec chaque tête compatible
- chaque couleur sur matériaux recolorables

## Contrôles visuels
- face
- dos
- profil gauche
- profil droit
- 3/4
- vue haute légère
- 360°

Aucune combinaison critique ne peut rester non testée.

---

# GATE I — Performance mobile

## Cibles
- chargement progressif des assets
- compression GLB/GLTF
- textures limitées et optimisées
- DPR borné
- 30 fps stable minimum sur appareil milieu de gamme
- objectif 60 fps
- navigation tactile fluide

## Validation
Le studio ne passe pas à l’intégration V2 si le comportement mobile est instable.

---

# GATE J — UX finale

La maquette validée sert de référence UX :
- navigation catégories
- personnage central
- panneau d’options
- miniatures
- palettes
- rotation
- zoom
- plein écran
- randomisation
- sauvegarde
- export

La qualité UI ne doit pas masquer des problèmes 3D : les assets sont validés séparément.

---

# GATE K — Intégration dans Maître Artisan V2

Seulement après validation du studio autonome.

Livrables :
- avatar-core
- catalogue d’assets
- schéma JSON versionné
- viewer réutilisable
- API simple de lecture/écriture de config
- aucune dépendance aux écrans du studio autonome

---

# Définition de terminé
Une étape n’est marquée terminée que si :
1. le livrable existe réellement ;
2. il fonctionne ;
3. il est testé ;
4. son rendu est validé ;
5. le build passe ;
6. aucun défaut critique connu n’est reporté à l’étape suivante.

# Principe anti-échec
On ne compense jamais un mauvais asset par du code ou du CSS.
On ne compense jamais une mauvaise architecture par un beau rendu.
Les deux doivent être validés séparément avant industrialisation.
