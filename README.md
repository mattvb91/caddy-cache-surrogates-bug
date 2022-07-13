Setup

```
docker-compose up -d
```

### What am I trying to do?

I have a frontend container for rendering HTML. The frontend makes requests to the backend container to fetch data. Both the frontend document & API JSON response needs to be saved with an associated surrogate key so I can flush both pages (or more) instantly if a change is made to an associated entity.

In this example I have setup `server.js` to simply respond with surrogate key based on the url for testing.

### Lets test

Visit with chrome (First network visit should be 500ms+, theres a delay on the server.js on first hits to fake latency and make sure we are hitting cache after first request):

```
GET http://localhost/test

Cache-Status: Souin; fwd=uri-miss; stored
Content-Length: 19
Content-Type: text/plain; charset=utf-8
Date: Wed, 13 Jul 2022 07:23:42 GMT
Surrogate-Key: test
```
Second request to this url looks good & cached and comes back instantly without the 500ms delay

```json
http://localhost/__cache/souin
This looks good:

[
"GET-localhost-/favicon.ico",
"GET-localhost-/test",
"STALE_GET-localhost-/favicon.ico",
"STALE_GET-localhost-/test"
]
````

```json
http://localhost/__cache/souin/surrogate-keys
This is wrong? Currently empty?
Should have key 'test' with the associated page.

[]
```

```
Visit: http://localhost/api/test

Cache-Status: Souin; fwd=uri-miss; stored
Content-Length: 23
Content-Type: text/plain; charset=utf-8
Date: Wed, 13 Jul 2022 07:28:31 GMT
Surrogate-Key: test
```

Second request also looks good with no 500ms delay and instance cache hit.

```json 
http://localhost/__cache/souin
This looks good again with new /api/test/entry

[
"GET-localhost-/api/test",
"GET-localhost-/favicon.ico",
"GET-localhost-/test",
"STALE_GET-localhost-/api/test",
"STALE_GET-localhost-/favicon.ico",
"STALE_GET-localhost-/test"
]
```

```json
http://localhost/__cache/souin/surrogate-keys
This is still wrong? 
Should have key 'test' with 2 associated pages. One for /test and one for /api/test

[]
```