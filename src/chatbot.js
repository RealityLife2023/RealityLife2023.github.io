'use strict';

import { cosineSimilarity, dynamicRank } from "./math.js";


const PDF_EXTRACTOR = "https://servicenuruk.realitynear.org:7725/document";
const VECTOR_GENERATOR = "https://servicenuruk.realitynear.org:7726/vectorize";
const PROMPT_END = "https://servicenuruk.realitynear.org:7726/ask";
const MAXIMUM_SIZE = 700000;

const chat = document.getElementById("chat-submitter");
const file = document.getElementById("document-submitter");
const jar = document.getElementsByClassName("chat-bubble-jar__div")[0];

const props =
{
   set loaded( value )
   {
      props.isLoaded = value;

      props.add.disabled = props.isLoaded;

      props.submit.disabled = !props.isLoaded;

      props.icon.setAttribute("status", value ? "enabled" : "disabled");
   },

   set disableChat( value )
   {
      props.chat.children[0].disabled = 
      props.chat.children[1].disabled = value;

      props.chat.children[0].setAttribute("placeholder", value ? "Sube un documento para chatear" : "Escribe...");
   },

   isLoaded : false,
   file : undefined,
   trigger : file.children[0],
   add : file.children[1],
   submit : file.children[2],
   icon : file.children[3],
   fileName : file.children[4],
   progressBar : document.getElementsByClassName("progress-document-form")[0],
   panel : document.getElementsByClassName("chat-top__div")[0],
   chat : chat,

   changeStateForm()
   {
      props.add.disabled = props.isLoaded;

      props.submit.disabled = !props.isLoaded;
   },

   alterDisplay : ( state ) =>
   {
      props.panel.setAttribute("status", state);
   },

   loadFile : ( doc ) =>
   {
      props.file = doc

      console.log(doc.name);

      props.fileName.textContent = doc.name.replace(".pdf", "");

      props.icon.setAttribute("status", "loaded");

      props.loaded = true;

      props.changeStateForm();
   },
}

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

function pushEmptyToJar( bubble )
{
   const signal = isStickToBottom( jar );

   jar.appendChild( bubble );

   if(signal)
      stickyScroll( jar );
}

function createBubble( type, content )
{
   let bubble = document.createElement("p");

   bubble.classList.add("chat-bubble__p");
   bubble.setAttribute("type", type);

   if( content === "")
   {
      let dotGroup = document.createElement("span");
      dotGroup.classList.add("dot-group");

      for(let i = 0; i < 3; i++)
      {
         let dot = document.createElement("span");
         dot.classList.add("dot");
         dot.setAttribute("delay", `${i}`);
         dotGroup.appendChild( dot );
      }

      bubble.appendChild(dotGroup);

      return bubble;
   }

   bubble.append(content);
   return bubble;
}


function insertContent( bubble, content )
{
   bubble.children[0].remove();

   bubble.append( content );
}

async function senderProcess( message )
{
   pushToJar( "sender", message );

   let botBubble = createBubble("receiver", "");

   pushEmptyToJar( botBubble );

   let answer = await ask( message );

   insertContent( botBubble, answer );
}

async function documentProcessor( event )
{
   event.preventDefault();

   if(!props.isLoaded)
      return;

   let form = new FormData( event.target );


   let pages = await readPDF( form );

   let keys = [];

   for(let i = 0; i < pages.length; i++)
   {
      let key = `p.${i}`;
      localStorage.setItem(key, pages[i]);
      keys.push(key);
   }

   props.progressBar.setAttribute("value", 20);

   localStorage.setItem('pages', keys);

   try
   {
      props.progressBar.setAttribute("value", 80);
      await vectorizeDocument( keys );
      props.progressBar.setAttribute("value", 100);
      props.disableChat = false;
   }
   catch( error )
   {
      props.progressBar.setAttribute("value", 0);
   }

   props.disableChat = false;
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

      let similarity = cosineSimilarity( vectorX, vectorY, vectorY.length );

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
         headers : {"Content-Type" : "application/json"},
         body : JSON.stringify(object),
      };

   return await fetch(PROMPT_END, request).then( async response => 
      {
         let json = await response.json();

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
   const questionEmbedding = await vectorize({content : question});

   const pages = retrievePages();

   const context = buildContext(pages,questionEmbedding);

   const finalPrompt = 
     `We're only talking about what's on the brackets, if the question is unrelated try to make clear what's the topic of the conversation, you can be very creative with this kind of answers
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

   if( event.target.message.value.length === 0 )
   {
      return;
   }

   senderProcess( event.target.message.value );

   event.target.reset();
}


chat.addEventListener("submit", chatListener);

file.addEventListener("submit", documentProcessor);
file.addEventListener("change", event =>
   {
      const file = event.target.files[0];


      if(file.size > MAXIMUM_SIZE)
      {
         event.target.parentNode.reset();
         return;
      }

      props.loadFile( file );

   });

const fileAdder = document.getElementsByClassName("document-adder__button")[0];
const windowOpener = document.getElementsByClassName("document-panel__button")[1];
const windowCloser = document.getElementsByClassName("document-panel__button")[0];


fileAdder.addEventListener("click", event =>
{
   event.preventDefault();
   props.trigger.click();

});


windowOpener.addEventListener("click", event =>
   {
      event.preventDefault();
      props.alterDisplay( "display" );
   });

windowCloser.addEventListener("click", event =>
   {
      event.preventDefault();
      props.alterDisplay( "hidden" );
   });


props.loaded = false;
props.disableChat = true;
