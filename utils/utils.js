/**
 * Función para manejar la respuesta de la petición HTTP teniendo en cuenta el código de estado devuelto por ésta.
 * @param {request.Response} response 
 * @param {*} body 
 * @param {function} action 
 */
function responseHandler(response, body, action) {
    switch (response.statusCode) {
        case 200:
            action();
            break;
        case 400:
            console.log(`Petición incorrecta.\nMensaje: ${body.message}`);
            break;
        case 403:
            console.log(`No permitido.\nMensaje: ${body.message}`);
            break;
        case 401:
            console.log("Autenticación no realizada.");
            break;
        case 404:
            console.log(`No encontrado.\nMensaje: ${body.message}`);
            break;
        case 409:
            console.log(`Acción no permitida porque hay conflito con otro.\nMensaje: ${body.message}`);
            break;
        case 429:
            console.log("Not found.");
            break;
        case 500:
            console.log("Error en el servidor.");
            break;
        case 503:
            console.log("El servidor está teniendo muchas peticiones.")
            break;
    }
}

module.exports = {
    responseHandler
}