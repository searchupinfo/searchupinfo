import { GetArticleVersionsStore } from '$houdini'

export async function GET(event) {
    let articleName = event.params.slug

    const getArticle = new GetArticleVersionsStore()

    let response = await getArticle.fetch({event, variables: {name: articleName}})

    return new Response(response.data?.article_versions[0]?.text ?? '')
}