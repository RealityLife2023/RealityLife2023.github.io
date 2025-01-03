const chat = document.getElementById("chat-submitter");
const element = document.getElementById("document-submitter");

const PDF_EXTRACTOR = "https://servicenuruk.realitynear.org:7725/document";
const VECTOR_GENERATOR = "https://servicenuruk.realitynear.org:7726/vectorize";
const PROMPT_END = "https://servicenuruk.realitynear.org:7726/ask";

chat.addEventListener("submit", async event => {

   event.preventDefault();

   let form = {
      content : event.target.message.value,
   };

   /*

   pushToChat( event.target );

   let embedding = await vectorize( form );

   let answer = await ask( embedding, event.target );

   pushToChat( answer );
   */
});

element.addEventListener("submit", async event => {

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

   //let docEmbedding = await vectorizeDocument( keys );
  // localStorage.setItem('embedding', docEmbedding);// Save pages to return later
});

/**
 * Generates and saves all the embeddings per page of the stored document
 */
async function vectorizeDocument( sections )
{
   for( const page of sections )
   {
      let content = localStorage.getItem(page);

      let response = await vectorize( content );

      localStorage.setItem(`e.${page}`, response);
   }
}

/**
 * Ranks the first top values of an array of numbers
 */
function dynamicRank( array, top = 2)
{
   let gun = 0;
   let score = new Array(top);
}

/**
 * Takes the cosine similarity of two vector of the same dimensions
 */
function cosineSimilarity( x, y )
{
}

/**
 * Uses cosine similarity to compare one vector with all the vectors stored and then ranks the results
 */
function buildContext( sections, vectorX )
{
   let results = [];

   for( const page of sections )
   {
      let vectorY = localStorage.getItem(`e.${page}`);

      let similarity = cosineSimilarity( vectorX, vectorY );

      results.push( similarity );
   }

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
         body : JSON.stringify(object),
      };

   return await fetch(PROMPT_END, request).then( response => response.json());
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
   const questionEmbedding = await vectorize( question );

   const pages = retrievePages();

   const context = buildContext(pages,questionEmbedding);

   const finalPrompt = 
     ` We're only talking about what's on the brackets, 
     \{
     ${context}
     \}
     reply please to the next question: ${question}

     If the question is unrelated, then please reply: I don't know, but with a poetic and very polite manner`;

   return await promptOnto({prompt : finalPrompt});
}

/**
 * Help function to retrieved an array from localStorage
 */
function retrievePages()
{
   return localStorage.getItem("pages").split();
}

async function pushToChat( content, side = 0)
{
   // Add children to the chat
   // If 0 means agent 1 means client
}
