function publicChat(ws) {

    ws.on('message', function(msg) {
        console.log('Message reçu :', msg.toString());
        ws.send(`Écho : ${msg}`);
    });
}

module.exports = { publicChat };