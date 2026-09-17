# Maître Artisan — Avatar Studio 3D

Studio indépendant de création d’avatars 3D pour Maître Artisan V2.

Objectif : construire et valider à 100 % un vestiaire 3D modulaire, mobile-first et réutilisable dans l’application principale, sans modifier `maitre-artisan-v2` tant que le studio n’est pas validé.

## Principes

- direction artistique cartoon 3D originale, compacte et lisible ;
- aucun personnage ou costume copié d’une licence existante ;
- avatar 3D rotatif à 360° ;
- pièces interchangeables : corps, peau, cheveux, hauts, pantalons, chaussures et accessoires ;
- couleurs paramétrables ;
- état de l’avatar sérialisable en JSON ;
- sauvegarde locale ;
- architecture prévue pour une intégration ultérieure dans Maître Artisan V2.

## Stack

- React
- TypeScript
- Vite
- Three.js
- React Three Fiber
- Drei

## Première étape

Construire le personnage étalon technique avec :

- 1 morphologie ;
- 1 tête ;
- 1 visage ;
- 1 coiffure ;
- 3 hauts ;
- 1 pantalon ;
- 1 paire de chaussures ;
- 1 bonnet ;
- rotation 360° ;
- changement de couleurs ;
- sauvegarde/restauration de la configuration.
