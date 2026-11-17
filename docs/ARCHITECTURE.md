# Architecture

## Organisation

Le projet est organisé en trois zones :

- `src/core/` contient la logique pure du jeu, sans DOM ni Canvas ;
- `src/ui/` contient le rendu Canvas et la gestion du clavier ;
- `main.js` assemble le cœur et l’interface, gère l’écran de mode et la boucle
  `requestAnimationFrame`.

Les tests Vitest utilisent directement les modules du cœur. Le script
`scripts/simulate.js` exécute des parties sans affichage afin de comparer les
comportements des IA.

## Diagramme de classes

```mermaid
classDiagram
    class GameInstance {
        -state
        -rng
        +constructor(options)
        +getState()
        +moveLeft() boolean
        +moveRight() boolean
        +rotate() boolean
        +drop() boolean
        +hardDrop() boolean
        +start() boolean
        +pause() boolean
        +restart() boolean
    }

    class GameManager {
        -instances
        -aiPlayers
        -status
        +constructor(options)
        +getInstance(index) GameInstance
        +getState() Object
        +getWinner() Object
        +getPodium() Array
        +start() boolean
        +pause() boolean
        +restart() boolean
        +tick(deltaTime) boolean
        +moveLeft() boolean
        +moveRight() boolean
        +rotate() boolean
        +drop() boolean
        +hardDrop() boolean
    }

    class AIPlayer {
        +level
        +rng
        +constructor(options)
        +decide(grid, piece, next) Object
    }

    class Grid {
        <<module>>
        +createGrid(width, height)
        +isValidPosition(grid, matrix, row, column)
        +lockPiece(grid, matrix, row, column, color)
        +clearCompletedLines(grid)
    }

    class Piece {
        <<module>>
        +PIECES
        +PIECE_COLORS
        +rotate(matrix)
    }

    class Scoring {
        <<module>>
        +calculateScore(clearedLines, level)
        +getLevel(lines)
        +getDropInterval(level)
    }

    class Renderer {
        <<module>>
        +createRenderer(canvas, previewCanvas)
        +renderPlayerInfo(container, state)
    }

    class Input {
        <<module>>
        +bindInput(element, game, render)
    }

    GameManager "1" o-- "1..4" GameInstance : coordonne
    GameManager "0" o-- "0..3" AIPlayer : utilise
    GameInstance ..> Grid : grille et collisions
    GameInstance ..> Piece : pièces et rotations
    GameInstance ..> Scoring : score et vitesse
    AIPlayer ..> Grid : simule les placements
    AIPlayer ..> Piece : génère les rotations
    Renderer ..> GameManager : lit l’état
    Input ..> GameManager : envoie les commandes
```

`GameInstance` est responsable d’une seule partie : grille, pièce courante,
pièce suivante, score, niveau et état. `GameManager` regroupe le joueur humain
et jusqu’à trois adversaires IA. `GameManager` expose les mêmes commandes que
la partie humaine et distribue les actions aux instances concernées.

Les modules `Grid`, `Piece` et `Scoring` sont des modules de fonctions pures ou
de constantes. Ils ne connaissent ni le DOM ni l’interface graphique.

## Diagramme de séquence : un tour de jeu

Le cycle ci-dessous décrit une frame de la boucle de jeu. Le joueur humain
peut agir par le clavier ; les IA sont avancées par `tick` lorsqu’un délai
correspondant à leur niveau est écoulé.

```mermaid
sequenceDiagram
    actor Joueur
    participant Input as src/ui/input.js
    participant Main as main.js
    participant Manager as GameManager
    participant AI as AIPlayer
    participant Game as GameInstance
    participant Core as grid/piece/scoring
    participant Renderer as src/ui/renderer.js

    Joueur->>Input: Flèche, P ou bouton
    Input->>Manager: move / rotate / drop / pause
    Manager->>Game: applique l’action humaine
    Game->>Core: vérifie collision ou fixe la pièce
    Core-->>Game: nouvel état, lignes et score
    Game-->>Manager: résultat de l’action

    Main->>Manager: tick(deltaTime)
    Manager->>Manager: vérifie le délai de chaque IA
    alt Une IA doit jouer
        Manager->>AI: decide(grid, current, next)
        AI->>Core: simule les placements sur des copies
        Core-->>AI: candidats évalués
        AI-->>Manager: rotation et colonne
        alt Rotation restante
            Manager->>Game: rotate()
        else Déplacement horizontal nécessaire
            Manager->>Game: moveLeft() ou moveRight()
        else Colonne atteinte
            Manager->>Game: drop()
        end
        Game->>Core: collision, fixation et suppression éventuelle
        Core-->>Game: état IA mis à jour
    else Aucun délai écoulé
        Manager-->>Main: aucune action IA
    end

    Main->>Manager: getState()
    Manager-->>Renderer: état humain et adversaires
    Renderer-->>Joueur: Canvas, score, niveau et statut
```

Une décision IA n’altère jamais directement la grille : elle est d’abord
calculée par simulation, puis exécutée progressivement avec les méthodes
publiques de `GameInstance`. Le rendu reste donc indépendant de la logique de
simulation et le mode Solo conserve le même chemin d’exécution pour le joueur
humain.

