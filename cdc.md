# Cahier des charges : Service de billeterie de concerts

- [Cahier des charges : Service de billeterie de concerts](#cahier-des-charges--service-de-billeterie-de-concerts)
  - [Dictionnaire des données](#dictionnaire-des-données)
  - [Ressources](#ressources)
  - [Représentations acceptées par le client](#représentations-acceptées-par-le-client)
    - [La liste des concerts à venir `/concerts`](#la-liste-des-concerts-à-venir-concerts)
  - [Représentations acceptées par le serveur (formulaires)](#représentations-acceptées-par-le-serveur-formulaires)
  - [Parcours nominal (progression typique des évènements)](#parcours-nominal-progression-typique-des-évènements)
  - [Cas d'erreurs](#cas-derreurs)
  - [Exemples de use-case (parcours clients)](#exemples-de-use-case-parcours-clients)


## Dictionnaire des données

> Voir [dictionnaire des données](https://www.univ-constantine2.dz/CoursOnLine/Benelhadj-Mohamed/co/grain3_2.html)

Légende:

- AN : alphanumérique
- N: numérique
- A: alphabétique
- D: Date (et datetime)
- B: Booléen
- Enum : valeur appartenant à une énumération

|  Code 	| Désignation  	| Type  	|  Taille (nombre de caractères ou de *bytes* (octets)) 	| Remarques/Contraintes  	| Obligatoire |
|---	|---	|---	|---	|---	|---	|
|   `pseudo`	|  L'identifiant public d’un utilisateur 	|   AN	|   15	|    Unique	| Oui |
|   `description`	|  Un texte court qui décrit le concert, son contexte 	|   AN	|   1000	|   	| Non |
|   `performer`	|   Le nom de l'artiste qui se produit lors du concert	|   AN	|  50 	|   	|Oui |
|   `date_start`	|   Date et horaire du concert	|  D 	|   20	|  Au format `YYYY-mm-dd HH:mm:ssZ` (UTC)	|Oui |
|   `local_time`	|   Heure à laquelle démarre le concert	|  D 	|   20	|  Au format `HH:mm` (localisée)	|Non |
|   `local_date`	|   Date du concert	|  D 	|   20	|  Au format `dd/mm/YY` (localisée)	|Non |
|   `date_booking`	|   Date à laquelle l’utilisateur réserve sa place	|  D 	|   20	|   Attention, ce n'est pas la date à laquelle iel confirme la réservation.	|Oui |
|   `location`	|  Lieu, salle où se déroule le concert  	|   AN	|   120	|   	|Oui |
|   `nb_seats`	|  Le nombre de places disponibles à la réservation pour un concert  	|   N	| 	| Doit être positif  	|Oui |
|   `status_reservation`	|  État d’une réservation. 3 valeurs possibles : `À confirmer`, `Confirmée` ou `Annulée`  	|   A	|   14	|  Lorsqu’une réservation est créée, elle a par défaut le statut `to_confirm`. Elle doit ensuite être confirmée par l'utilisateur. Un utilisateur qui a confirmé sa réservation ne peut plus l’annuler ! 	|Oui |
|   `to_confirm`	|  Statut d’une réservation en attente de confirmation, valeur `À confirmer`  	|   Enum	|   14	|   Ce statut peut passer à `to_confirm` ou `canceled`	|Oui |
|   `confirmed`	|  Statut d’une réservation confirmée, valeur `Confirmée`  	|   Enum	|   14	|   Ne peut s’appliquer que sur un statut dans l’état `to_confirm`. Cet état ne peut plus changer par la suite	|Oui |
|   `canceled`	|  Statut d’une réservation annulée , valeur `Annulée` 	|   Enum	|   14	|   Ce statut ne peut plus changer par la suite	|Oui |
|   `id_concert`	|  L'identifiant d’un concert 	|   N	|  Entier encodé sur 64 bits 	|    Identifie de manière *unique* un concert	| Oui |
|   `id_reservation`	|  L'identifiant d’une réservation 	|   N	|  Entier encodé sur 64 bits 	|    Identifie de manière *unique* une réservation	| Oui |
|   `password`	|  Le mot de passe utilisateur 	|   AN	|  28	| Doit être "fort" (à définir), taille minimale de 12 bytes  | Oui |
|   `id_user`	|  L'identifiant d'un utilisateur 	|   N	|  Entier encodé sur 64 bits	| Unique  | Oui |
|   `remainingAttendeeCapacity`	| Nombre de places restantes pour un concert 	|   N	|  Entier encodé sur 64 bits	| Positif ou nul  | Oui |
|   `role`	| Définit les actions autorisés sur le service 	|   A	| Deux valeurs possibles : `client` ou `admin`	| A  | Oui |
|   `admin`	| Role réservé au gestionnaire du service 	|   Enum	| 	|   |  |
|   `client`	| Role réservé aux clients du service 	|   Enum	| 	| Attribué par défaut à un nouvel utilisateur  |  |

Les spécifications initiales sont encore trop ouvertes. Voici quelques questions métier à éclaircir:

- Quelle est la date limite pour annuler une réservation ? Jusqu'à la dernière minute ? Une semaine ? Un jour ?

## Ressources

- *Les liste des concerts à venir* : GET
- *Les informations sur un concert*  : GET
- *La réservation d'une place de concert* : GET, DELETE, PUT
- *La liste des réservations pour un concert* : POST, GET (authentifié)
- *Mes réservations* : GET

> Le dictionnaire des données et les ressources nous permettront de concevoir le schéma de la base de données. Attention ressource n'implique pas nécessairement une table/une entité ! Et inversement. Par exemple, les utilisateurs **ne sont pas** une ressource, ce ne sont pas des informations exposées par le système !

| Ressource  | URL  | Méthodes HTTP  | Paramètres d'URL (variations)  | Commentaires  |
|---|---|---|---|---|
| *Les liste des concerts à venir*  | `/concerts`  | GET  |  `offset`, `limit` | Résultats paginés. Seuls les concerts *à venir* sont affichés, complets ou non  |
| *Les informations sur un concert* | `/concerts/{id-concert}`  |  GET | X  |   |
| *La réservation d'une place de concert*  | `/reservations/{id-reservation}`  | GET, DELETE, PUT  | X  | Ne doit être accessible qu’au propriétaire de la réservation |
| *La liste des réservations pour un concert*  | `/concerts/{id-concert}/reservations`   | POST, GET  | X  | GET est réservé au gestionnaire du site (role `admin`)  |
| *Mes réservations*  | `/me/reservations`  | GET  | X  | Permet au client d'accéder à sa liste de réservations  |

## Représentations acceptées par le client

Lse service renverra des données au format `application/hal+json`, en suivant la spécification [HAL](https://datatracker.ietf.org/doc/html/draft-kelly-json-hal-08)

On définit ici les représentations des ressources envoyées par le serveur au client.

### La liste des concerts à venir `/concerts`

Schéma type

~~~JSON
{
  "_links": [
    {
      "self": {
        "href": "/v1/concerts{?offset=0&limit=10}",
        "templated": true,
        "type": "string",
        "name": true
      },
      "current_page": "/v1/concerts?offset=0&limit=10",
      "next_page": "/v1/concerts?offset=10&limit=10",
      "prev_page": null
    }
  ],
  "_embedded": [
    //...
    {
      "_links": [
        {
          "self": {
            "href": "/v1/concerts/1",
            "templated": false,
            "type": "string"
          },
          "reservation": {
            "href": "/v1/concerts/1/reservations",
            "templated": false,
            "type": "string"
          }
        }
      ],
      "remainingAttendeeCapacity": 500,
      "date_start": "2028-07-17T19:00:00Z",
      "local_date": "17/07/2028",
      "local_hour": "21:00:00",
      "performer": "The Midnight Echo",
      "location": "Bordeaux (Arkéa Arena)"
    }
    //...
  ],
  "total_items": 18,
  "created_at": "2026-04-29T11:54:07.670Z"
}
~~~

## Représentations acceptées par le serveur (formulaires)

Le client enverra sa représentation au format `application/x-www-form-urlencoded` (formulaire), soit de simples `clef=valeur` dans le corps de la requête HTTP.


## Parcours nominal (progression typique des évènements)

Scénario nominal (où tout se passe bien)

1. Un utilisateur accède à la liste des concerts
2. L'utilisateur repère un concert qui l'intéresse, accède aux détails sur le concert
3. L'utilisateur décide de réserver une place pour le concert
4. L'utilisateur confirme sa réservation

## Cas d'erreurs

> À venir.

## Exemples de use-case (parcours clients)

> À venir