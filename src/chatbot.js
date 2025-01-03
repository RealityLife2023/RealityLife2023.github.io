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
function dynamicRank( array, top = 2 )
{
   const len = array.length;

   let guns = new Array(top);

   let leftWing = 0, rightWing = leftWing + 1;

   while( rightWing < len)
   {
      const underdog = array[leftWing] > array[rightWing] ? leftWing : rightWing;

      for(let i = 0 ; i < top; i++)
      {
         if(guns[i] == undefined)
         {
            guns[i] = underdog;
            break;
         }

         if(array[underdog] > array[guns[i]])
         {
            let hold = guns[i];
            guns[i] = underdog;
            guns[i+1] = hold;
            break;
         }
      }

      leftWing++;
      rightWing = leftWing + 1;
   }

   return guns;
}

/**
 * Takes the cosine similarity of two vector of the same dimensions
 */
function cosineSimilarity( x, y, dimensions )
{
   const dot = dotProduct( x, y, dimensions );

   const l2normX = euclideanNorm( x );
   const l2normY = euclideanNorm( y );

   return dot / ( l2normX * l2normY );
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

/**
 * Finds the dot product between two vectors of the same dimension
 */
function dotProduct( x, y, length )
{
   let sum = 0;

   for ( i = 0; i < length; i++ )
   {
      sum += x[ i ] * y[ i ];
   }

   return sum;
}

/**
 * Calculates the Euclidean norm for a vector
 */
function euclideanNorm( vector )
{
   /** Loop configuration **/
   let i = 0; const length = vector.length;

   /** Equation terms **/
   let t = 0, ratio = 0, s = 1, unsigned = 0;

   while( i < length)
   {
      if( vector[i] == 0)
      {
         i++;
         continue;
      }

      unsigned = vector[i] < 0 ? -vector[i] : vector[i];

      if( t > unsigned )
      {
         ratio = t / unsigned;
         s = 1 + s*(ratio**2);
         continue;
      }

      ratio = unsigned / t;
      s = s + ratio**2;
      /** Override t for future **/
      t = unsigned;

      i++;
   }

   return t * Math.sqrt(s);
}

export { dynamicRank, euclideanNorm };
