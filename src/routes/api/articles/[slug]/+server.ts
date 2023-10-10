import { GetArticleVersionsStore } from '$houdini'

export async function GET(event) {
    let articleName = event.params.slug

    if (articleName.length < 31) {
        const getArticle = new GetArticleVersionsStore()
    
        let response = await getArticle.fetch({event, variables: {name: articleName}})
    
        return new Response(response.data?.article_versions[0]?.text ?? '')
    }
    else {
        return new Response('Title must be less than 31 characters.')
    }
}