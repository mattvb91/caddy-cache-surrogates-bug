import http from 'http';

const requestListener = async (req, res) => {
    //Fake some latency to show its a miss and help test
    await new Promise(r => setTimeout(r, 550));

    res.setHeader('Surrogate-Key', "global-key" + (req.url.length > 1 ? ", " : "") + req.url.replace('/', '').replace('api/', ''));
    res.writeHead(200);
    res.end(JSON.stringify({
        url: req.url, 
        time: new Date(),
        cache: {
            surrogate_key: "global-key" + (req.url.length > 1 ? ", " : "") + req.url.replace('/', '').replace('api/', '')
        }
    }));
}

const server = http.createServer(requestListener);
server.listen(3000);