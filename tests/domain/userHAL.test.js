const hal = require('../../src/service/hal');


describe('=== TEST DOMAINE : Formatage HAL d\'un Utilisateur ===', () => {

    it('devrait transformer un utilisateur brut en un Resource Object HAL valide', () => {
        const fakeUserData = {
            id: 1,
            pseudo: 'pocky_dev',
            email: 'pocky@example.com',
        };
        const baseUrl = '/v1';

        // WHEN : On applique la fonction pure du domaine
        const result = hal.userToResourceObject(fakeUserData, baseUrl);

        // THEN : On valide le contrat d'interface et la structure HAL attendue
        
        // 1. Validation de l'encapsulation de l'identité (_embedded)
        expect(result).toHaveProperty('_embedded');
        expect(result._embedded.pseudo).toBe('pocky_dev');

        // 2. Validation des hypermédias (_links) et de la construction de l'URL
        expect(result).toHaveProperty('_links');
        expect(result._links).toHaveProperty('self');
        
        // On vérifie que le pseudo est bien injecté à la fin de l'URL de l'arborescence
        expect(result._links.self.href).toBe('/v1/utilisateurs/pocky_dev');
    });
});