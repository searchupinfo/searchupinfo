import { HoudiniClient } from '$houdini';

export default new HoudiniClient({
    url: 'https://hasura.searchup.info/v1/graphql',
    fetchParams({ session }) {
        return {
            headers: {
                'x-hasura-admin-secret': import.meta.env.VITE_GRAPHQL_KEY,
            },
        }
    },
})