//
// Copyright (c) 2017 Cisco Systems
// Licensed under the MIT License 
//


//
// BotKit initialization
//

var Botkit = require('botkit');
var config = require('./conf.json');

if (!config.SPARK_TOKEN) {
    console.log("Could not start as this bot requires a Cisco Spark API access token.");
    console.log("Please add env variable SPARK_TOKEN on the command line");
    console.log("Example: ");
    console.log("> SPARK_TOKEN=XXXXXXXXXXXX PUBLIC_URL=YYYYYYYYYYYYY node helloworld.js");
    process.exit(1);
}

if (!config.PUBLIC_URL) {
    console.log("Could not start as this bot must expose a public endpoint.");
    console.log("Please add env variable PUBLIC_URL on the command line");
    console.log("Example: ");
    console.log("> SPARK_TOKEN=XXXXXXXXXXXX PUBLIC_URL=YYYYYYYYYYYYY node helloworld.js");
    process.exit(1);
}

var env = config.NODE_ENV || "development";

var controller = Botkit.sparkbot({
    log: true,
    public_address: config.PUBLIC_URL,
    ciscospark_access_token: config.SPARK_TOKEN,
    secret: config.SECRET, // this is a RECOMMENDED security setting that checks of incoming payloads originate from Cisco Spark
    webhook_name: config.WEBHOOK_NAME || ('built with BotKit (' + env + ')')
});

var bot = controller.spawn({
});

// Load BotCommons properties
bot.commons = {};
bot.commons["healthcheck"] = config.PUBLIC_URL + "/ping";
bot.commons["up-since"] = new Date(Date.now()).toGMTString();
bot.commons["version"] = "v" + require("./package.json").version;
bot.commons["owner"] = config.BOT_OWNER;
bot.commons["support"] = config.BOT_SUPPORT;
bot.commons["platform"] = config.BOT_PLATFORM;
bot.commons["nickname"] = config.BOT_NICKNAME || "unknown";
bot.commons["code"] = config.BOT_CODE;

// Start Bot API
controller.setupWebserver(process.env.PORT || 3000, function (err, webserver) {
    controller.createWebhookEndpoints(webserver, bot, function () {
        console.log("Cisco Spark: Webhooks set up!");
    });

    // installing Healthcheck
    webserver.get('/ping', function (req, res) {
        res.json(bot.commons);
    });
    console.log("Cisco Spark: healthcheck available at: " + bot.commons.healthcheck);
});

// Load skills
var normalizedPath = require("path").join(__dirname, "skills");
require("fs").readdirSync(normalizedPath).forEach(function (file) {
    try {
        require("./skills/" + file)(controller);
        console.log("Cisco Spark: loaded skill: " + file);
    }
    catch (err) {
        if (err.code == "MODULE_NOT_FOUND") {
            if (file != "utils") {
                console.log("Cisco Spark: could not load skill: " + file);
            }
        }
    }
});

// Utility to add mentions if Bot is in a 'Group' space
bot.enrichCommand = function (message, command) {
    var botName = config.BOT_NICKNAME || "BotName";
    if ("group" == message.roomType) {
        return "`@" + botName + " " + command + "`";
    }
    if (message.original_message) {
        if ("group" == message.original_message.roomType) {
            return "`@" + botName + " " + command + "`";
        }
    }


    return "`" + command + "`";
}

