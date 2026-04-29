const swaggerAutogen = require("swagger-autogen")();

//Fichier de sortie (doc générée)
const outputFile = "./oad.json";
//Les routes à documenter (via des commentaires dédiés)
const endpointsFiles = [
  "./controller/v1/concertController.js",
];
//Métadonnées générales
const doc = {
  info: {
    title: "Service de billetterie de concerts",
    description: "Projet fil rouge",
  },
  host: "",
  schemes: ["http"],
};

//Génération de la doc
swaggerAutogen(outputFile, endpointsFiles, doc);
