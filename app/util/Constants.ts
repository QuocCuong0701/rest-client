const BASE_URL = "http://localhost:1998/api_v1";

export const ENDPOINT = {
    person: {
        list: `${BASE_URL}/person`,
        findById: `${BASE_URL}/person/`,
        updatePerson: `${BASE_URL}/person/update?lang=vi`
    },
    task: {
        findTasksByPersonId: `${BASE_URL}/task/`,
        saveTask: `${BASE_URL}/task/save/`
    }
};

export const METHOD_HTTP = {
    get: 'GET',
    post: 'POST',
    put: 'PUT',
    delete: 'DELETE'
};
