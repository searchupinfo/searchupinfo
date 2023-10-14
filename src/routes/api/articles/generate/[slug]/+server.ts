import { GetArticleVersionsStore, InsertArticleVersionsStore } from '$houdini'
import { spawn } from 'child_process';
import { log } from 'console';

export async function GET(event) {
    console.log("Requested generation");
    let articleName = event.params.slug
    const API_KEY = import.meta.env.VITE_API_KEY;

    if (articleName.length < 31) {
        async function whichPromptAsync() {
            const whichPrompt = spawn('python', ['whichPrompt.py', articleName]);
            const output: number[] = [];
            
            whichPrompt.stdout.on("data", function(data) {
              output.push(parseInt(data));
            });
          
            await whichPrompt.on('exit', function() {});
            while(output[0] === undefined) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return output[0];
          }
        
        async function getGenerateAsync() {
            const whichPrompt = spawn('python', ['generate.py', API_KEY, articleName]);
          
            const output : String[] = [];

            whichPrompt.stdout.on("data", function(data) {
              output.push(data);
            });
          
            await whichPrompt.on('exit', function() {});
            while(output[0] === undefined) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return output[0];
        }
        async function getFromWikiAsync() {
            const whichPrompt = spawn('python', ['fromWiki.py', API_KEY, articleName]);
          
            const output : String[] = [];

            whichPrompt.stdout.on("data", function(data) {
              output.push(data);
            });
          
            await whichPrompt.on('exit', function() {});
            while(output[0] === undefined) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return output[0];
        }
        async function getAmbiguousAsync() {
            const whichPrompt = spawn('python', ['ambiguous.py', API_KEY, articleName]);
          
            const output : String[] = [];

            whichPrompt.stdout.on("data", function(data) {
              output.push(data);
            });
          
            await whichPrompt.on('exit', function() {});
            while(output[0] === undefined) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return output[0];
        }
        const choice = await whichPromptAsync();
        console.log("Choice of call" + choice)
        let articleText = "";
        if(choice === 0) {
            articleText = String(await getGenerateAsync());
        } else if(choice === 1) {
            articleText = String(await getFromWikiAsync());
        } else if(choice === 2) {
            articleText = String(await getAmbiguousAsync());
        }

        // Add the article to the DB
        const insertArticle = new InsertArticleVersionsStore()
        await insertArticle.mutate({ name: articleName, text: articleText }, { event: event })

        return new Response(articleText)
    }
    else {
        return new Response('Title must be less than 31 characters.')
    }
}