Plan en cinq étapes de travail :

1. **Implémenter la grille et les données de pièces**  
   Créer `src/core/grid.js` pour la grille 10×20, les collisions, la fixation et la suppression des lignes. Compléter `piece.js` avec les couleurs des sept pièces.  
   **Tests :** limites, collisions, fixation, suppression de lignes et couleurs.

2. **Créer l’état central de la partie**  
   Créer `src/core/game.js`, sans DOM, pour gérer la pièce courante et la suivante, le générateur avec RNG injectable, les déplacements, la rotation, la chute, la fixation et le Game Over.  
   **Tests :** séquence reproductible, mouvements, chute, remplacement de pièce, blocage et Game Over.

3. **Rendre le jeu minimalement jouable**  
   Créer `index.html`, une première version de `styles.css`, `src/ui/renderer.js`, `src/ui/input.js` et `main.js`. Afficher la grille et la pièce courante ; gérer gauche, droite, rotation et descente.  
   **Test :** lancer le navigateur et jouer une partie minimale.

4. **Ajouter le score et les contrôles de partie**  
   Créer `src/core/scoring.js` pour les scores de 1 à 4 lignes, le niveau et la vitesse. Ajouter Start, Pause (bouton et touche P), Restart, ainsi que l’affichage du score, du niveau et des lignes.  
   **Tests :** calcul des scores, progression du niveau, vitesse et transitions Start/Pause/Restart ; vérification dans le navigateur.

5. **Finaliser l’affichage et les effets**  
   Ajouter l’affichage de la pièce suivante, le panneau latéral responsive et l’animation des lignes complètes dans `renderer.js` et `styles.css`. Finaliser le Game Over avec le score final.  
   **Validation :** suite Vitest complète puis parcours navigateur de bout en bout, de Start au Game Over.