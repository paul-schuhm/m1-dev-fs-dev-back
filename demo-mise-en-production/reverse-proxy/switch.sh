#!/bin/bash

# Script de bascule sur une nouvelle version, sans down-time, avec la méthode Blue-Green

VERSION=$1

if [ -z "$VERSION" ]; then
    echo "Erreur : spécifier une version à déployer (ex: ./switch.sh v1.2.0)"
    exit 1
fi

# 1. Détecter quelle couleur tourne actuellement
if docker ps --format '{{.Names}}' | grep -q "billetterie-blue"; then
    CURRENT_COLOR="blue"
    NEXT_COLOR="green"
else
    CURRENT_COLOR="green"
    NEXT_COLOR="blue"
fi

echo "Version active actuelle : billetterie-$CURRENT_COLOR"
echo "Préparation du switch vers la version $VERSION sur : billetterie-$NEXT_COLOR"

# 2. Lancer la NOUVELLE version de la billetterie en parallèle
APP_VERSION=$VERSION COLOR=$NEXT_COLOR docker compose \
  -f ../billetterie/compose.prod.yaml \
  --project-directory ../billetterie \
  -p billetterie-$NEXT_COLOR \
  up -d

# 3. Attendre que le conteneur soit prêt
echo "Attente du démarrage des nouveaux conteneurs..."
sleep 5 

# 4. LA MÉTHODE SYMLINK
# -s : créer un lien symbolique
# -f : forcer (écrase l'ancien lien s'il existe)
# -n : traite le lien existant comme un fichier normal (évite les bugs de dossiers)
echo "Mise à jour du lien symbolique vers nginx.$NEXT_COLOR.conf"
ln -sfn nginx.$NEXT_COLOR.conf nginx.conf

# 5. Hot reload du Reverse Proxy Nginx
docker compose -f compose.yaml exec -T nginx nginx -s reload
echo "Trafic public redirigé vers billetterie-$NEXT_COLOR !"

# 6. Nettoyage de l'ancienne version
echo "Arrêt et suppression de l'ancienne version (billetterie-$CURRENT_COLOR)..."
docker compose -f ../billetterie/compose.prod.yaml -p billetterie-$CURRENT_COLOR down

echo "Déploiement Blue-Green terminé avec succès !"