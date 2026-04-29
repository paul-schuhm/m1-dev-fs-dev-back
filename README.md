# Billeterrie

- [Billeterrie](#billeterrie)
  - [Lancer le projet](#lancer-le-projet)
  - [(Re)Générer la documentation OpenAPI](#regénérer-la-documentation-openapi)
  - [Accéder à la documentation OpenAPI](#accéder-à-la-documentation-openapi)
  - [Tester avec cURL et jq](#tester-avec-curl-et-jq)
  - [Cahier des charges (spécifications)](#cahier-des-charges-spécifications)
    - [Méthodologie employée pour concevoir et implémenter l'API REST](#méthodologie-employée-pour-concevoir-et-implémenter-lapi-rest)
  - [Ressources utiles](#ressources-utiles)
    - [Schémas utilisés](#schémas-utilisés)

## Lancer le projet

~~~bash
npm i
npm run dev
~~~

## (Re)Générer la documentation OpenAPI

~~~bash
npm run gen-oad
~~~

## Accéder à la documentation OpenAPI

La documentation OpenAPI est servie sur l'URL `/doc` en environnement de developement.

## Tester avec cURL et jq

~~~bash
#point d'entrée du service
curl localhost:3000
#filtrer uniquement le champ date (ligne)
curl localhost:3000/v1/concerts | jq '._embedded.concerts[].date'
#afficher le nombre de lignes (jq)
curl localhost:3000/v1/concerts | jq '._embedded.concerts[].date' | jq -s 'length'
#ou avec wc
curl localhost:3000/v1/concerts | jq '._embedded.concerts[].date' | wc -l
#filtrer les champs
curl "localhost:3000/v1/concerts?offset=1&limit=3" | jq '._embedded.concerts[] | {artist, date}'
#afficher uniquement les liens (pagination)
curl "localhost:3000/v1/concerts?offset=1&limit=3" | jq '._links'
~~~

## Cahier des charges (spécifications)

[Accéder au cahier des charges](./cdc.md)

### Méthodologie employée pour concevoir et implémenter l'API REST

Nous reprenons la démarche générale, proposée par [Leonard Richardson](https://www.oreilly.com/pub/au/2556) et [Sam Ruby](https://en.wikipedia.org/wiki/Sam_Ruby)

1. **Déterminer** l'ensemble des *données* (dictionnaire des données)
2. **Décomposer** l'ensemble des données en *ressources*

**Pour chaque type de ressource**:

3. **Nommer** les ressources avec des URI
4. **Implémenter** un sous-ensemble de l'interface uniforme (GET, POST, DELETE, PUT)
5. **Étudier** la ou les représentations acceptées par les clients
6. **Concevoir** la ou les représentations à mettre à disposition des clients (formulaires)
7. **Intégrer** la ressource parmi celles qui existent déjà, en utilisant un format *hypermédia*
8. **Envisager** la progression typique des évènements: qu'est-ce qui est censé se produire ? [Le flux de contrôle standard comme le protocole de publication Atom](https://www.ibm.com/docs/fr/integration-designer/8.5.5?topic=formats-atom-feed-format) peut aider.
9. **Considérer** les cas d'erreurs: qu'est-ce qui peut mal se passer ? Que faire dans ce cas ?

## Ressources utiles

- [jq](https://jqlang.org/), *sed* for json data
- [RFC HAL](https://datatracker.ietf.org/doc/html/draft-kelly-json-hal), la spécification HAL. Très courte, lecture recommandée (s'entrainer à lire des spécifications pour les implémenter)
- [OpenAPI Specification v3.2.0](https://spec.openapis.org/oas/latest.html) 

### Schémas utilisés

- [MusicEvent](https://schema.org/MusicEvent), sur [schema.org](https://schema.org)