const request = require('request');
const queryfy = require('query-string');
const _ = require('lodash');
const responseHandler = require('../utils/utils.js').responseHandler;

/** Options for the HTTP Request Header */
const options = {
    json: true,
    auth: {
        bearer: process.env.CISCOSPARK_ACCESS_TOKEN
    }
}

// Version of the API to use
const version = "1";
// Base URI for the people implementation
const baseURI = `https://api.ciscospark.com/v${version}/people`;

/**
 * Constante que almacena todas las claves que tienen un objeto de tipo usuario devuelto por una petición HTTP
 */
const peopleResponseKeys = [
    "id", "emails", "displayName", "firstName", "lastName", "avatar", "orgId", "roles", "licenses", "timezone", "lastActivity", "created", "type", "loginEnabled", "status"
]
/**
* Descripciones en distintos idiomas de una persona
*/
var peopleResponseKeysDesc = require("./keys_desc.json");

/**
 * Función para listar a las personas con una serie de parametros
 * @param {object} queryParams {email, displayName, id, orgId, max}
 */
function listPeople(queryParams) {
    const query = queryfy.stringify(queryParams);
    request.get(`${baseURI}?${query}`, options, (error, response, body) => {
        if (error)
            console.log(`[ERROR]: ${error}`);
        else {
            responseHandler(response, body, () => {
                var persons = body.items;
                if (persons.length === 1) {
                    var person = persons[0];
                    printUser(person);
                } else if (persons.length > 1) {
                    for (i = 0; i < persons.length; i++) {
                        printUser(persons[i]);
                        console.log("-------------------");
                    }
                } else {
                    console.log("No existe ninguna persona con dichos parámetros.");
                }
            });
        }
    });
}

/**
 * Función que te permite crear un usuario pasandole una serie de parámetros
 * @param {object} userInfo {emails*, displayName, firstName, lastName, avatar, orgId, roles, licenses}
 */
function addPerson(userInfo) {
    // Parámetros INDISPENSABLES
    var requiredParameters = ['emails'];
    // Parámetros recibidos
    var passedParameters = Object.keys(userInfo);

    // Se comprueba que están los parametros indispensables
    if (requiredCorrect(passedParameters, requiredParameters)) {
        // Objeto que se pasa en el HTTP POST para realizar la petición
        var oUser = {};
        // Rellenamos el objeto con los parámetros
        for (j = 0; j < passedParameters.length; j++) {
            oUser[passedParameters[j]] = userInfo[passedParameters[j]];
        }
        // Realizamos la petición
        request.post(baseURI, options, (error, response, body) => {
            if (error)
                console.log(`[ERROR]: ${error}`);
            else {
                responseHandler(response, body, () => {

                });
            }
        }).form(oUser);
    } else {
        console.log("Faltan parámetros en la petición.");
    }
};

/**
 * 
 * @param {string} id Id del usuario a cambiar
 * @param {object} userChanges Objeto con los cambios pertinentes {emails*, displayName*, firstName*, lastName*, avatar*, orgId*, roles*, licenses*}
 */
function updatePerson(id, userChanges) {
    // Parámetros INDISPENSABLES
    var validParameters = ['emails', 'displayName', 'firstName', 'lastName', 'avatar', 'orgId', 'roles', 'licenses'];

    if (id === undefined || _.isEmpty(id) || _.isEmpty(userChanges) || userChanges === undefined) {
        console.log("Ninguno de los parámetros pueden ser valores vacíos.")
    } else if (_.intersection(validParameters.sort(), Object.keys(userChanges).sort()).length === 0) {
        console.log("Ninguno de los parámetros que se han pasado se pueden modificar en el cliente.");
    } else {
        // Recogemos los datos de un usuario
        request.get(`${baseURI}/${id}`, options, (error1, response1, body1) => {
            if (error1)
                console.log(`[ERROR]: ${error1}`);
            else {
                responseHandler(response1, body1, () => {
                    // Comparamos los valores pasados por el usuario y los que devuelve la petición
                    const userInfo = body1;
                    const userInfoUpdated = updateInfoUser(userInfo, userChanges);
                    request.put(`${baseURI}/${id}`, options, (error2, response2, body2) => {
                        if (error2)
                            console.log(`[ERROR]: ${error2}`);
                        else {
                            responseHandler(response2, body2, () => {
                                if (userInfoWasUpdated(body2, userInfoUpdated)) {
                                    // Acción si han cambiado los valores
                                    console.log("OK");
                                } else {
                                    console.log("NOK");
                                }
                            });
                        }
                    }).form(userInfoUpdated);
                });
            }
        });
    }
}

/**
 * Función para imprimir los valores importantes de una persona
 * @param {'object'} person objeto de la lista items de la petición de listar personas
 */
function printUser(person) {
    // Inicialización del mensaje de respuesta
    var textResponse = "";
    var keysResponse = Object.keys(person);

    // Recorremos el array de claves que tiene la respuesta HTTP GET
    for (x = 0; x < keysResponse.length; x++) {
        textResponse += `${peopleResponseKeysDesc.ES[keysResponse[x]]}: ${person[keysResponse[x]]}`;
        if (x !== keysResponse.length - 1)
            textResponse += '\n';
    }
    // Imprimimos el mensaje
    console.log(textResponse);
}

/**
 * Función para comprobar que se han pasado los parámetros indispensables para realizar la petición
 * @param {array} passed 
 * @param {array} required 
 */
function requiredCorrect(passed, required) {
    return _.isEqual(_.intersection(passed.sort(), required.sort()), required.sort());
}

/**
 * Función que se encarga de actualizar los datos de la persona según la petición de los datos que se hace de la misma según un objeto con claves permitidas
 * @param {object} userInfo objeto completo
 * @param {object} userChanges objeto con algunas claves con sus valores respectivos con los cambios
 */
function updateInfoUser(userInfo, userChanges) {
    var userInfoUpdated = userInfo;
    const uCKeys = Object.keys(userChanges);

    for (i = 0; i < uCKeys.length; i++) {
        userInfoUpdated[uCKeys[i]] = userChanges[uCKeys[i]];
    }

    return userInfoUpdated;
}

/**
 * Comprobar que un usuario ha realmente cambiado algún valor
 * @param {object} userResponse objeto con la información del usuario devuelto por la petición HTTP
 * @param {object} userInfoUpdated  objeto con la información del usuario con los parámetros recalculados según lo que el usuario quiere cambiar
 */
function userInfoWasUpdated(userResponse, userInfoUpdated) {
    const uIUK = Object.keys(userInfoUpdated);
    var result = true;

    for (i = 0; i < uIUK.length && result; i++) {
        if (!_.isEqual(userResponse[uIUK[i]], userInfoUpdated[uIUK[i]]))
            result = false;
    }

    return result;
}

module.exports = {
    listPeople,
    addPerson,
    updatePerson
}