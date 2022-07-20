Setup

```
npm i
cd nextjs && npm i
cd ../
docker-compose up -d
node ./test.js
```

expect error: 
```
Purging key: global-key
595.7504209997132 ms for new request
Purging key: test
21.132855999283493
caddy-cache-surrogates-bug/test.js:80
        throw new Error("Something was cached, this should be longer than 500ms response because we delay on node side. If its over 10ms this is only nextjs render time but still getting cache API")
              ^

Error: Something was cached, this should be longer than 500ms response because we delay on node side. If its over 10ms this is only nextjs render time but still getting cache API
```


### Manual replication:

exec into container and `rm -rf /tmp/nuts-souin/*` and restart caddy container to prevent any
lingering caches

```
GET localhost/test

Cache-Status: Souin; fwd=uri-miss; stored
Content-Encoding: gzip
Content-Length: 1681
Content-Type: text/html; charset=utf-8
Date: Wed, 20 Jul 2022 09:19:21 GMT
Surrogate-Key: global-key, test

time: 730ms first request, 1ms second request (cache hit)
```

```
GET localhost/api/test

Cache-Status: Souin; fwd=uri-miss; stored
Content-Length: 98
Content-Type: text/plain; charset=utf-8
Date: Wed, 20 Jul 2022 09:20:07 GMT
Surrogate-Key: global-key, test

time: 560ms << THIS IS ALREADY AN ISSUE THIS SHOULD BE CACHED FROM REQUEST ABOVE ALREADY >>, 1ms second request (cache hit)
```

Purge:

```
curl --location --request PURGE 'http://localhost/__cache/souin' \
--header 'Host: localhost' \
--header 'Surrogate-Key: test'
```

Now the API props are wrong on this request:

if you purge again you can see the time is never updated on this response even tho when you visit `/api/test` it gets updated there after flush

```
GET localhost/test

Cache-Status: Souin; fwd=uri-miss; stored
Content-Encoding: gzip
Content-Length: 1681
Content-Type: text/html; charset=utf-8
Date: Wed, 20 Jul 2022 09:19:21 GMT
Surrogate-Key: global-key, test

time: 23ms first request THIS IS NOT CACHE HIT, THIS IS NEXTJS RENDER BUT IT RECEIVED API PROPS CACHE HIT. 2ms second request (cache hit)
```
