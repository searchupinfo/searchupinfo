/** @type {import('houdini').ConfigFile} */
const config = {
    watchSchema: {
        url: 'https://hasura.searchup.info/v1/graphql',
        headers: {
            'x-hasura-admin-secret': 'env:VITE_GRAPHQL_KEY',
        }
    },
    "plugins": {
        "houdini-svelte": {}
    }
}

export default config