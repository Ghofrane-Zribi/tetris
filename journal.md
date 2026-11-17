## Exercice 1

### Requête 1 – Etape 3
- Prompt : « lève une erreur si la matrice n'est pas carrée »
- Produit : un `if` avec `throw new Error` au début de `rotate`
- Gardé / annulé : gardé
- Itérations : 1
### Requête 2 – Etape 4
- Prompt : « #file:src/core/piece.js quelle convention d'orientation utilisent ces matrices, et quelle forme est incorrecte ? »
- Produit : convention correcte (lignes haut→bas, 1 = case occupée, rotation horaire). Pour la forme incorrecte, il donne un exemple de matrice non carrée inventé, qui n'est pas dans le fichier, et dit que les 7 tétrominos sont carrés.
- Gardé / annulé : rien à garder (Ask ne modifie pas)
- Itérations : 1
### Requête 3 – Etape 5
- Prompt : «  initialise npm et installe vitest en dépendance de développement »
- Produit : L’installation a marché : Vitest est bien dans devDependencies.
- Gardé / annulé : commande exécutée ; dans package.json, j'ai remplacé "type": "commonjs" par "module" et le script test par "vitest run"
- Itérations : 1
### Requête 4 – Etape 6
- Prompt : « crée tests/piece.test.js avec trois tests de rotate (matrice 2x2, matrice 3x3, matrice non carrée qui doit lever une erreur), puis lance les tests »
- Fichiers créés : tests/piece.test.js (1 fichier, +34 lignes) ; piece.js non modifié
- Commande exécutée : (npm test / npx vitest run), lancée après mon accord (Allow)
- Sortie : 3 tests réussis ; l'agent a lu le résultat et a confirmé que tout passait
- Correction : aucune
- Gardé / annulé : gardé
- Itérations : 1
### Requête 5 – Etape 7
- Prompt : « renomme rotate en tourner dans tout le projet »
- Produit : renommage dans src/core/piece.js et tests/piece.test.js (2 fichiers, +6 −6), puis l'agent a relancé npm test lui-même : 3 tests réussis
- Gardé / annulé : annulé avec Restore checkpoint
- Itérations : 1

## Exercice 2

### Requête 1 - question 1
- Prompt : « #file:docs/SPEC.md #codebase propose un plan de réalisation en cinq étapes testables, en réutilisant src/core/piece.js »
- Produit : un plan en 5 étapes, mais rien n'était visible avant l'étape 5, l'étape 1 était déjà faite, game.js n'était jamais créé, et il manquait les couleurs, l'animation, index.html, styles.css et input.js.

- Itération 2 – Prompt : « Corrige le plan :
  - rien n'est visible avant l'étape 5 : il faut un affichage jouable minimal à l'étape 3 pour tester dans le navigateur après chaque étape ;
  - l'étape 1 est déjà faite (rotate et ses tests existent) ;
  - aucune étape ne crée game.js ;
  - il manque les couleurs des pièces, l'animation des lignes, index.html, styles.css et src/ui/input.js.
  Garde cinq étapes testables. »
- Produit : affichage jouable avancé à l'étape 3, mais Copilot a compris ma remarque à l'envers (« Aucun game.js ne sera créé »), alors que la SPEC l'impose. L'étape 1 ne faisait rien et l'étape 4 regroupait trop de choses.

- Itération 3 – Prompt : « Non : la spécification impose src/core/game.js. Ma remarque voulait dire qu'il manquait une étape qui le crée. game.js gère l'état de la partie sans DOM et doit être testé. Supprime l'étape 1 « valider l'existant ». L'étape 4 est trop grosse : répartis-la. Garde cinq étapes testables, avec l'affichage jouable à l'étape 3. »
- Produit : plan correct en 5 étapes (grille et pièces / game.js / affichage jouable / score et contrôles / finitions).
- Corrigé à la main : ajout de la touche P pour la pause à l'étape 4.
- Gardé : plan sauvegardé dans docs/PLAN.md
- Itérations : 3
### Requête 2 – Agent, étape 1 du plan
- Prompt : « réalise l'étape 1 de #file:docs/PLAN.md »
- Fichiers créés / modifiés :
  - src/core/grid.js (créé) : grille 10x20, collisions, fixation d'une pièce, suppression des lignes complètes
  - src/core/piece.js (modifié) : ajout de PIECE_COLORS (couleurs standard des 7 pièces)
  - tests/grid.test.js (créé) : grille vide, limites et collisions, fixation avec couleur, suppression de lignes
  - tests/piece.test.js (modifié) : ajout d'un test sur les couleurs
- Commandes exécutées : git status, npm test → 8 tests réussis, git diff
- Remarque : l'agent a supprimé et réécrit des fichiers de cache dans node_modules, hors de la tâche demandée. 
- Relecture : grid.js ne contient ni document, ni window, ni canvas ; la grille d'origine n'est pas modifiée (copie) ; messages en français ; pas de commentaires dans grid.js
- Gardé / annulé : Keep, puis commit
- Itérations : 1

### Requête 3 – Agent, étape 2 du plan
- Prompt : « réalise l'étape 2 de #file:docs/PLAN.md »
- Fichiers créés : src/core/game.js (état de la partie : pièce courante et suivante, RNG injectable, déplacements, rotation, chute simple et directe, fixation, Game Over), tests/game.test.js
- Commandes exécutées : npm test (échec), puis npm test → 12 tests réussis, git status
- Ajout non demandé : hardDrop (chute directe), absent de la SPEC
- Relecture : game.js importe grid.js et piece.js, pas de DOM dans src/core
- Gardé / annulé : gardé, commit
- Itérations : 1 
### Requête 4 – Agent, étape 3 du plan
- Prompt : « réalise l'étape 3 de #file:docs/PLAN.md »
- Fichiers créés : index.html, styles.css, main.js, src/ui/renderer.js, src/ui/input.js
- Fichiers non modifiés : src/core/piece.js, grid.js, game.js (l'agent n'a pas touché à la logique, il a seulement ajouté l'interface)
- Lancement : Live Server 
- Test manuel : les pièces tombent en couleur, les flèches gauche/droite les déplacent, la flèche haut les fait tourner, la flèche bas les fait descendre, les pièces s'empilent. Le jeu marche.
- Gardé / annulé : gardé
- Itérations : 1

### Requête 5 – Agent, étape 4 du plan
- Prompt : « réalise l'étape 4 de #file:docs/PLAN.md »
- Fichiers créés / modifiés : src/core/scoring.js (score, niveaux, vitesse), game.js (états Start/Pause/Restart, score, lignes, niveau), input.js (touche P), index.html, main.js, styles.css, tests scoring.test.js et game.test.js
- Commandes exécutées : npm test → 16 tests réussis
- Test manuel : le score augmente quand une ligne disparaît (1 ligne = 100, 2 lignes = 300) ; niveau 2 après 10 lignes ; Start, Pause, Restart et la touche P marchent
- Gardé / annulé : gardé
- Itérations : 1

### Requête 6 – Agent, étape 5 du plan
- Prompt : « réalise l'étape 5 de #file:docs/PLAN.md »
- Fichiers modifiés : renderer.js, index.html, main.js, styles.css, game.js 
- Commandes exécutées : npm test → 16 tests réussis
- Test manuel : pièce suivante affichée, animation des lignes, panneau responsive, écran Game Over avec score final. Le jeu marche.
- Gardé / annulé : gardé
- Itérations : 1

## Exercice 3

### Requête 1 – Agent, tests grid et scoring (question 1)

- Prompt : « écris tests/grid.test.js et tests/scoring.test.js : grille vide, pose d'une pièce, détection et suppression de lignes complètes, game over, score pour 1 à 4 lignes, passage de niveau, vitesse par niveau ; lance les tests »
- Produit : tous les cas couverts, mais regroupés dans peu de tests : seulement 1 test ajouté (17 tests au lieu d'une vingtaine). 2 fichiers modifiés, +27 −5.
Le score est multiplié par le niveau (calculateScore(2, 3) = 900), ce qui n'est pas dans la SPEC (ajout non demandé).
– Prompt 2 : « Il n'y a que 17 tests : sépare chaque cas dans son propre test (un test par nombre de lignes, un test par bord de la grille, etc.) pour atteindre au moins 22 tests, sans modifier src/ ; lance les tests»
- Produit : 37 tests réussis, src/ non modifié
- Gardé / annulé : gardé
- Itérations : 2

### Mes 3 tests (complétion, sans chat)
- La complétion a utilisé PIECES['T'].matrix alors que PIECES.T est directement une matrice → 3 tests en erreur (TypeError). Elle a inventé une structure qui n'existe pas dans le projet.
- Le test « T revient à sa forme de départ » ne vérifiait pas la forme de départ.
- Le 3e test portait sur le bord droit au lieu de la collision contre une pièce posée.
- Corrigé à la main → 40 tests réussis.
### Requête 2 – Agent, couverture
- Installation : npm install -D @vitest/coverage-v8, ajout du script "coverage": "vitest run --coverage"
- Premier rapport : 86,44 % des lignes de src/core 
- Prompt : « #terminalLastCommand ajoute les tests manquants pour couvrir les lignes non couvertes de src/core, en priorité scoring.js qui est à 73 %, sans modifier src/ ; relance npm run coverage »
- Produit : 53 tests réussis (40 avant), 100 % des lignes de src/core couvertes ; src/ non modifié
- Gardé / annulé : gardé
- Itérations : 1

### Requête 3 – Agent, bug volontaire
- Bug introduit à la main : dans scoring.js, 3 lignes rapportent 300 au lieu de 500 → npm test : 1 test en échec (« attribue 500 points pour trois lignes »)
- Prompt : « #terminalLastCommand fais passer les tests »
- Produit : l'agent a corrigé scoring.js (300 → 500), pas le test. 1 fichier modifié, +1 −1 → 53 tests réussis
- Gardé / annulé : gardé
- Itérations : 1

## Exercice 4

### Requête 1 – Chat, mode Ask (plan)
- Prompt : « #codebase propose un plan en étapes, sans coder : introduis une classe GameInstance (une partie : grille, pièce courante, score, état) et un GameManager (plusieurs instances, tour de jeu, fin de partie, gagnant = dernier en vie, podium). Écran de choix du mode : Solo, VS 1, 2 ou 3 adversaires. Grilles affichées côte à côte (2x2 au maximum) avec pseudo, score et niveau. Le mode solo doit rester identique. »
- Produit : plan en 8 étapes (GameInstance, createGame conservé pour le solo, GameManager, tests, écran de choix, rendu multi-grilles, entrées, validation). Copilot pose une question : multijoueur simultané ou par tours ?
- Itération 2 – Prompt : « Corrige le plan, sans coder :
- un seul joueur humain, avec les touches actuelles ; les adversaires seront des IA à l'exercice suivant, pour l'instant leurs grilles s'affichent mais ils ne jouent pas ; pas de touches par joueur ;
- le fichier de tests du manager s'appelle tests/gameManager.test.js (création solo, création à quatre, désignation du gagnant, réinitialisation) ;
- regroupe en 5 étapes, chacune terminée par npm test. »
- Produit : plan corrigé en 5 étapes (GameInstance + createGame conservé / GameManager + tests / écran de choix / grilles côte à côte / boucle de jeu et gagnant) ; adversaires inactifs jusqu'à l'exercice 5
- Gardé : plan sauvegardé dans docs/PLAN-VS.md
- Itérations : 2
### Requête 2 – Agent, étape 1 du plan
- Prompt : « réalise l'étape 1 de #file:docs/PLAN-VS.md »
- Fichiers créés / modifiés : src/core/gameInstance.js (créé : classe GameInstance avec la logique d'une partie + pseudo), src/core/game.js (devient une façade : createGame() crée une GameInstance), tests/gameInstance.test.js (créé : pseudo et restart)
- npm test : 55 tests réussis 
- Test manuel : mode solo identique 
- Gardé / annulé : gardé
- Itérations : 1

### Requête 3 – Agent, étape 2 du plan
- Prompt : « réalise l'étape 2 de #file:docs/PLAN-VS.md »
- Fichiers créés : src/core/gameManager.js (modes Solo à VS 3, joueur humain en premier, adversaires inactifs, gagnant = dernier vivant, podium, réinitialisation), tests/gameManager.test.js (création solo, création à quatre, gagnant, réinitialisation)
- npm test : 59 tests réussis 
- Test manuel : mode solo identique
- Gardé / annulé : gardé
- Itérations : 1

### Requête 4 – Agent, étape 3 du plan
- Prompt : « réalise l'étape 3 de #file:docs/PLAN-VS.md »
- Fichiers modifiés : index.html (écran de choix : pseudo, Solo, VS 1, 2 ou 3 adversaires, bouton « Lancer la partie »), main.js (crée un GameManager selon le mode choisi), styles.css (styles de l'écran de choix et des grilles adverses)
- npm test : 59 tests réussis,
- Test manuel : l'écran de choix s'affiche ; le mode Solo se joue comme avant ; en mode VS, les grilles adverses s'affichent sans bouger
- Gardé / annulé : gardé
- Itérations : 1

### Requête 5 – Agent, étape 4 du plan
- Prompt : « réalise l'étape 4 de #file:docs/PLAN-VS.md »
- Fichiers modifiés : src/ui/renderer.js, index.html, main.js, styles.css
- npm test : 59 tests réussis
- Test manuel : en VS 1, la grille du joueur était beaucoup plus petite que celle de l'adversaire
- Itération 2 – Prompt : « En VS 1, la grille du joueur humain est beaucoup plus petite que celle de l'adversaire, et le texte des commandes est écrasé dans une colonne étroite. Toutes les grilles doivent avoir la même taille ; le panneau du joueur (pièce suivante, score, boutons) ne doit pas réduire sa grille. Vérifie aussi en VS 3 (2x2) et en Solo.»
- Produit : toutes les grilles ont la même taille ; VS 1 = 2 grilles côte à côte, VS 2 = 2 + 1 en dessous, VS 3 = 2x2 ; pseudo, score, niveau et lignes sous chaque grille adverse
- Gardé / annulé : gardé
- Itérations : 2

### Requête 6 – Agent, étape 5 du plan
- Prompt : « réalise l'étape 5 de #file:docs/PLAN-VS.md »
- Fichiers modifiés : src/core/gameManager.js, src/ui/input.js, index.html, main.js, styles.css, tests/gameManager.test.js
- npm test : 59 tests réussis
- Test manuel : en VS 1, le joueur joue et l'adversaire reste immobile ; score et niveau évoluent ; après mon Game Over, le panneau « Gagnant » s'affiche : Adversaire 1 gagne avec 0 point (dernier en vie), puis Joueur 2e avec 2200 points
- Gardé / annulé : gardé
- Itérations : 1

## Exercice 5

### Requête 1 – Agent, joueurs IA
- Prompt : « réalise #file:docs/SPEC-IA.md ; propose d'abord un plan, puis implémente-le ; lance npm test »
- Produit : plan en 5 points annoncé, puis implémentation sans attendre ma validation
- Fichiers créés / modifiés : src/core/ai.js, src/core/gameManager.js , main.js, index.html, styles.css, renderer.js, tests/ai.test.js
- Correction : après un premier npm test en échec, l'agent a modifié le code (pas les tests) pour que l'expert puisse décider même sans pièce suivante
- npm test : 65 tests réussis
- Test manuel : en VS 3, les 3 niveaux sont affichés sous les pseudos (Débutant, Intermédiaire, Expert) et jouent tous ; après quelques minutes : débutant 0 ligne (tour au hasard au milieu), intermédiaire 4 lignes (grille basse et plate), expert 8 lignes. Les IA continuent après mon Game Over. L'IA est plus lente que la chute normale.
- Gardé / annulé : gardé
- Itérations : 1

### Requête 2 – Agent, tests de l'IA
- Prompt : « complète tests/ai.test.js : fonctions d'évaluation sur des grilles construites à la main (trous, irrégularité, hauteur), choix de la meilleure position dans un cas évident, et « l'IA ne triche pas » : chaque décision est jouable par les fonctions publiques de GameInstance ; ne modifie pas src/ ; lance les tests »
- Fichier modifié : tests/ai.test.js uniquement
- Remarque : avant d'écrire les tests, l'agent a lancé plusieurs scripts node pour observer ce que l'IA décide. Certaines valeurs attendues viennent donc du comportement du code et non d'un calcul indépendant.
- npm test : 70 tests réussis
- Gardé / annulé : gardé
- Itérations : 1

### Requête 3 – Agent, simulation
- Prompt : « écris scripts/simulate.js qui joue 20 parties sans affichage par niveau d'IA, avec une graine fixe, et affiche le nombre moyen de lignes complétées par niveau ; lance node scripts/simulate.js »
- Fichier créé : scripts/simulate.js (RNG à graine fixe, 20 parties par niveau, décisions jouées via les fonctions publiques de GameInstance, sans DOM, limite de pièces par partie ajoutée par l'agent)
- Résultat : débutant 0,00 ligne, intermédiaire 3,55 lignes, expert 6,90 lignes en moyenne → l'expert fait nettement mieux que le débutant
- Gardé / annulé : gardé
- Itérations : 1

### Requête 4 – Agent, variation des pondérations
- Prompt : « avec scripts/simulate.js, fais varier une par une les 4 pondérations de l'expert en les mettant à 0 puis en les doublant… remets les valeurs d'origine à la fin »
- Fichiers modifiés : src/core/ai.js, scripts/simulate.js
- Résultat : hauteur 0 → 15,85 / ×2 → 5,60 ; lignes 0 → 4,75 / ×2 → 4,85 ; trous 0 → 14,75 / ×2 → 4,90 ; irrégularité 0 → 2,25 / ×2 → 16,80 (référence : 6,90)
- npm test : 70 tests réussis
- Remarque : l'agent a modifié le code de production (ai.js) pour l'expérience, pas seulement le script
- Gardé / annulé : gardé
- Itérations : 1
