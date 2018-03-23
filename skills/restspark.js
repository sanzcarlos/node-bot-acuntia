//
// Command: update users
//
module.exports = function (controller) {
    const ciscospark = require('ciscospark/env');
    const _ = require('lodash');
    const peoplespark = require('../people/people');

    controller.hears(['^update users @[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'], 'direct_message,direct_mention', (bot, message) => {

        console.log(message.match.input.split(" "));
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
            // Anunciar que el primer paso ya se ha completado
            var reply = `*All users retreived, now we're going to try to update the data, the amount is ${Object.keys(users).length}*<br/>`;
            reply += "**Updating their info...**<br/>";
            bot.reply(message, reply);

            var usersId = Object.keys(users);
            for (j = 0; j < usersId.length; j++) {
                var newEmails = users[usersId[j]];
                var domainContained = message.match.input.split(" ")[2];
                var hasDomainAlready = false;
                var username = "";

                for (i = 0; i < users[usersId[j]].length && !hasDomainAlready; i++) {
                    username = newEmails[i].split("@")[0]
                    var domain = newEmails[i].split("@")[1];
                    if (_.upperCase(domain) === _.upperCase(domainContained))
                        hasDomainAlready = true;
                }
                if (!hasDomainAlready) {
                    newEmails.push(`${username}${domainContained}`);
                    console.log(`${usersId[j]}: ${newEmails}`);
                    //peoplespark.updatePerson(usersId[j], newEmails);
                }
            }
            bot.reply(message, "*All users have been updated*");
        }).catch((reason) => {
            bot.reply(message, `${reason}`);
        });
    });
}