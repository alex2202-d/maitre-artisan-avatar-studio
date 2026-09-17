# Maître Artisan Avatar Studio — plan de construction verrouillé

## Objectif
Construire un vestiaire 3D premium autonome, mobile-first, avec une direction artistique cartoon 3D compacte et originale, puis l’intégrer à Maître Artisan V2 uniquement lorsqu’il est validé à 100 %.

Le système ne doit jamais dépendre d’un personnage monolithique impossible à personnaliser.

## Règle d’architecture non négociable
Le personnage est un système modulaire à slots, pas un GLB unique figé.

Slots prévus :
- corps / silhouette
- morphologie
- tête
- visage
- yeux
- sourcils
- bouche / expression
- cheveux
- barbe / moustache
- haut
- veste / surcouche
- pantalon
- chaussures
- couvre-chef
- accessoire gauche
- accessoire droit

Chaque slot est remplaçable indépendamment et possède un identifiant stable. La configuration finale est sérialisable en JSON.

## Squelette / animation
Le personnage utilise un rig cartoon simple partagé par toutes les variantes :
- root
- pelvis
- torso
- head
- arm_L / hand_L
- arm_R / hand_R
- leg_L / foot_L
- leg_R / foot_R

Les pièces de vêtements et accessoires utilisent les mêmes points d’ancrage. Les éléments rigides sont parentés aux bones ; les éléments nécessitant une déformation utilisent le même rig.

Aucun vêtement ne sera accepté s’il ne suit pas correctement le personnage lors des rotations et des poses de test.

## Morphologies
La première famille prévoit 4 morphologies :
- svelte
- standard
- robuste
- XL

Chaque morphologie possède des dimensions de référence. Les vêtements déclarent les morphologies compatibles et peuvent charger une variante de mesh adaptée si nécessaire.

On ne fera pas de simple scale global du personnage pour simuler les morphologies.

## Matériaux et couleurs
La couleur est séparée du mesh chaque fois que possible.

Canaux minimum :
- peau
- cheveux
- haut
- veste
- pantalon
- chaussures
- couvre-chef
- accent

Les vêtements peuvent déclarer des zones recolorables distinctes (principal / secondaire / métal / cuir).

## Contrat d’asset
Tout nouvel asset doit fournir :
- id stable
- nom d’affichage
- catégorie / slot
- chemin GLB/GLTF
- morphologies compatibles
- points d’ancrage utilisés
- matériaux recolorables
- miniature
- poids fichier
- statut QA

Un asset sans métadonnées n’entre pas dans le catalogue.

## Sauvegarde et portabilité
La sauvegarde ne stocke jamais des coordonnées 3D arbitraires. Elle stocke uniquement des identifiants de slots, couleurs et options.

Exemple :
```json
{
  "version": 1,
  "bodyType": "masculine",
  "morphology": "standard",
  "head": "head-01",
  "face": "face-01",
  "eyes": "eyes-01",
  "hair": "hair-03",
  "top": "work-jacket-01",
  "bottom": "work-pants-01",
  "shoes": "safety-boots-01",
  "headwear": "hardhat-01",
  "colors": {
    "skin": "#D7A06F",
    "top": "#243046",
    "bottom": "#26303A",
    "headwear": "#F4B72A"
  }
}
```

Le champ `version` permet de migrer les anciennes sauvegardes lorsque le catalogue évolue.

## Ordre de construction — interdit de sauter une étape

### GATE 0 — Direction artistique
- personnage concept validé
- proportions validées
- matériaux / lumière validés
- style suffisamment original pour ne pas reproduire un personnage protégé

### GATE 1 — Contrat technique
- schéma JSON définitif v1
- slots définitifs
- catalogue d’assets
- règles de compatibilité
- système de migration des sauvegardes

### GATE 2 — Rig et mannequin étalon
- rig partagé
- points d’ancrage
- rotation 360°
- zoom tactile / souris
- pose neutre
- pose de contrôle bras/jambes

### GATE 3 — Corps
- 1 silhouette homme
- 1 silhouette femme prévue dans la même architecture
- 4 morphologies
- 5 teintes minimum
- aucun clipping majeur

### GATE 4 — Visage
- têtes interchangeables
- yeux interchangeables
- sourcils
- bouches / expressions
- cheveux
- barbe / moustache
- compatibilité couvre-chefs

### GATE 5 — Vestiaire étalon
Avant de créer un grand catalogue :
- 3 hauts
- 1 veste
- 2 pantalons
- 2 chaussures
- 1 bonnet
- 1 casque de chantier
- 1 accessoire

Tous doivent fonctionner sur les morphologies retenues.

### GATE 6 — Moteur de configuration
- changement instantané des pièces
- couleurs
- aléatoire
- reset
- sauvegarde locale
- export/import JSON
- reprise exacte de l’avatar après rechargement

### GATE 7 — QA 3D
Tests obligatoires pour chaque combinaison de référence :
- face
- dos
- profil gauche
- profil droit
- vue haute légère
- rotation 360°
- morphologies
- couvre-chefs + cheveux
- hauts + vestes
- pantalons + chaussures

Aucun asset n’est marqué `ready` avec intersection visible importante, pièce flottante ou trou dans le corps.

### GATE 8 — Mobile / performance
- tactile fluide
- interface portrait et paysage
- DPR limité intelligemment
- chargement progressif
- assets compressés
- test appareil milieu de gamme
- objectif 60 fps ; seuil de validation minimal stable défini par test réel

### GATE 9 — UX finale
Reproduire la maquette validée :
- navigation gauche / mobile équivalente
- personnage central
- panneau d’options
- miniatures
- palettes
- sauvegarde
- export
- plein écran
- rotation / zoom

### GATE 10 — Intégration V2
Seulement après validation du studio autonome :
- paquet avatar-core isolé
- catalogue exportable
- config JSON versionnée
- intégration dans Maître Artisan V2
- aucun couplage aux écrans internes du studio

## Définition de “100 % validé”
Une gate n’est fermée que si :
1. le code compile ;
2. la CI passe ;
3. le test visuel est fait ;
4. le test mobile est fait si pertinent ;
5. aucune régression connue n’est laissée volontairement ;
6. l’utilisateur valide le rendu lorsqu’il s’agit d’une étape visuelle.

On ne produit pas des dizaines d’assets tant que le personnage étalon et le moteur de slots ne sont pas validés.
