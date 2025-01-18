import { cosineSimilarity } from "./math.js";


const PDF_EXTRACTOR = "https://servicenuruk.realitynear.org:7725/document";
const VECTOR_GENERATOR = "https://servicenuruk.realitynear.org:7726/vectorize";
const PROMPT_END = "https://servicenuruk.realitynear.org:7726/ask";

const chat = document.getElementById("chat-submitter");
const file = document.getElementById("document-submitter");
const jar = document.getElementsByClassName("chat-bubble-jar__div")[0];


function isStickToBottom( element )
{
   const diff = element.scrollHeight - element.clientHeight <= element.scrollTop + 1;
   return diff;
}

function stickyScroll( element )
{
   element.scrollTop = element.scrollHeight - element.clientHeight;
}

function pushToJar( type, content )
{
   let bubble = document.createElement("p");

   bubble.classList.add("chat-bubble__p");
   bubble.setAttribute("type", type);
   bubble.append(content);

   const signal = isStickToBottom( jar );

   jar.appendChild( bubble );

   if(signal)
      stickyScroll( jar );
}


async function senderProcess( message )
{
   pushToJar( "sender", message );

   let answer = await ask( message );

   pushToJar( "receiver", answer );
}


async function documentProcessor( event )
{
   event.preventDefault();

   let form = new FormData( event.target );

   let pages = await readPDF( form );

   let keys = [];

   for(let i = 0; i < pages.length; i++)
   {
      let key = `p.${i}`;
      localStorage.setItem(key, pages[i]);
      keys.push(key);
   }

   localStorage.setItem('pages', keys);

   let docEmbedding = await vectorizeDocument( keys );
}

/**
 * Generates and saves all the embeddings per page of the stored document
 */
async function vectorizeDocument( sections )
{
   for( const page of sections )
   {
      let pageContent = localStorage.getItem(page);

      let response = await vectorize({ content : pageContent });
      
      let container = JSON.stringify( response );

      localStorage.setItem(`e.${page}`,container);
   }
}


/**
 * Uses cosine similarity to compare one vector with all the vectors stored and then ranks the results
 */
function buildContext( sections, vectorX )
{
   let results = [];

   for( const page of sections )
   {
      let container = localStorage.getItem(`e.${page}`);

      let vectorY =  JSON.parse(container);

      let similarity = math.cosineSimilarity( vectorX, vectorY, vectorY.length );

      results.push( similarity );
   }

   console.log( results );

   /** results are 1:1 with sections **/

   let topResults = dynamicRank( results ); // List of indexes for the most relevant results
   let context = "";

   for( const index of topResults )
   {
      context += localStorage.getItem(sections[index]);
      context += "\n";
   }

   return context;
}

/**
 * Request the embedding for a text
 * @params object - requires the prompt property
 */
async function promptOnto( object )
{
   let request = 
      {
         method : "POST", 
         headers : {"Content-Type" : "application/json"},
         body : JSON.stringify(object),
      };

   return await fetch(PROMPT_END, request).then( async response => 
      {
         let json = await response.json();
         console.log(json.answer);

         return json.answer;

      });
}

/**
 * Request the embedding for a text
 * @params object - requires the content property
 */
async function vectorize( object )
{
   let request = 
      {
         method : "POST", 
         headers : { "Content-Type" : "application/json" },
         body : JSON.stringify(object),
      };

   return await fetch(VECTOR_GENERATOR, request).then( res => res.json());
}

/**
 * @params form - FormData object
 */
async function readPDF( form )
{

   let request = 
      {
         method : "POST", 
         body : form,
      };

   return await fetch(PDF_EXTRACTOR, request).then( response => response.json());
}

async function ask( question )
{
   const questionEmbedding = await vectorize({ content : question });

   const pages = retrievePages();

   const context = buildContext(pages,questionEmbedding);

   const finalPrompt = 
     ` We're only talking about what's on the brackets, if the question is unrelated try to make clear what's the topic of the conversation, you can be very creative with this kind of answers
     \{
     ${context}
     \}
     reply please to the next question: ${question}`;


   return await promptOnto({prompt : finalPrompt});
}

/**
 * Returns the keys to access the content of each page in local storage
 */
function retrievePages()
{
   return localStorage.getItem("pages").split(",");
}


function chatListener(event)
{
   event.preventDefault();

   event.target.reset();

   senderProcess( event.target.value );
}


chat.addEventListener("submit", chatListener);


file.addEventListener("submit", documentProcessor);


const windowOpener = document.getElementsByClassName("document-panel__button")[0];
const windowCloser = document.getElementsByClassName("document-panel__button")[1];

windowOpener.addEventListener("click", event =>
   {
      event.preventDefault();
      const documentPanel = document.getElementsByClassName("chat-configuration__div")[0];
      documentPanel.setAttribute("status", "display");
   });

windowCloser.addEventListener("click", event =>
   {
      event.preventDefault();
      const documentPanel = document.getElementsByClassName("chat-configuration__div")[0];
      documentPanel.setAttribute("status", "hidden");
   });

