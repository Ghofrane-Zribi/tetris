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

## Exercice 2

### Requête 1 – Etape 1
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