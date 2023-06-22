const fetch = require("node-fetch");

interface ResultI {
    message(message: any): unknown;
    data: any;
    statusCode: number;
    newToken: any;
    status: Number,
    json: Function
}

export default async function makeReq(url = "", method = "POST", data = {}):Promise<ResultI> {
    const response:ResultI = await fetch(url, {
        method, // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    return response.json() // parses JSON response into native JavaScript objects
}