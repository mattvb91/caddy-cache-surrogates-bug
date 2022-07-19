import fetch from "node-fetch"

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

    const testRes = await fetch('http://localhost/test')
    if (testRes.headers.get('surrogate-key') !== 'global-key, test') {
        throw new Error("wrong surrogate-key:" + testRes.headers.get('surrogate-key'))
    }

    const testResApi = await fetch('http://localhost/api/test')
    if (testResApi.headers.get('surrogate-key') !== 'global-key, test') {
        throw new Error("wrong surrogate-key:" + testResApi.headers.get('surrogate-key'))
    }

    //We dont even need this as we can replicate with just the above
    // const testingRes = await fetch('http://localhost/testing')
    // if (testingRes.headers.get('surrogate-key') !== 'global-key, testing') {
    //     throw new Error("wrong surrogate-key:" + testingRes.headers.get('surrogate-key'))
    // }

    // const testingResApi = await fetch('http://localhost/api/testing')
    // if (testingResApi.headers.get('surrogate-key') !== 'global-key, testing') {
    //     throw new Error("wrong surrogate-key:" + testingResApi.headers.get('surrogate-key'))
    // }

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
    }

}

//Then run our tests
run();
