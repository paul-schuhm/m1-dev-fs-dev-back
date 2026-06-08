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
APP_VERSION=${APP_VERSION} docker compose -f billetterie/compose.yaml --env-file .env -p billetterie_v${APP_VERSION} up -d
~~~

Les deux applications (et toutes leurs instances) sont actives de manière simultanée.

2. **Faire la bascule** (*switch*) via le *reverse-proxy* :

Pour éviter d'éditer manuellement le fichier `nginx.conf` à chaque déploiement, l'astuce consiste à utiliser un **lien symbolique** pour la configuration de Nginx.

> La méthode des liens symboliques est très utilisée dans les environnements UNIX, notamment pour la mise en production déterministe, comme par l'excellent outil de déploiement [Capistrano](https://capistranorb.com/)

On crée :

- deux fichiers de configuration fixes `api_blue.conf` et `api_green.conf`
- un lien symbolique `api.conf` qui pointe *à chaque instant* vers l'un des deux fichiers
- un script `switch` n'a plus qu'à faire pointer le lien symbolique vers l'environnement choisi avant de recharger Nginx sans l'arrêter

Fichier `upstream_blue.conf` :

~~~bash
upstream api_servers {
    server 127.0.0.1:billeterie_v1;
}
~~~

Fichier `upstream_green.conf` :

~~~bash
upstream api_servers {
    server 127.0.0.1:billeterie_v2;
}

Fichier de **configuration principal** `default.conf` :

~~~bash
# On inclut le fichier pointé par le lien symbolique
include /etc/nginx/conf.d/api.conf;

server {
    listen 80;
    server_name api.mondomaine.com;
    location / {
        proxy_pass http://api_servers; # Utilise l'upstream dynamique
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
~~~

Le script de bascule :

> En cours d'écriture...

~~~bash
#!/bin/bash

# Bascule les requêtes entrantes Nginx vers le cluster de conteneurs de l'API (blue ou green)

# Configuration des chemins
# PATH du fichier du lien symbolique (pointe sur config blue ou green)

# Récupération et vérification de l'argument
TARGET_ENV=$(echo "$1" | tr '[:upper:]' '[:lower:]')

if [ "$TARGET_ENV" != "blue" ] && [ "$TARGET_ENV" != "green" ]; then
  echo "Usage : "
  echo "switch blue"
  echo "switch green"
  exit 1
fi

echo "Préparation de la bascule vers l'environnement : [${TARGET_ENV^^}]"

# MISE A JOUR DU LIEN SYMBOLIQUE
TARGET_CONF="$NGINX_DIR/upstream_${TARGET_ENV}.conf"
ln -sfn "$TARGET_CONF" "$LINK_PATH"

# Test de la configuration Nginx pour éviter de casser le serveur en prod
if nginx -t > /dev/null 2>&1; then
  echo "Configuration Nginx valide."
  # 3. Rechargement de Nginx à chaud (Zero-Downtime)
  nginx -s reload
  echo "Bascule réussie. Tout le trafic pointe maintenant sur [${TARGET_ENV^^}]."
else
  echo "Erreur critique : La configuration de Nginx est invalide après le changement."
  echo "Reversion automatique vers l'état précédent..."
  # Optionnel : réaliser une marche arrière automatique ici si nécessaire
  exit 1
fi
~~~

Rendre le script exécutable et l'installer sur le `PATH` :

~~~bash
chmod +x switch
cp switch /usr/bin/switch
~~~


3. **Tester** :

Utilisation :

- L'application est actuellement sur billeterie_v1 (*Blue*) 
- Déployez la nouvelle version billeterie_v2 (*Green*) et vous attendez qu'elle soit prête.
- Lancez la bascule instantanée :

~~~bash
switch green
~~~

En cas de problème majeur, faire un *rollback* sur *Blue* :

~~~bash
switch b
~~~


4. Une fois le déploiement stabilisé, **nettoyer l'ancienne version** (*Blue*) :

~~~
APP_VERSION=1
APP_VERSION=${APP_VERSION} docker compose -f billetterie/compose.yaml --env-file .env -p billetterie_v${APP_VERSION} down
~~~
