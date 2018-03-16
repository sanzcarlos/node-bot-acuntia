//
// Command: help
//
module.exports = function (controller) {

    controller.hears(["help", "who"], 'direct_message,direct_mention', function (bot, message) {
        var text = "Esto es lo que puedo hacer:";
        text += "\n- " + bot.enrichCommand(message, ".commons") + ": muestra información acerca del bot.";
        text += "\n- " + bot.enrichCommand(message, "help") + ": muestra información sobre los comandos.";
        text += "\n- " + bot.enrichCommand(message, "update users [email_domain]") + ": Añade un correo electrónico a los de cada usuario que no lo tengan. Ejemplo *update users @dominio.es*";
        bot.reply(message, text);
    });
}
