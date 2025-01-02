const chat = document.getElementById("chat-submitter");
const element = document.getElementById("document-submitter");

const PDF_EXTRACTOR = "https://servicenuruk.realitynear.org:7725/document";
const VECTOR_GENERATOR = "https://servicenuruk.realitynear.org:7726/vectorize";

element.addEventListener("submit", async event => {

   event.preventDefault();

   let form = {
      content : event.target,
   };

   pushToChat( event.target );

   let embedding = await vectorize( form );

   let answer = await ask( embedding, event.target );

   pushToChat( answer );
});

element.addEventListener("submit", async event => {

   event.preventDefault();

   let form = new FormData( event.target );

   let pages = await readPDF( form );

   console.log( pages );

   // Save pages to return later
   let docEmbedding = await vectorizeDocument( pages );
   // Save the embedding to return later
});

/**
 * Gathers in one array all the embeddings per page of the passed document
 */
async function vectorizeDocument( sections )
{
   let data = []; // List of embeddings

   for( const page of sections )
   {
      let response = await vectorize( page );

      data.push(response);
   }

   return data;
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

   return await fetch(VECTOR_GENERATOR, request);
}

async function readPDF( form )
{

   let request = 
      {
         method : "POST", 
         body : form,
      };

   return await fetch(PDF_EXTRACTOR, request);
}
