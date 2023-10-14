import { redirect } from '@sveltejs/kit';

export async function load(event) {
  let articleName = event.params.slug

  if (articleName.length < 31) {
    if (articleName.toLowerCase() == articleName) {
      return {
        props: {
          articleName: articleName,
          articleText: getArticleText(event, articleName)
        },
      };
    } else {
      throw redirect(307, '/articles/' + articleName.toLowerCase())
    }
  }
  return {
    props: {
      articleName: 'Error',
      articleText: 'Title must be less than 31 characters.'
    }
  }
}

async function getArticleText(event: any, articleName: any) {
  // check if the article exists, if it doesn't, generate it
  const res = await event.fetch('/api/articles/' + articleName);
  let articleText = await res.text();
  
  if (articleText.length == 0) {
    let response = await event.fetch('/api/articles/generate/' + articleName);
    articleText = await response.text();
  }
  return articleText;
}
