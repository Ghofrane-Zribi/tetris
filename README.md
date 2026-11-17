# Tetris

Jeu de Tetris en JavaScript moderne, utilisant les modules ES, HTML5 Canvas et
Vitest pour les tests. Le cœur du jeu est séparé de l’interface : la logique
des grilles, des pièces, du score, des parties et des IA se trouve dans
`src/core/`, tandis que le rendu et les contrôles se trouvent dans `src/ui/`.

## Installation

```bash
npm install
```

Le projet nécessite un navigateur moderne compatible avec les modules ES et
`requestAnimationFrame`, ainsi que Node.js pour lancer les tests et la
simulation.

## Lancement

Le projet ne contient pas de serveur de développement intégré. Depuis la
racine du projet, lancez un serveur statique, par exemple :

```bash
python -m http.server 8000
```

Puis ouvrez <http://localhost:8000/> dans un navigateur.

Il est également possible d’utiliser l’extension Live Server de VS Code.

## Tests et simulation

Lancer les tests :

```bash
npm test
```

Produire le rapport de couverture :

```bash
npm run coverage
```

Simuler 20 parties expertes avec une graine fixe et comparer les pondérations :

```bash
node scripts/simulate.js
```

## Modes de jeu

L’écran de démarrage propose :

- **Solo** : une partie humaine classique ;
- **VS 1** : un joueur humain contre une IA ;
- **VS 2** : un joueur humain contre deux IA ;
- **VS 3** : un joueur humain contre trois IA.

Les grilles sont affichées avec le pseudo, le score, le niveau, le nombre de
lignes et l’état de chaque joueur. Le joueur humain est le seul à utiliser le
clavier. En mode VS, les IA jouent automatiquement et le dernier joueur encore
en vie gagne.

## Commandes

| Touche ou bouton | Action |
| --- | --- |
| `←` | Déplacer la pièce vers la gauche |
| `→` | Déplacer la pièce vers la droite |
| `↑` | Tourner la pièce dans le sens horaire |
| `↓` | Faire descendre la pièce d’une ligne |
| `P` | Mettre en pause ou reprendre |
| **Start** | Démarrer ou reprendre la partie |
| **Pause** | Mettre la partie en pause |
| **Restart** | Réinitialiser la partie |

## Règles

- La grille mesure 10 colonnes sur 20 lignes.
- Les sept tétriminos classiques sont disponibles : I, O, T, S, Z, J et L.
- Une pièce est fixée lorsqu’elle ne peut plus descendre.
- Une ligne complète est supprimée et les lignes restantes descendent.
- Le score dépend du nombre de lignes supprimées :
  - 1 ligne : 100 points ;
  - 2 lignes : 300 points ;
  - 3 lignes : 500 points ;
  - 4 lignes : 800 points.
- Le score est multiplié par le niveau.
- Le niveau augmente toutes les 10 lignes supprimées.
- La vitesse de chute commence à 700 ms, diminue de 60 ms par niveau et ne
  descend pas sous 100 ms.
- La partie se termine lorsqu’une nouvelle pièce ne peut pas apparaître.

## Les trois IA

Chaque adversaire reçoit un niveau et un délai d’action affiché sous son
pseudo.

### Débutant

L’IA débutante choisit aléatoirement parmi les placements valides de la pièce
courante. Son délai d’action est de **300 ms**.

### Intermédiaire

L’IA intermédiaire simule tous les placements possibles sur des copies de la
grille. Elle compare la hauteur moyenne, les trous, les lignes complétées et
l’irrégularité de la surface. Son délai d’action est de **200 ms**.

### Expert

L’IA experte évalue les placements avec la formule :

```text
-0.51 * hauteur agrégée
+0.76 * lignes complétées
-0.36 * trous
-0.18 * irrégularité
```

Elle anticipe également la meilleure décision possible pour la pièce suivante.
Son délai d’action est de **100 ms**. Les pondérations sont exposées par
`EXPERT_WEIGHTS` afin de permettre les simulations comparatives.

