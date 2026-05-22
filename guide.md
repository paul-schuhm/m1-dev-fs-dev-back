# Développement Back-end et conception d'API (49h) - Guide

- [Développement Back-end et conception d'API (49h) - Guide](#développement-back-end-et-conception-dapi-49h---guide)
  - [Objectif principal](#objectif-principal)
  - [Partie 2 : Choix technologique, mise en place d'un projet conteneurisé, tests, tooling de qualité du code](#partie-2--choix-technologique-mise-en-place-dun-projet-conteneurisé-tests-tooling-de-qualité-du-code)
  - [Conteneurisation](#conteneurisation)
  - [Dockerfile Optimisé (multi-stage)](#dockerfile-optimisé-multi-stage)
  - [Checkpoint](#checkpoint)
  - [Gestion des environnements](#gestion-des-environnements)
  - [Environnement de développement](#environnement-de-développement)
  - [Environnement de production](#environnement-de-production)
  - [Mise en place de la rotation des secrets](#mise-en-place-de-la-rotation-des-secrets)
  - [Utiliser l'API des secrets de Docker](#utiliser-lapi-des-secrets-de-docker)
  - [Provisioning](#provisioning)
  - [Rotation du secret](#rotation-du-secret)
  - [Rotation auto avec un cronjob](#rotation-auto-avec-un-cronjob)
    - [Remarque sur la rotation, précautions](#remarque-sur-la-rotation-précautions)
  - [Checkpoint](#checkpoint-1)
  - [Intégration continue (CI)](#intégration-continue-ci)
  - [Mettre en place un dépôt](#mettre-en-place-un-dépôt)
  - [Pré-commit (qualité "locale", feedback rapide)](#pré-commit-qualité-locale-feedback-rapide)
  - [Pipeline CI (avec GitHub Actions)](#pipeline-ci-avec-github-actions)
  - [Checkpoint](#checkpoint-2)
  - [Déploiement continu et stratégies de mise en production (CD)](#déploiement-continu-et-stratégies-de-mise-en-production-cd)
  - [Déploiement *Blue-Green*](#déploiement-blue-green)
  - [Scénario (sans *breaking change* au niveau du schéma)](#scénario-sans-breaking-change-au-niveau-du-schéma)
  - [Mise en place](#mise-en-place)
  - [Scripter la bascule](#scripter-la-bascule)
  - [Test du *zero-downtime*](#test-du-zero-downtime)
  - [Protocole de test à exécuter](#protocole-de-test-à-exécuter)
  - [Checkpoint](#checkpoint-3)
  - [Questions (réfléchir)](#questions-réfléchir)
  - [En cours de consolidation](#en-cours-de-consolidation)
  - [Migration (*vanilla*, sans ORM)](#migration-vanilla-sans-orm)
  - [Checkpoint](#checkpoint-4)
  - [Intégration d'un ORM pour les migrations](#intégration-dun-orm-pour-les-migrations)
  - [Mise en cache avec Redis](#mise-en-cache-avec-redis)

## Objectif principal

Être capable de **designer**, **justifier** et **mettre en place** une solution *back-end* complète et des web API *performantes* en réponse à des *besoins métiers*.

## Partie 2 : Choix technologique, mise en place d'un projet conteneurisé, tests, tooling de qualité du code

- Conteneuriser une application Node.js/Express de manière optimisée (Multi-stage builds).
- Orchestrer une architecture avec Load Balancing.
- Gérer les cycles de vie de la donnée (migrations) et la sécurité (rotation des secrets).
- Automatiser la qualité et la livraison via une stack Git Hooks + GitHub Actions.
- Comprendre et simuler un déploiement *Zero-Downtime* (Blue/Green) avec *Breaking Changes*.

## Conteneurisation

- **Standardiser** l'environnement de développement ;
- **Artefacts** deterministes ("Objets");
- Livraison d'artefact dans une *pipeline* (procédure automatisée et auditable)

## Dockerfile Optimisé (multi-stage)

**Créez** un `Dockerfile` pour l'application web API Express [en utilisant le multi-staging](https://docs.docker.com/build/building/multi-stage/). Votre fichier doit comporter **au moins deux étapes** :

- une étape de *build* des dependencies (dev et prod)
- une étape de *runtime* (production) *légère*, [sécurisée (hardened)](https://www.docker.com/products/hardened-images/), à *build* pour la production

> Pourquoi utilise-t-on le multi-staging en production plutôt qu'un simple `FROM node:latest` ? Quel est l'impact sur la *sécurité* et la *taille* de l'image ?

## Checkpoint

> À valider ensemble

- Présenter votre Dockerfile et la taille de l'image finale à destination de la production générée
- Présenter l'environnement `developement`;

## Gestion des environnements

Nous allons maintenant orchestrer nos services à l'aide de Docker Compose en séparant distinctement le comportement de Développement et de Production.

À l'aide de la méthode de votre choix (merging, composition, heritage, etc.), préparer un ou plusieurs fichiers `compose.yaml` permettant de produire les deux environnements suivants :

- `developement`
- `production`

## Environnement de développement

- 1 instance de votre API ([avec le mode watch des sources](https://docs.docker.com/compose/how-tos/file-watch/)).
- 1 instance MySQL avec un volume pour la persistance des données
- 1 instance Adminer (pour manager/visualiser la base).
- 1 instance Redis (utilisée pour le cache des requêtes HTTP).

Les logs de l'API doivent s'afficher dans la console (*stdout*) pour le debug **et** s'écrire dans un fichier `./logs/dev.log`.

## Environnement de production

L'environnement de production sera une plateforme Docker (Docker Engine installé)

- 4 répliques (instances) de votre API Node.js.
- 1 instance de *load balancer* Nginx positionnée en frontal des 4 répliques pour distribuer la charge (distribution en [mode Round-robin](https://fr.wikipedia.org/wiki/Round-robin_(informatique)) par défaut)
- 1 instance Redis rendue activable ou non **via une variable d'environnement** `ENABLE_CACHE=true/false`. L'api doit pouvoir l'utiliser l'instance Redis si le cache est activé
- Sécurité : **Mettez en place un mécanisme de rotation ou de chargement dynamique des secrets** pour la signature des tokens JWT.

<!-- 
Proposer une méthode claire pour la rotation des clefs : 
Pré requis: 
- avoir parlé des différentes méthodes d'authentification (vs authorisation), jwt et refresh token, le meilleur des deux mondes
- avoir implémenté un endpoint de login /login
 -->

> Quelles précautions de sécurité faut-il prendre concernant les conteneurs en production ?
> Comment Nginx fait-il pour connaître les adresses IP des 4 répliques de l'API au sein du réseau Docker ? Quelle directive Nginx permet de distribuer les requêtes ?

<!-- Usage de secrets, logs bien protégés, cpu et ram limitée !, politique de restart -->

## Mise en place de la rotation des secrets

Le secret doit être stocké de façon sécurisée à l'extérieur et **injecté** uniquement au moment où le conteneur démarre (`docker compose up`). GitHub Actions ne doit **jamais** connaître le secret JWT de production. La CI sert uniquement à :

- Tester le code (avec un faux secret de test).
- Build l'image Docker "vierge" de tout secret.
- Push l'image sur Docker Hub.

C'est au moment du déploiement (le script CD ou la manipulation manuelle sur le serveur) qu'on crée un fichier `secret` sécurisé (non versionné sur Git !) **directement** sur la machine de prod.

## Utiliser l'API des secrets de Docker

~~~yaml
version: "3.8"

services:
  api:
    image: mon-app-node:latest
    ports:
      - "3000:3000"
    secrets:
      - jwt_secret # L'API a maintenant accès au secret

secrets:
  jwt_secret:
    file: ./secrets/jwt_secret # Le fichier contenant la clé sur le serveur
~~~

À l'intérieur du conteneur, le secret sera lisible à cet emplacement exact : `/run/secrets/jwt_secret`. Pour que la rotation fonctionne **sans redémarrer** l'API, le code ne doit jamais stocker le secret dans une variable globale au démarrage. Il doit lire le fichier `/run/secrets/jwt_secret` à chaque fois qu'il a besoin de vérifier ou de signer un token.

Le fichier `./secrets/jwt_secret` est créé une seule fois, lors de l'initialisation (le *provisioning*) du serveur de production, bien avant le premier déploiement de l'API. C'est ce qu'on appelle la *configuration de la machine "à froid"*.

## Provisioning

**Écrire** un script `init-server.sh` (avant déploiement)

~~~bash
#!/bin/bash
# init-server.sh (À lancer une seule fois par l'Ops sur le serveur)
echo "Initialisation du serveur de Production..."

# 1. Créer le dossier secret s'il n'existe pas
mkdir -p ./secrets

# 2. Générer un secret JWT hautement sécurisé de manière aléatoire
# (On utilise openssl pour éviter qu'un humain ne choisisse la clé)
openssl rand -base64 32 > ./secrets/jwt_secret

# 3. Sécuriser les permissions du fichier (seul l'admin et Docker peuvent le lire)
chmod 600 ./secrets/jwt_secret

echo "Fichier jwt_secret généré avec succès en local sur le serveur."
~~~

Une fois ce fichier présent sur le serveur, la *pipeline* de déploiement peut être lancée.

## Rotation du secret

**Changer** le secret *régulièrement*.

Par exemple, le générer avec `openssl` : `openssl rand -base64 32 > ./secrets/jwt_secret`

## Rotation auto avec un cronjob

**Mettre en place** une rotation automatique par une tâche planifiée (Cron)

> Ce que font les outils de gestion de secrets (comme Vault ou AWS Secrets Manager).

~~~bash
#!/bin/bash
# /app/scripts/rotate-jwt.sh

# 1. Générer le nouveau secret
openssl rand -base64 32 > /app/secrets/jwt_secret.txt

# 2. Optionnel : Logger l'action
echo "[$(date)] Rotation automatique du secret JWT effectuée." >> /app/logs/security.log
~~~

Par exemple, rotation tous les jours à minuit :

~~~bash
crontab -e
#ajouter la ligne suivante
0 0 * * * /bin/bash /app/scripts/rotate-jwt.sh
~~~

### Remarque sur la rotation, précautions

À 23h59, un utilisateur se connecte. Il reçoit un token valide pour 1 heure (signé avec la clé A). À 00h00, le cron s'éxecute. Le fichier est *écrasé* avec la clé B. À 00h01, l'utilisateur fait une requête. L'application Node lit le fichier (clé B), tente de valider le *token* (signé avec la clé A) ce qui provoque un échec. L'utilisateur est déconnecté.

Pour que le cron ne déconnecte pas tout le monde, le script clé ne doit pas *juste* écraser le fichier, il doit gérer un historique (ex: garder la clé du jour et la clé de la veille).
**Adapter** le script du cronjob pour qu'il écrive deux lignes dans le fichier `jwt_secret` :

- Ligne 1 : Le nouveau secret (pour signer).
- Ligne 2 : L'ancien secret (pour valider les tokens encore actifs).

L'application aura juste à lire le fichier, prendre la ligne 1 pour signer, et tester la ligne 1 *puis* la ligne 2 pour valider la signature.

## Checkpoint

- Lancez l'environnement de production.
- Faites plusieurs requêtes HTTP et montrez (via les *logs*) que la charge est bien répartie sur les différents conteneurs de l'API.
- Faire une rotation du secret JWT manuelle (via un script shell)

## Intégration continue (CI)

L'objectif est d'**interdire** l'intégration (rapatriement) de code **non conforme** ou **incorrect** (comportement).

## Mettre en place un dépôt

- **Créer** un dépôt sur Github en mode centralisé (source de vérité, *branches officielles*)
- **Faire** un clone du dépôt sur votre machine
- **Rédiger** un `README` donnant les instructions pour lancer votre projet en environnement de dev et la procédure pour contribuer au projet (gitflow). Ce document doit aider à l'*onboarding* sur le projet

## Pré-commit (qualité "locale", feedback rapide)

**Configurez** un outil de *git hook* local [avec husky](https://typicode.github.io/husky/), pour exécuter localement, **avant chaque commit** :

- Le linter/formatter (coding styles, code "smells", analyse statique), [avec eslint](https://eslint.org/) par exemple. Pour cela, **créer un script** `npm run validate`
- Une suite de tests, [avec jest](https://jestjs.io/fr/). Les tests peuvent être unitaires, d'intégration, etc. Cette suite de tests est effectuée **sans état** (sans lecture/écriture vers un autre service), via des *mocks* au besoin (tests "internes") On test le comportement correct des modules (**output**) en fonction des **inputs**. Pour cela, **créer un script** `npm run test`

## Pipeline CI (avec GitHub Actions)

[**Créez** un *workflow* Gihtub Actions](https://docs.github.com/fr/actions/how-tos/write-workflows) `.github/workflows/ci.yml` qui se déclenche à chaque **merge** sur la branche principale `main` (*Pull Request* ou *push*) :

1. **Lint et Test** : validation du code et tests unitaires.
2. Analyse statique [SonarCloud](https://www.sonarsource.com/products/sonarqube/cloud/)
3. **Build Image** : Construction de votre image Docker.
4. **Tests Externes** (*boîte noire*) : lancez l'image construite à l'étape 3 à côté d'un ou plusieurs conteneurs de test prévu à cet effet. Un autre conteneur (*runner*) requête l'API pour vérifier qu'elle répond correctement (code status, données, validation, format JSON valide, etc.). Instancier une base de données de test au besoin avec un jeu de données reproductible.
5. Scan des **vulnérabilités** (dépendances) avec [Docker Scout](https://docs.docker.com/scout/)

**Publication** : Si tout passe, **publiez l'image sur votre registre Docker Hub en la taggant automatiquement avec le SHA du commit Git**.

> Quelle est la différence fondamentale entre un test unitaire et le "test externe" demandé dans la CI ? Pourquoi le test boîte noire est-il indispensable avant de *push* sur Docker Hub ?

## Checkpoint

- Tentez de faire un commit avec une erreur de syntaxe ou un test qui échoue. Que se passe-t-il ?
- Montrez l'historique d'une exécution réussie sur GitHub Actions.

## Déploiement continu et stratégies de mise en production (CD)

Nous allons simuler une mise en production de niveau critique, où l'application ne doit subir **aucune interruption de service** (*zero-Downtime*).

> Expliquez la procédure théorique d'[un déploiement Blue-Green](https://www.redhat.com/en/topics/devops/what-is-blue-green-deployment). Comment utilisez-vous le load balancer pour basculer le trafic des utilisateurs de la version *Blue* vers la version *Green* de manière complètement transparente ?

## Déploiement *Blue-Green*

- DB **unique** partagée
- **La base migrée doit supporter l'ancienne (blue) et la nouvelle (green) version de l'application.** (backward compatible)

```text
BLUE APP ─┐
           ├── DB (unique)
GREEN APP ─┘
```

<!-- 
- BLUE = stable
- GREEN = candidate
- migration de la base retro-compatible (méthode expand/contract)
- validation green isolée
- switch proxy
- rollback immédiat au besoin
- stabilisation, migration pour retirer support de l'ancienne version
 -->

## Scénario (sans *breaking change* au niveau du schéma)

**Scénario** (simple) :

- Version *Blue* (v1.0.0) : L'API possède une route `GET /health` qui renvoie `{ "status": "OK" }`. Dans la console, elle logue `[INFO] Request received`.
- Version *Green* (v1.0.1) : Le code de l'API change uniquement le log interne : `[DEBUG] Client called health check on port XXX`. Le contrat d'interface (`{ "status": "OK" }`) reste strictement identique pour le client.

## Mise en place

Deux répertoires sur le serveur `/app/blue` et `/app/green`, chacun contenant son propre fichier `compose.yml`

1. L'état initial : *Blue* est en production, sur `localhost:3001`
2. Nginx est configuré pour rediriger tout le trafic public vers ce port :

~~~bash
# nginx.conf (Version Initiale)
upstream api_servers {
    server api-blue:3001; # Tout le trafic va ici
}
~~~

3. Le déploiement de *Green* : Sans couper le projet *Blue*, **build** la nouvelle image (v1.0.1) et lancer le bloc *Green* sur un autre port, par exemple le port 3002. Les deux systèmes sont actifs en même temps.

~~~bash
#Exemple typique pour déployer green
VERSION="1.0.1" PORT="3002" docker compose -f /app/green/compose.yaml up -d
~~~

<!-- 

Methode A :

Le cas le plus fréquent : Via l'outil de CI/CD (GitHub Actions, GitLab CI)

Si le déploiement est automatisé, c'est job de pipeline qui connaît la version (souvent le tag Git ou le numéro de build) et qui l'injecte dynamiquement.

Exemple dans un workflow GitHub Actions :

~~~yaml
- name: Déployer sur l'environnement passif (Green)
  run: |
    VERSION="${{ github.sha }}" \
    PORT="3002" \
    docker compose -f /app/green/compose.yaml up -d
~~~
Ici, c'est GitHub qui remplace ${{ github.sha }} par l'identifiant unique du code qui vient d'être modifié.

Methode B :

Via un Script Bash central sur votre serveur (deploy.sh)

~~~bash
#!/bin/bash
# deploy.sh

# 1. On récupère la version passée en argument du script
NEW_VERSION=$1 

# 2. Le script détermine qui est l'environnement passif (ex: green)
TARGET_ENV="green"
TARGET_PORT="3002"

# 3. On injecte les valeurs dans la commande Docker
echo "Déploiement de la version $NEW_VERSION sur $TARGET_ENV (Port $TARGET_PORT)..."

VERSION="$NEW_VERSION" PORT="$TARGET_PORT" docker compose -f /app/$TARGET_ENV/compose.yaml up -d

# 4. (Ensuite votre script teste si ça marche et recharge Nginx...)
~~~

Methode C :

Dans un fichier de configuration *global* à la racine du serveur

~~~
# /app/deployment.conf
NEXT_RELEASE_VERSION=1.2.0
GREEN_PORT=3002
BLUE_PORT=3001
~~~

~~~bash
#!/bin/bash
# deploy.sh
# On charge les variables du fichier global en mémoire
source /app/deployment.conf

# On les utilise pour Docker
VERSION="$NEXT_RELEASE_VERSION" PORT="$GREEN_PORT" docker compose -f /app/green/compose.yaml up -d
~~~
 -->

4. **Bascule** : rediriger le trafic dans la configuration du load balancer (nginx)

~~~bash
# nginx.conf
upstream api_servers {
    server api-green:3002; # Le trafic est basculé instantanément
}
~~~

Puis faire la bascule sans *downtine* avec `nginx -s reload` (rechargement de la config *sans* redémarrer le process nginx).

## Scripter la bascule

Pour éviter d'éditer manuellement le fichier `nginx.conf` à chaque déploiement, l'astuce consiste à utiliser un **lien symbolique** pour la configuration de Nginx.

> La méthode des liens symboliques est très utilisée dans les environnements UNIX, notamment pour la mise en production déterministe, comme par l'excellent outil de déploiement [Capistrano](https://capistranorb.com/)

On crée :

- deux fichiers de configuration fixes `api_blue.conf` et `api_green.conf`
- un lien symbolique `api.conf` qui pointe *à chaque instant* vers l'un des deux fichiers
- un script `switch` n'a plus qu'à faire pointer le lien symbolique vers l'environnement choisi avant de recharger Nginx

~~~bash
/etc/nginx/
├── conf.d/
│   └── api.conf -> /etc/nginx/upstream_blue.conf  # Le lien symbolique actif
├── upstream_blue.conf                             # Fichier fixe pour Blue
└── upstream_green.conf                            # Fichier fixe pour Green
~~~

Fichier `upstream_blue.conf` :

~~~bash
upstream api_servers {
    server 127.0.0.1:3001; # Pointe vers le port de Blue
}
~~~

Fichier `upstream_green.conf` :

~~~bash
upstream api_servers {
    server 127.0.0.1:3001; # Pointe vers le port de Blue
}
~~~

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

Le script de bascule `switch` :

~~~bash
#!/bin/bash

# Bascule les requêtes entrantes Nginx vers le cluster de conteneurs de l'API (blue ou green)

# Configuration des chemins
NGINX_DIR="/etc/nginx"
# PATH du fichier du lien symbolique (pointe sur config blue ou green)
LINK_PATH="$NGINX_DIR/conf.d/api.conf"

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

Utilisation :

- L'application est actuellement sur *Blue* (port 3001).
- Déployez la nouvelle version dans le dossier `/app/green` (port 3002) et vous attendez qu'elle soit prête.
- Lancez la bascule instantanée :

~~~bash
switch green
~~~

En cas de problème majeur, faire un *rollback* sur *Blue* :

~~~bash
switch blue
~~~

## Test du *zero-downtime*

Lancer un script qui envoie de nombreuses requêtes en continu

- Méthode *simple* avec cURL :
  
~~~bash
while true; do curl -s -o /dev/null -w "%{http_code}\n" http://localhost/health; sleep 0.1; done
~~~
  
- Méthode *contrôlée* et *avancée* avec un **outil spécialisé de tests de charge** comme [autocannon](https://www.npmjs.com/package/autocannon))

```
# Exemple d'utilisation
# Lance 10 connexions simultanées pendant 60 secondes
npx autocannon -c 10 -d 60 http://localhost:3000/health
```

## Protocole de test à exécuter

Suivre ces étapes pendant que votre test de charge tourne :

1. **Lancez le test de charge** (avec cURL, [k6(Grafana)](https://k6.io/), [autocanon](https://www.npmjs.com/package/autocannon), etc.). Vous devez voir les statuts `200` défiler ou les requêtes s'accumuler.
2. **Modifiez le code de l'API** (version *Green*) : changez uniquement un message de log interne dans votre console (ex: passer de `[INFO]` à `[DEBUG]`). *Rappel : Le format JSON de réponse de l'API doit rester strictement identique pour ne pas créer de breaking change côté client.*
3. **Build et up de Green :** générez la nouvelle image Docker et démarrez le conteneur *Green* sur son port dédié (ex: `3002`), sans toucher à *Blue*.
4. **La Bascule Nginx :** Modifiez le fichier de configuration de Nginx (ou exécuter le script `switch green` prévu à cet effet) pour remplacer l'adresse de l'<em>upstream</em> vers le cluster de conteneurs *Green*.
5. **Le rechargement à chaud :** **Exécutez** la commande suivante pour recharger la configuration de Nginx sans arrêter le serveur :

    ```bash
    docker compose exec nginx nginx -s reload
    ```

6. **Analysez le résultat immédiatement.**
7. Faites la bascule vers *Blue*, puis vers *Green* (*rollback*).
8. **Nettoyer** *Blue* : une fois que le trafic est sur *Green* et qu'on a vérifié que tout fonctionne, on peut couper et supprimer les conteneurs *Blue* (port 3001) pour libérer les ressources.

## Checkpoint

Après un test de charge, montrer les éléments suivants :

- Côté client : le compteur d'erreurs (HTTP 502, 503 ou connexions perdues) doit être **strictement égal à 0**.
- Côté serveur (logs du conteneur de l'API) : vous devez voir les lignes de logs basculer *instantanément* de l'ancien format au nouveau format au milieu du flux de requêtes.

## Questions (réfléchir)

1. Si vous aviez fait un simple `docker compose restart`, qu'aurait affiché votre script de test de charge pendant les quelques secondes de redémarrage ? Quelle erreur HTTP le client aurait-il reçue ?
2. Dans un scénario réel où la Version *Green* apporte une modification du schéma de base de données, pourquoi le fait de simplement basculer Nginx comme on vient de le faire casserait-il l'application des utilisateurs, même si Nginx ne renvoie aucune erreur 502 ?
3. Comment l'utilisation combinée [du pattern **Expand/Contract** ou parallel change](https://martinfowler.com/bliki/ParallelChange.html) au niveau de la base de données permet-elle de résoudre le problème de la Question 2 lors d'une bascule Blue/Green ?

## En cours de consolidation

## Migration (*vanilla*, sans ORM)

**Concevoir** un **script** Node.js autonome (ex: `npm run migrate`) capable de lire des fichiers `.sql` dans un dossier du dépôt `./migrations` et de les **exécuter dans l'ordre chronologique** sur votre base de données. On utilisera **une base de données relationnelle MySQL dockerisée**.

> Comment votre script sait-il quelles migrations ont déjà été appliquées afin d'éviter de ré-exécuter deux fois le même script SQL ? Quelle structure de table devez-vous créer pour gérer cela ? Quelle est la limite de cette approche ? Que doit permettre **un bon outil de migration** de base de données ?

## Checkpoint

- Expliquer votre stratégie de migration

<!-- 
Limite: pas de down (revert)
Un mécanisme de migration doit permettre de rollback !
 -->

## Intégration d'un ORM pour les migrations

> À venir...

## Mise en cache avec Redis

> À venir...

<!-- Votre API a fortement évolué, notamment vos ressources. Vous décider de déployer une v2, et la v1 va arriver à son terme (une date a été communiquée en amont, son utilisation monitorée, cf cours précédent). -->

<!-- Votre schéma évolue : votre table utilisateur possède deux champs : firstname et lastname. En v2, le besoin métier exige un seul champ fullName. Si vous modifiez la base de données en supprimant firstname et lastname pendant que la v1 tourne encore, l'application va crasher (Interruption de service). -->

<!-- 
Attention, la version de l'API (client) n'est pas nécessairement identique à la version de votre appli (interne et bdd) !
 -->

<!-- ## Gestion des Breaking Changes (pattern Expand/Contract)

Vous devez appliquer la [stratégie Expand/Contract (ou Parallel Change)](https://martinfowler.com/bliki/ParallelChange.html) afin de Déployer de manière rétrocompatible, en accord avec le pattern Blue/Green :

- Étape 1 (**Expand**) : Modifiez votre script de migration pour **ajouter** la colonne `fullName` sans supprimer les anciennes colonnes. Modifiez le code de votre API pour qu'elle écrive dans les deux formats mais lise l'un ou l'autre.
- Étape 2 (**Transition**) : **Migrez** les anciennes données (concaténation de l'existant).
- Étape 3 (**Contract**) : Une fois la v2 totalement déployée et la v1 éteinte, appliquez une dernière migration pour **supprimer** firstname et lastname. -->

<!-- Les breaking changes de votre schéma reflettent-ils nécessairement les breaking changes de votre API ? Pourquoi est-il strictement interdit de faire un DROP COLUMN firstname directement lors du déploiement de la version contenant le code de la v2 ? -->

<!-- 
Pré requis : 
- Rappeler les propriétés désirables d'une mise en prod
- Présenter le B/G déploiement avec migration du schéma retrocompatible
 -->

<!-- ## Plan 
- Conteneuriser l'application Express/Node.js
- Multistaged build
- Services dans deux envs :
  - dev : 1 instance api, db, adminer, redis (cache des requetes http). Informations de log print sur l'output du serveur et dans un fichier de log
  - prod/staging (meme ici, simulé en local sur la plateforme Docker) : N replicas de l'api (4), db, redis (activable ou non via var d'env), load balancer nginx devant les replicas, log sur un fichier de log, rotation des secrets pour les jwt
- Pas d'ORM pour l'instant, implémenter un mécanisme de migration manuel dans la db via des scripts node
- CI 
  - Pre cI : git hook :
    - linter, formatter avec code standard, tests unitaires
  - CI avec Github Actions :
    - Linter, formatter avec code standard, tests unitaires/internes (stateless)
    - Build image
    - Tests externe (tests image depuis un service docker comme client test prévu à cet effet), test image comme boite noire, stateful
    - Publication sur votre registre Dockerhub avec version (tag commit ou date)
- CD : 
  - Propriétés d'une bonne mise en prod
  - Manuelle 
    - Procédure de Déploiement *blue green*
    - Scénario avec breaking changes (expand/contract)
- Sécuriser : rate-limiting avec fail2ban avec reverse proxy.
- -->
