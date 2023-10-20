import { goto } from "$app/navigation";

const ROOT_API = "http://localhost:5133/api/";

export enum HTTP_METHOD {
    GET = 'GET',
    POST = 'POST',
    DELETE = 'DELETE',
    PUT = 'PUT'
}

export enum APIS {
    ACCOUNTS = "Accounts"
}

export interface ResponseBody {
    status: number;
    message: string;
    data: any;
}

export function navigateTo(path: string) {
    goto(path);
}

export function fetchData(methods: HTTP_METHOD, apiRoutes: APIS | string, bodyItem: any) {
    let options = {
        method: methods,
        headers: new Headers({'content-type': 'application/json'})
    };

    let finalPath = `${ROOT_API}${apiRoutes}`;

    if (bodyItem) {
        options = Object.assign(options, {body: JSON.stringify(bodyItem)});
    }

    return fetch(finalPath, options)
    .then((resp) => {
        return resp.json();
    })
    .then((respBody: ResponseBody) => {
        console.log(respBody);

        if (respBody.status === 400 || respBody.status === 409 ) {
            throw new Error(respBody.message);
        }

        return respBody;
    });
}