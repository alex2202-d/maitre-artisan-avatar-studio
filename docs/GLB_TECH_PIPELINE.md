# Pipeline technique GLB — Maître Artisan Avatar Studio

## Source officielle
Le fichier Meshy haute qualité validé reste le **MASTER VISUEL**. Il ne doit jamais être écrasé ni remplacé par une version optimisée.

## Objectif
Créer une copie technique exploitable pour le vestiaire sans perdre la silhouette ni la direction artistique du master.

## Ordre obligatoire

### T1 — Smart Topology 3D→3D
Outil Fal : `fal-ai/hunyuan-3d/v3.1/smart-topology`

Entrée : GLB master haute qualité.

Réglages de premier essai :
- input_file_type: `glb`
- polygon_type: `quadrilateral`
- face_level: `high`

But : améliorer la topologie sans régénérer le personnage depuis une image.

Critères de validation :
- silhouette conservée
- proportions tête/corps conservées
- aucun défaut nouveau visible
- texture encore exploitable
- topologie sensiblement plus propre

Si le rendu visuel régresse, ne pas remplacer le master et ne pas poursuivre avec ce résultat.

### T2 — Segmentation sémantique
Outil Fal : `tripo3d/tripo/segment`

Entrée : copie technique validée après T1 (ou master si T1 est rejeté).

But : tenter de séparer automatiquement les grandes parties sémantiques du modèle pour préparer les slots du vestiaire.

Parties recherchées en priorité :
- peau/corps
- haut
- bas
- tête
- pieds

La segmentation est acceptée uniquement si elle ne détériore pas le modèle.

### T3 — Rigging humanoïde
Outil Fal : `fal-ai/meshy/rigging`

Entrée : meilleure copie technique conservant la qualité visuelle.

Réglages :
- height_meters: `1.1`
- enable_animation: `false`
- enable_safety_checker: `true`

Coût actuel vérifié : environ `$0.80` par génération de rigging.

Critères de validation :
- squelette reconnu correctement
- tête, bras et jambes suivent le rig
- aucune déformation critique en pose simple
- GLB riggé réutilisable dans React Three Fiber

### T4 — Visage modulaire
Le visage reste hors du mesh de base.

Slots séparés :
- `face_eyes_01`
- `face_brows_01`
- `face_mouth_01`

Les expressions sont obtenues par remplacement/variation de ces slots, pas par régénération du corps.

### T5 — Vestiaire étalon
Ne produire les vêtements qu'après validation du rig et des slots.

Ordre :
1. casque chantier
2. veste chantier
3. pantalon travail
4. chaussures sécurité
5. bonnet
6. coiffure courte
7. ceinture outils

## Budget
Budget utilisateur maximal : **50 €**.

Règles :
- une seule génération/test à la fois ;
- audit avant chaque nouvel essai payant ;
- aucune régénération payante de variantes de couleur ;
- conserver une marge pour les retakes réellement nécessaires.

## Règle de sécurité projet
Toujours conserver :
- `MASTER_VISUEL` : modèle Meshy haute qualité intact ;
- `WORKING_TECH` : copie retopologisée/segmentée/riggée ;
- les vêtements/accessoires comme assets indépendants.
