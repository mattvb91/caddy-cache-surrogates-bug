import fetch from "node-fetch"
import { performance } from 'perf_hooks';

const purgeKey = async (key) => {
    console.log("Purging key: " + key);
    await fetch('http://localhost/__cache/souin', {
        method: "PURGE",
        headers: {
            "Surrogate-Key": key
        }
    })
}

const clearAllCacheKeys = async () => {
    const res = await fetch('http://localhost/__cache/souin/surrogate_keys')
    const list = await res.json();

    const surrogateKeys = Object.keys(list);
    surrogateKeys.forEach(async (key) => {
        await purgeKey(key)
    })

    const checkRes = await fetch("http://localhost/__cache/souin");
    const cache = await checkRes.json()
    if (!cache.length === 0) {
        throw new Error("cache not empty: " + JSON.stringify(cache))
    }
}

const run = async () => {
    await clearAllCacheKeys();


    let startTime = performance.now();

    let testRes = await fetch('http://localhost/test')
    let endTime = performance.now();

    if (testRes.headers.get('surrogate-key') !== 'global-key, test') {
        throw new Error("wrong surrogate-key:" + testRes.headers.get('surrogate-key'))
    }

    if (endTime - startTime < 500) {
        throw new Error("Something was cached, this should be longer than 500ms response because we delay on node side")
    }

    startTime = performance.now();
    const testResApi = await fetch('http://localhost/api/test')
    endTime = performance.now()
    if (testResApi.headers.get('surrogate-key') !== 'global-key, test') {
        throw new Error("wrong surrogate-key:" + testResApi.headers.get('surrogate-key'))
    }

    //THIS WORKS
    await purgeKey("global-key");
    startTime = performance.now();
    testRes = await fetch('http://localhost/test')
    endTime = performance.now()
    if (testRes.headers.get('surrogate-key') !== 'global-key, test') {
        throw new Error("wrong surrogate-key:" + testRes.headers.get('surrogate-key'))
    }

    //STILl WORKS, we can see time is > 500
    if (endTime - startTime < 500) {
        throw new Error("Something was cached, this should be longer than 500ms response because we delay on node side")
    }
    console.log(endTime - startTime, "ms for new request")

    //THIS DOESNT WORK purging by "test"
    await purgeKey("test");
    startTime = performance.now();
    testRes = await fetch('http://localhost/test')
    endTime = performance.now()
    if (testRes.headers.get('surrogate-key') !== 'global-key, test') {
        throw new Error("wrong surrogate-key:" + testRes.headers.get('surrogate-key'))
    }

    //it should fail now because the request was only rendered by nextjs but instant cache hit from api so its like 50ms
    if (endTime - startTime < 500) {
        console.log(endTime - startTime);
        throw new Error("Something was cached, this should be longer than 500ms response because we delay on node side. If its over 10ms this is only nextjs render time but still getting cache API")
    }
    console.log(endTime - startTime, "ms for new request")

    /*
    Ignore for now, may have another issue once the above is fixed

    const res = await fetch('http://localhost/__cache/souin/surrogate_keys')
    const surrogateKey = await res.json()
    let globalEntries = '';
    for (const key in surrogateKey) {
        if (key === 'global-key')
            globalEntries = `${surrogateKey[key]}`
    }

    await purgeKey("global-key");

    const currentKeys = await fetch('http://localhost/__cache/souin/surrogate_keys')
    const currentKeysBody = await currentKeys.json();

    //the 'test' key should be empty / gone because all the associated documents were also associated
    //with the 'global-key' which has been flushed. But they are still here!!
    for (const key in currentKeysBody) {
        if (key === 'test')
            throw new Error("'test' key still has associated documents in cache\n\n"
                + JSON.stringify(currentKeysBody) +
                "\n\nhttp://localhost/__cache/souin/surrogate_keys\n\n")
    } */

}

//Then run our tests
try {
    run();
} catch (e) {
    clearAllCacheKeys()
}
