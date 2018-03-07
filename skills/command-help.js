//
// Command: help
//
module.exports = function (controller) {

    controller.hears(["help", "who"], 'direct_message,direct_mention', function (bot, message) {
        var text = "Esto es lo que puedo hacer:";
        text += "\n- " + bot.enrichCommand(message, ".commons") + ": muestra información acerca del bot.";
        text += "\n- " + bot.enrichCommand(message, "help") + ": muestra información sobre los comandos.";
        text += "\n- " + bot.enrichCommand(message, "show user &lt;firstName&gt; [lastName]") + ": muestra información con los datos indicados.";
        bot.reply(message, text);
    });
}
