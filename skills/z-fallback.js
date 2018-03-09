//
// Fallback Command
//
module.exports = function (controller) {

    controller.hears(["(.*)"], 'direct_message,direct_mention', function (bot, message) {
        var mardown = "Lo siento, no he entendido lo que me quieres decir.<br/>Prueba: "
            + bot.enrichCommand(message, "help");
            
        bot.reply(message, mardown);
    });
}