# Mise en production avec la méthode *Blue-Green*

> En cours de rédaction...

> Ne pas hésiter à se créer un `Makefile` ou des `alias` pour faciliter le lancement de ces commandes !

## Setup

1. Créer le le réseau de conteneurs `api-network`:

2. Lancer la base de données

3. Lancer une première version du service web de billetterie (*Blue*) :

~~~bash
cp .env.prod.dist .env.prod
APP_VERSION=1.0.0
#On nomme le projet billetterie-1.0.0 (Blue)
APP_VERSION=${APP_VERSION} docker compose -f compose.yaml -f compose.prod.yaml -p billetterie-${APP_VERSION} --env-file .env.prod up -d
~~~

4. Lancer le reverse-proxy :

~~~bash
docker compose -f reverse-proxy/compose.yml up -d
~~~

Le *reverse-proxy* répartit les requêtes sur les différentes instances du service de billetterie.

Tester :

~~~bash
curl localhost:8080
~~~

## Déploiement d'une nouvelle version

Une nouvelle image est *build*, taguée avec la version `2.0.0` et publiée sur le registre

> Pour la démo le fichier `compose.prod.yaml` utilise une nouvelle version de l'image déjà présente localement. **Modifier** `image: billetterie:${APP_VERSION}` par image: ${nom-registre}/${nom-image}:${APP_VERSION} au besoin.

Lancer la nouvelle image

~~~bash
APP_VERSION=2.0.0
#On nomme le projet billetterie-2.0.0 (Green)
APP_VERSION=${APP_VERSION} docker compose -f compose.yaml -f compose.prod.yaml -p billetterie-${APP_VERSION} --env-file .env.prod up -d
~~~
