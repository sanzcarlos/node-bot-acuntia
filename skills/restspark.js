//
// Command: update users
//
module.exports = function (controller) {
    const ciscospark = require('ciscospark/env');
    const _ = require('lodash');

    controller.hears(['^update users @[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'], 'direct_message,direct_mention', (bot, message) => {

        const ciscospark = require('ciscospark/env');
        const letters = "abcdefghijklmnopqrstuvwxyz";
        var users = {};
        var completed = 0;
        var promises = [];

        // Añadimos a la lista de promesas la búsqueda de usuarios por cada letra del abecedario para mostrar todos los usuarios
        for (i = 0; i < letters.length; i++) {
            var options = { displayName: letters[i] };
            var promise = ciscospark.people
                .list(options);
            promises.push(promise);
        }
        new Promise((resolve, reject) => {
            bot.reply(message, "**Retreiving all users...**");
            promises.forEach((value) => {
                value.then((people) => {
                    var person;
                    for (x = 0; x < people.items.length; x++) {
                        person = people.items[x];
                        users[person.id] = person.emails;
                    }
                    completed++;
                    if (completed === letters.length)
                        resolve(users);
                }).catch((reason) => {
                    reject(reason);
                });
            })
        }).then((users) => {
            var reply = `*All users retreived, now we're going to try to update the data, the amount is ${Object.keys(users).length}*<br/>`;
            reply += "**Updating their info...**<br/>";
            reply += "*Function not implemented yet*";
            bot.reply(message, reply);
        }).catch((reason) => {
            bot.reply(message, `${reason}`);
        });
    });
}