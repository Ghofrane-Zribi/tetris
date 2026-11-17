## Plan en 5 étapes

### 1. Créer `GameInstance` et préserver le mode solo

Créer `src/core/gameInstance.js` pour représenter une partie :

- grille ;
- pièce courante et suivante ;
- score, lignes, niveau ;
- état de la partie ;
- pseudo ;
- méthodes de déplacement, rotation, chute, pause et restart.

Adapter `game.js` afin que `createGame()` reste compatible avec le mode solo actuel.

**Validation :**

```bash
npm test
```

Le mode solo doit conserver exactement son comportement et ses contrôles.

---

### 2. Créer `GameManager` et ses tests

Créer `src/core/gameManager.js` pour gérer plusieurs `GameInstance` :

- création de 1 à 4 parties ;
- conservation des pseudos ;
- identification du joueur humain ;
- adversaires IA présents mais inactifs ;
- état global de la partie ;
- désignation du gagnant ;
- réinitialisation de toutes les parties.

Créer précisément :

```text
tests/gameManager.test.js
```

Tests obligatoires :

- création d’une partie solo ;
- création de quatre parties ;
- désignation du gagnant ;
- réinitialisation.

Le manager ne doit pas faire jouer les adversaires à ce stade.

**Validation :**

```bash
npm test
```

---

### 3. Ajouter l’écran de choix du mode

Modifier `index.html` et `main.js` pour proposer :

- Solo ;
- VS 1 adversaire ;
- VS 2 adversaires ;
- VS 3 adversaires ;
- saisie du pseudo humain ;
- bouton de lancement.

Le choix doit créer le nombre approprié d’instances dans `GameManager`.

Les adversaires doivent uniquement afficher leur grille initiale, sans chute, déplacement ni score évolutif.

**Validation :**

```bash
npm test
```

---

### 4. Afficher les grilles côte à côte

Adapter `renderer.js` et `styles.css` pour afficher :

- le plateau humain ;
- les plateaux des adversaires ;
- le pseudo ;
- le score ;
- le niveau ;
- l’état de chaque partie ;
- la pièce suivante du joueur humain.

Disposition :

- Solo : une grille ;
- 2 joueurs : deux grilles côte à côte ;
- 3 ou 4 joueurs : disposition 2×2 ;
- mobile : disposition verticale.

Les touches actuelles restent exclusivement associées au joueur humain.

**Validation :**

```bash
npm test
```

---

### 5. Relier la boucle de jeu et finaliser le gagnant

Adapter `main.js` et `input.js` pour :

- envoyer les touches uniquement à la partie humaine ;
- faire avancer uniquement `GameInstance` humaine ;
- laisser les adversaires inactifs ;
- détecter le Game Over humain ;
- afficher le gagnant selon le manager ;
- afficher le classement final préparant le futur comportement des IA ;
- conserver Start, Pause et Restart.

Les IA ne seront implémentées qu’à l’exercice suivant.

**Validation finale :**

```bash
npm test
```

Puis vérification navigateur des quatre modes, sans modifier le comportement du mode solo.