const http = require('http');

const requestListener = async (req, res) => {
    //Fake some latency to show its a miss
    await new Promise(r => setTimeout(r, 500));

    res.setHeader('Surrogate-Key', req.url.replace('/', '').replace('api/', ''));
    res.writeHead(200);
    res.end('Hello, World: ' + req.url);
}

const server = http.createServer(requestListener);
server.listen(3000);