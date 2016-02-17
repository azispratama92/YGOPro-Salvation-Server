/*jslint node: true*/
'use strict';
console.log('?starting deckstorage');
var deck = {
    owner: '',
    name: '',
    main: [],
    side: [],
    extra: [],
    description: []
};


var
    Primus = require('primus'),

    Socket = require('primus').createSocket({
        iknowclusterwillbreakconnections: true
    }),
    client = {
        write: function () {
            console.log('system not ready yet');
        }
    },
    Datastore = require('nedb'),
    deckStorage = new Datastore({
        filename: '../databases/deckStorage.nedb',
        autoload: true
    });

function verifyUser(username) {
    deckStorage.find({
        '_id': username
    }, function (err, docs) {
        if (docs.length === 0) {
            deckStorage.insert({
                '_id': username
            });
        }
    });
}

function reply(username, replaymessage) {

}

function onDB(data) {

    if (!data.deck) {
        return;
    }
    if (!data.room) {
        return;
    }
    console.log('processing', data.command);
    switch (data.command) {
    case 'new':

        break;
    case 'save':
        if (data.deck['_.id'] === undefined) {
            console.log('no ID!');
            deckStorage.insert(data.deck, function (err) {
                console.log('attempting reply')
                client.write({
                    action: 'deckreply',
                    clientEvent: 'deck',
                    command: 'save',
                    note: 'newdeck!',
                    room: data.room
                });
            });
        } else {
            deckStorage.update({
                username: data.deck.username,
                name: data.deck.name
            }, data.deck, function (err, numReplaced) {
                client.write({
                    action: 'deckreply',
                    clientEvent: 'deck',
                    command: 'save',
                    room: data.room
                });
            });
        }

        break;
    case 'delete':
        deckStorage.remove({
            username: data.deck.username,
            name: data.deck.name
        }, {}, function (err, numRemoved) {
            client.write({
                action: 'deckreply',
                clientEvent: 'delete',
                command: 'delete',
                room: data.room
            });
        });
        break;

    case 'get':
        deckStorage.find({
            owner: data.username
        }, function (err, docs) {
            client.write({
                action: 'deckreply',
                clientEvent: 'deck',
                command: 'get',
                decklist: docs,
                room: data.room
            });
        });
        break;

    }
}

function onConnectGamelist() {
    console.log('ds, connected to gamelist')
    client.write({
        action: 'internalServerLogin',
        password: process.env.OPERPASS,
        gamelist: false,
        registry: false
    });
}

function onCloseGamelist() {

}
setTimeout(function () {
    client = new Socket('ws://127.0.0.1:24555'); //Connect the God to the tree;

    client.on('data', onDB);
    client.on('open', onConnectGamelist);
    client.on('close', onCloseGamelist);

}, 5000);

require('fs').watch(__filename, process.exit);