Setup

```
npm i
docker-compose up -d
node ./test.js
```

### What am I trying to do?

I have a frontend container for rendering HTML. The frontend makes requests to the backend container to fetch data. Both the frontend document & API JSON response needs to be saved with an associated surrogate key so I can flush both pages (or more) instantly if a change is made to an associated entity.

In this example I have setup `server.js` to simply respond with surrogate key based on the url for testing.

### Whats happening?

If I tag a document with multiple keys, in this case: `test` & `global-key` I end up with surrogate key
list of:

```
> GET /test HTTP/1.1
> Host: localhost
> User-Agent: curl/7.77.0
> Accept: */*
> 
< HTTP/1.1 200 OK
< Cache-Status: Souin; fwd=uri-miss; stored
< Date: Tue, 19 Jul 2022 12:01:35 GMT
< Surrogate-Key: global-key, test
```

```json
{
    "STALE_global-key":",STALE_GET-localhost-%2Ftest",
    "STALE_test":",STALE_GET-localhost-%2Ftest",
    "global-key":",GET-localhost-%2Ftest",
    "test":",GET-localhost-%2Ftest"
}
```

```json
{
    "STALE_test":",STALE_GET-localhost-%2Ftest",
    "test":",GET-localhost-%2Ftest"
}
```
