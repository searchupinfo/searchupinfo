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
    },
    scalars: {
        /* in your case, something like */
        bigint: {                  // <- The GraphQL Scalar
          type: "number"  // <-  The TypeScript type
        },
        timestamptz: {                  // <- The GraphQL Scalar
          type: "String"  // <-  The TypeScript type
        },
        jsonb: {                  // <- The GraphQL Scalar
          type: "Object"  // <-  The TypeScript type
        }
    }
}

export default config