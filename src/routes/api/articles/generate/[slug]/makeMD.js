import { spawn } from 'child_process';
import { log } from 'console';

const topic = "King";

//TODO: Get API key from .env file
const API_KEY = "AIzaSyDsBW2ANlj_K757HhVpgmk_YcCrOKRutIc";

async function whichPromptAsync() {
    const whichPrompt = spawn('python', ['whichPrompt.py', topic]);
  
    /**
     * @type {number[]}
     */
    const output = [];
  
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
    const whichPrompt = spawn('python', ['generate.py', API_KEY, topic]);
  
    /**
     * @type {number[]}
     */
    const output = [];
  
    whichPrompt.stdout.on("data", function(data) {
      output.push(parseInt(data));
    });
  
    await whichPrompt.on('exit', function() {});
    while(output[0] === undefined) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    return output[0];
}
async function getFromWikiAsync() {
    const whichPrompt = spawn('python', ['fromWiki.py', API_KEY, topic]);
  
    /**
     * @type {number[]}
     */
    const output = [];
  
    whichPrompt.stdout.on("data", function(data) {
      output.push(parseInt(data));
    });
  
    await whichPrompt.on('exit', function() {});
    while(output[0] === undefined) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    return output[0];
}
async function getAmbiguousAsync() {
    const whichPrompt = spawn('python', ['ambiguous.py', API_KEY, topic]);
  
    /**
     * @type {number[]}
     */
    const output = [];
  
    whichPrompt.stdout.on("data", function(data) {
      output.push(parseInt(data));
    });
  
    await whichPrompt.on('exit', function() {});
    while(output[0] === undefined) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    return output[0];
}

const choice = await whichPromptAsync();
console.log(choice)
// if(choice === 0) {
//     const generate = await getGenerateAsync();
//     console.log(generate);
// } else if(choice === 1) {
//     const fromWiki = await getFromWikiAsync();
//     console.log(fromWiki);
// } else if(choice === 2) {
//     const ambiguous = await getAmbiguousAsync();
//     console.log(ambiguous);
// }

