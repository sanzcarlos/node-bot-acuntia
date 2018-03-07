//
// Command: show user
//
module.exports = function (controller) {

    // Test command to show users
    controller.hears(['^show user (.*){3,}'], 'direct_message,direct_mention', (bot, message) => {

        // Obtenemos el nombre de los parametros
        var input = message.text.split(/\s+/);

        if (input.length === 4)
            var encodedName = encodeURI(`${input[2]} ${input[3]}`);
        else if (input.length === 3)
            var encodedName = input[2];

        request.get(`https://api.ciscospark.com/v1/people?displayName=${encodedName}`, {
            json: true,
            auth: {
                bearer: process.env.SPARK_TOKEN
            }
        }, (error, response, body) => {
            if (error) {
                console.log("Ha ocurrido un error.");
            }
            if (response.statusCode === 200) {
                if (body.items.length !== 0) {
                    bot.reply(message, `El usuario es: ${body.items[0].displayName}<br>Correo principal: ${body.items[0].emails[0]}`);
                } else {
                    bot.reply(message, `No se encuentra dicho usuario.`);
                }
            }
        });
    });
}