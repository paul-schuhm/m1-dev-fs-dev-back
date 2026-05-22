# Développement et conception Backend : Projet Fil Rouge - Système de Billetterie (web API)

- [Développement et conception Backend : Projet Fil Rouge - Système de Billetterie (web API)](#développement-et-conception-backend--projet-fil-rouge---système-de-billetterie-web-api)
  - [Pré-requis](#pré-requis)
    - [Pipeline CI](#pipeline-ci)
  - [Installer et lancer le projet](#installer-et-lancer-le-projet)
  - [Tester avec cURL et jq](#tester-avec-curl-et-jq)
  - [Lancer le projet (environnement de production)](#lancer-le-projet-environnement-de-production)
  - [Build image de prod de la web API](#build-image-de-prod-de-la-web-api)
  - [(Re)Générer la documentation OpenAPI](#regénérer-la-documentation-openapi)
  - [Accéder à la documentation OpenAPI](#accéder-à-la-documentation-openapi)
  - [Progression typique (*workflow*)](#progression-typique-workflow)
  - [CI](#ci)
  - [CD](#cd)
  - [Guide](#guide)
  - [Cahier des charges (spécifications)](#cahier-des-charges-spécifications)
    - [Méthodologie employée pour concevoir et implémenter l'API REST"like"](#méthodologie-employée-pour-concevoir-et-implémenter-lapi-restlike)
  - [À terminer](#à-terminer)
  - [Améliorations à prévoir](#améliorations-à-prévoir)
  - [Ressources utiles](#ressources-utiles)
    - [REST et conception d'API](#rest-et-conception-dapi)
    - [Schémas utilisés](#schémas-utilisés)
    - [Docker et compose](#docker-et-compose)
    - [CI avec Github Actions](#ci-avec-github-actions)
    - [Tooling](#tooling)

## Pré-requis

- Installer Docker et Compose

### Pipeline CI

- Disposer d'un compte sur Docker Inc (Docker Hub pour publier les images, Docker Scout pour le scan de vulnérabilités dans la *pipeline* CI);
- Disposer d'un compte gratuit sur Sonarcloud (SonarQube pour analyse statique dans la *pipeline* CI);

## Installer et lancer le projet

~~~bash
mkdir db-data db
echo "password" > db/password.txt
cp .env.dist .env
npm run gen-oad
docker compose -f compose.yaml -f compose.dev.yaml build api
docker compose -f compose.yaml -f compose.dev.yaml up --watch
~~~

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

## Lancer le projet (environnement de production)

~~~bash
docker compose -f compose.yaml -f compose.prod.yaml --env-file .env.prod up -d --build
~~~

## Build image de prod de la web API

~~~bash
docker build --target production --tag api .
~~~

> Ne pas hésiter à se créer un `Makefile` ou des `alias` pour faciliter le lancement de ces commandes !

## (Re)Générer la documentation OpenAPI

~~~bash
npm run gen-oad
~~~

## Accéder à la documentation OpenAPI

La documentation OpenAPI est servie sur l'URL `/doc`, en environnement de dévelopement.

## Progression typique (*workflow*)

1. On [lance le projet en mode dev (*hot reload* via le mode *watch* de Compose)](#lancer-le-projet-env-de-dev)
2. On développe (modifie sources)
3. On *commit* sur une branche, déclenche hook *pre-commit* (qualité locale) :
   1. Linter (avec eslint)
   2. Analyse statique (avec eslint)
   3. Tests "internes" (avec jest)
4. Si tout passe, le *commit est réalisé* en local
5. Publie le commit sur le dépôt distant
6. Déclenchement de la [*pipeline* CI](#ci)

## CI

Pipeline CI avec *Github Actions*

<!-- Indiquer le contenu de la pipeline -->

## CD

## Guide

[Accéder au guide de développement, intégration et déploiement du service.](./guide.md)

## Cahier des charges (spécifications)

[Accéder au cahier des charges](./cdc.md)

### Méthodologie employée pour concevoir et implémenter l'API REST"like"

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

## À terminer

- Finaliser la CI avec un *runner* dédié aux tests externes []
- Intégrer la base de données MySQL au système []

## Améliorations à prévoir

- Créer et utiliser un utilisateur `mysql` différent de `root` dédié à l'application ;
- Améliorer et personnaliser les règles de l'analyse statique et fixer un niveau d'exigence adapté (via `eslint`) ;
- Développer une série de tests *stateless* pertinente ;
- Développer une série de tests *stateful* pertinente ;

## Ressources utiles

### REST et conception d'API

- [RFC HAL](https://datatracker.ietf.org/doc/html/draft-kelly-json-hal), la spécification HAL. Très courte, lecture recommandée (s’entraîner à lire des spécifications pour les implémenter). Spécification de base minimaliste servant de support à la construction de réponse hypermédia
- [OpenAPI Specification v3.2.0](https://spec.openapis.org/oas/latest.html), spécification de description d'API, peu importe l'architecture choisie. Permet d'utiliser la suite d'outils Swagger (Editor, Autogen, UI) pour améliorer la *découverabilité* du service

### Schémas utilisés

- [MusicEvent](https://schema.org/MusicEvent), sur [schema.org](https://schema.org)
- [ErrorType](https://schema.org/Error), sur [schema.org](https://schema.org)

### Docker et compose

- [Best Practices Around Production Ready Web Apps with Docker Compose](https://nickjanetakis.com/blog/best-practices-around-production-ready-web-apps-with-docker-compose), de [Nick Janetakis](https://nickjanetakis.com/about). Publié en 2021, des choses ont changé sur Compose depuis mais reste pertinent sur de nombreux points
- [Mettre à jour les images Docker : la méthode de Bearstech](https://bearstech.com/societe/blog/mettre-a-jour-les-images-docker-la-methode-de-bearstech/)
- [Security best practices](https://docs.docker.com/develop/security-best-practices/), les meilleures pratiques de sécurité **lors de la phase de build** d'images
- [12 Fractured Apps](https://medium.com/@kelseyhightower/12-fractured-apps-1080c73d481c#.smga9216i), de Kesley Hightower

### CI avec Github Actions

- [Events that trigger workflows](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows), documentation de Github Actions
- [Scan your code with SonarQube](https://github.com/marketplace/actions/official-sonarqube-scan), documentation officielle de Github Actions
- [Adding analysis to GitHub Actions workflow](https://docs.sonarsource.com/sonarqube-server/devops-platform-integration/github-integration/adding-analysis-to-github-actions-workflow)
- [act](https://github.com/nektos/act), tester les *Github Actions* localement *avant* de les exécuter sur Github
- [actionlint](https://github.com/rhysd/actionlint), analyseur statique des fichiers de Github Actions
- [Docker Scout](https://docs.docker.com/scout/), analyseur d'images (couche par couche), pour détecter des vulnérabilités

### Tooling

- [jq](https://jqlang.org/), *sed* for json data
- [testcontainers](https://testcontainers.com/), librairie open source fournissant une API pour instancier des dépendances *stateful* (ex: base de données) pour les tests d'intégration
- [supertest](https://www.npmjs.com/package/supertest), tests au niveau de la couche http
- [Husky](https://typicode.github.io/husky/), gestion explicite et partageable de hooks *pre-commit*
- [eslint](https://eslint.org/), linter et analyse statique des sources js
- [sonarjs](https://www.npmjs.com/package/eslint-plugin-sonarjs), plugin d'eslint pour la détection de *code smell*
