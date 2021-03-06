/*jslint node:true, plusplus: true*/
/*global proccess*/
var bot,
    irc = require("irc"),
    events = require('events'),
    ps = require('ps-node'),
    eventEmitter = new events.EventEmitter(),
    config = {
        channels: ["#lobby"],
        server: "ygopro.us",
        botName: "DuelServ"
    };

function randomString() {
    'use strict';
    var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        randomPoz,
        i = 0,
        randomstring = '';
    for (i; i < 5; i++) {
        randomPoz = Math.floor(Math.random() * charSet.length);
        randomstring += charSet.substring(randomPoz, randomPoz + 1);
    }
    return randomstring;
}

bot = new irc.Client(config.server, config.botName, {
    channels: config.channels
});

bot.on('registered', function () {
    'use strict';
    if (process.env.OPERNAME && process.env.OPERPASS) {

        setTimeout(function () {
            bot.send('oper', process.env.OPERNAME, process.env.OPERPASS);
            process.nextTick(function () {
                bot.send('sajoin', config.botName, "#public");
            });

        }, 2000);
    }

});

function duelrequest(challenger, challengedParty, roompass) {
    'use strict';
    eventEmitter.emit('announce', {
        clientEvent: 'duelrequest',
        target: challengedParty,
        from: challenger,
        roompass: roompass
    });
}

function kill(challenger, challengedParty) {
    'use strict';
    eventEmitter.emit('announce', {
        clientEvent: 'kill',
        target: challengedParty,
        from: challenger
    });
}

bot.addListener("message", function (from, to, message) {
    'use strict';
    var command = message.split(' '),
        pass = randomString(5),
        ctypes = ['!tcg', '!ocg', '!duel', '!tag'],
        codes = {
            '!tcg': '200OOO8000,0,5,1,U,',
            '!ocg': '100OOO8000,1,5,1,U',
            '!duel': '200OOO8000,0,5,1,U,',
            '!tag': '220OOO16000,0,5,1,U,',
            '!shadowDuel': '301OOO8000,0,5,1,U,',
            '!bp3': '410OOO8000,0,5,1,U,'
        };
    if ((ctypes.indexOf(command[0]) === -1)) {
        return;
    } else {
        if (command === '!tag') {
            duelrequest(from, command[1], codes[command[0]] + pass);
            duelrequest(command[1], from, codes[command[0]] + pass);
            if (command.length === 4) {
                duelrequest(command[2], from, codes[command[0]] + pass);
                duelrequest(command[3], from, codes[command[0]] + pass);
            }
        } else {
            duelrequest(from, command[1], codes[command[0]] + pass);
            duelrequest(command[1], from, codes[command[0]] + pass);
        }
    }
});

bot.addListener("message", function (from, to, message) {
    'use strict';
    var command = message.split(' ');
    if (command[0] !== '!startDraft' && from !== "#server") {
        return;
    }
    //start tournament
});



eventEmitter.bot = bot;
module.exports = eventEmitter;

function start() {
    'use strict';
    //get users

    //get piles

    //send each user pack

}