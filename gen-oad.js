const swaggerAutogen = require("swagger-autogen")();

//Fichier de sortie (doc générée)
const outputFile = "./oad.json";
//Les routes à documenter (via des annotations swagger)
const endpointsFiles = [
    "./index.js"
];
//Métadonnées générales
const doc = {

    info: {
        title: 'Service de billeterrie de concerts',
        version: '0.1',
        description: 'Documentation du service de billeterrie',
    },
    schemes: ["http"],
};

//Génération de la doc
swaggerAutogen(outputFile, endpointsFiles, doc);
