//
// Command: show user
//
module.exports = function (controller) {

    var request = require('request');

    const options = {
        json: true,
        auth: {
            bearer: process.env.SPARK_TOKEN
        }
    };

    const baseURI = "https://api.ciscospark.com/v1/";

    module.exports.retrieveUser = (bot, message, fullName) => {
        request.get(`${baseURI}/people?displayName=${fullName}`, options, (error, response, body) => {
            if (error) {
                console.log(`[ERROR]: ${error.message}`);
            }
            switch (response.statusCode) {
                case 200:
                var solution = "";
                    if (body.items.length === 1) {
                        solution += `El usuario es: ${body.items[0].displayName}<br>Correo principal: ${body.items[0].emails[0]}`;
                    } else if (body.items.length > 1) {
                        var solution = `Los usuarios son:<br>`
                        for (i = 0; i < body.items.length; i++) {
                            solution += `<br>--------------------------<br>Usuario[${i}]: ${body.items[i].displayName}<br>Correo principal: ${body.items[i].emails[0]}`
                        }
                    } else {
                        solution = `No se encuentran usuarios con estos parametros.`;
                    }
                    bot.reply(message, solution);
                    break;
                case 400:
                case 401:
                case 403:
                case 404:
                case 409:
                case 429:
                    break;
                case 500:
                case 503:
                    break;
                default:
                    break;
            }
        });
    }
}