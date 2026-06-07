# Mise en production avec la méthode *Blue-Green*

> En cours de rédaction...
> Ne pas hésiter à se créer un `Makefile`, des `alias` ou un script Shell pour faciliter le lancement de ces commandes !

Build une image de production, à publier sur un registre :

~~~bash
APP_VERSION=${APP_VERSION} docker compose -f billetterie/compose.yaml build api
~~~

**Se placer à la racine du dossier** `demo-mise-en-production`

## Setup

1. **Préparer** un fichier d'`.env` et le secret de la base données (*provisioning*)

~~~bash
cp .env.dist .env
echo "password" > password.txt
~~~

2. **Créer** le le réseau de conteneurs `api-network` (tous les conteneurs des différents projets vont rejoindre ce réseau)

~~~bash
docker network create api-network
~~~

3. **Lancer** la base de données :

~~~bash
docker compose --env-file .env -f base-de-donnees/compose.yaml config
docker compose --env-file .env -f base-de-donnees/compose.yaml up -d
~~~

3. **Lancer** une première version du service web de billetterie (*Blue*) :

~~~bash
APP_VERSION=1
#On nomme le projet billetterie_v1 (Blue)
APP_VERSION=${APP_VERSION} docker compose -f billetterie/compose.yaml --env-file .env -p billetterie_v${APP_VERSION} up -d
~~~

4. Lancer le reverse-proxy :

~~~bash
docker compose -f reverse-proxy/compose.yaml up -d
~~~

Le *reverse-proxy* répartit les requêtes sur les différentes instances du service de billetterie.

5. **Tester** :

Vérifier que tous les conteneurs sont biens sur le même network

~~~bash
docker network inspect api-network
~~~

~~~bash
curl localhost:8080
#Tester la répartition des requêtes entre les répliques
while true; do curl -s http://localhost:8080/; echo ""; sleep 0.1; done
docker stats
~~~

## Déploiement d'une nouvelle version

Une nouvelle image est *build*, taguée avec la version `2.0.0` et publiée sur le registre

> Pour la démo le fichier `compose.prod.yaml` utilise une nouvelle version de l'image déjà présente localement. **Modifier** `image: billetterie:${APP_VERSION}` par image: ${nom-registre}/${nom-image}:${APP_VERSION} au besoin.

1. **Lancer** la nouvelle image :

~~~bash
APP_VERSION=2
#On nomme le projet billetterie_v2 (Green)
APP_VERSION=${APP_VERSION} docker compose -f billetterie/compose.yaml -p billetterie_v${APP_VERSION} up -d
~~~

Les deux applications (et toutes leurs instances) sont actives de manière simultanée.

2. **Faire la bascule** (*switch*) via le *reverse-proxy* :

~~~bash

~~~

3. **Tester** :
4. Une fois le déploiement stabilisé, **nettoyer l'ancienne version** (*Blue*)
