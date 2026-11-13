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
