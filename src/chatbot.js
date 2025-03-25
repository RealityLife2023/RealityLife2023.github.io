"use strict";

import { cosineSimilarity, dynamicRank } from "./math.js";

const PDF_EXTRACTOR = "document";
const VECTOR_GENERATOR = "vectorize";
const PROMPT_END = "ask";

const urlGen = (endpoint) => {
   let host = "";
   let scheme = "";

   if (window.location.host.indexOf("localhost") !== -1) {
      scheme = "http://";
      host = window.location.host.replace("8080", "5001"); // Make regex here /\/.(?=.[0-9]{4})
   } else {
      scheme = "https://";
      host = "servicenuruk.realitynear.org/chat/";
   }

   return [scheme, host, endpoint].join("");
};

const MAXIMUM_SIZE = 700000; // Size of the file in MB not MiB

const chat = document.getElementById("chat-submitter");
const file = document.getElementById("document-submitter");
const jar = document.getElementsByClassName("chat-bubble-jar__div")[0];

const props = {
   trigger: undefined,
   add: undefined,
   submit: undefined,
   icon: undefined,
   fileName: undefined,

   isLoaded: false,
   pdfObject: undefined,

   set loaded(value) {
      props.isLoaded = value;

      props.submit.disabled = !props.isLoaded;

      props.add.textContent = value ? "Cambiar" : "Añadir";

      props.icon.setAttribute("status", value ? "enabled" : "disabled");
   },

   set disableChat(value) {
      props.chat.children[0].disabled = props.chat.children[1].disabled = value;

      props.chat.children[0].setAttribute(
         "placeholder",
         value ? "Sube un documento para chatear" : "Escribe...",
      );

      props.add.disabled = props.isLoaded;
   },

   set documentForm(value) {
      props.trigger = value.children[0];
      props.add = value.children[1];
      props.submit = value.children[2];
      props.icon = value.children[3];
      props.fileName = value.children[4];

      props.add.addEventListener("click", (event) => {
         event.preventDefault();
         props.trigger.click();
      });

      file.addEventListener("change", (event) => {
         const file = event.target.files[0];

         if (file.size > MAXIMUM_SIZE) {
            event.target.parentNode.reset();
            return;
         }

         props.loadFile(file);
      });

      file.addEventListener("submit", documentProcessor);

      const windowOpener = document.getElementsByClassName("opener")[0];
      const windowCloser = document.getElementsByClassName("closer")[0];

      windowOpener.addEventListener("click", (event) => {
         event.preventDefault();
         props.alterDisplay("display");
         props.focusChat();
      });

      windowCloser.addEventListener("click", (event) => {
         event.preventDefault();
         props.alterDisplay("hidden");
      });

      const home = document.getElementsByClassName("home-router")[0];

      home.addEventListener("click", (event) => {
         event.preventDefault();

         location.href = "/";
      });
   },

   progressBar: document.getElementsByClassName("progress-document-form")[0],
   prompt: document.getElementsByClassName("status-prompt__p")[0],
   panel: document.getElementsByClassName("configuration-container")[0],
   chat: chat,

   progressStatus(message, disable = false) {
      props.prompt.textContent = message;
      props.prompt.setAttribute("status", disable ? "empty" : "message");
   },

   setLinks() {
      let link, classes;

      [link, ...classes] = arguments;

      classes.forEach((value) => {
         const element = document.getElementsByClassName(value)[0];

         console.log(`${element}`);

         element.addEventListener("click", (event) => (location.href = link));
      });
   },

   focusChat() {
      props.chat.click();
   },

   alterDisplay: (state) => {
      props.panel.setAttribute("status", state);
   },

   loadFile: (doc) => {
      props.file = doc;

      props.fileName.textContent = doc.name.replace(".pdf", "");

      props.icon.setAttribute("status", "loaded");

      props.loaded = true;

      props.progressStatus("", true);
   },
};

function isStickToBottom(element) {
   const diff =
      element.scrollHeight - element.clientHeight <= element.scrollTop + 1;
   return diff;
}

function stickyScroll(element) {
   element.scrollTop = element.scrollHeight - element.clientHeight;
}

function pushToJar(type, content) {
   let bubble = document.createElement("p");

   bubble.classList.add("chat-bubble__p");
   bubble.setAttribute("type", type);
   bubble.append(content);

   const signal = isStickToBottom(jar);

   jar.appendChild(bubble);

   if (signal) stickyScroll(jar);
}

function pushEmptyToJar(bubble) {
   const signal = isStickToBottom(jar);

   jar.appendChild(bubble);

   if (signal) stickyScroll(jar);
}

function createBubble(type, content) {
   let bubble = document.createElement("p");

   bubble.classList.add("chat-bubble__p");
   bubble.setAttribute("type", type);

   if (content === "") {
      let dotGroup = document.createElement("span");
      dotGroup.classList.add("dot-group");

      for (let i = 0; i < 3; i++) {
         let dot = document.createElement("span");
         dot.classList.add("dot");
         dot.setAttribute("delay", `${i}`);
         dotGroup.appendChild(dot);
      }

      bubble.appendChild(dotGroup);

      return bubble;
   }

   bubble.append(content);
   return bubble;
}

function insertContent(bubble, content) {
   bubble.children[0].remove();

   bubble.append(content);
}

async function senderProcess(message) {
   pushToJar("sender", message);

   let botBubble = createBubble("receiver", "");

   pushEmptyToJar(botBubble);

   let answer = await ask(message);

   insertContent(botBubble, answer);
}

async function documentProcessor(event) {
   event.preventDefault();

   if (!props.isLoaded) return;

   props.add.disabled = props.submit.disabled = true; // Avoid double submision

   let form = new FormData(event.target);

   try {
      let pages = await readPDF(form);

      let keys = [];

      for (let i = 0; i < pages.length; i++) {
         let key = `p.${i}`;
         localStorage.setItem(key, pages[i]);
         keys.push(key);
      }

      props.progressBar.setAttribute("value", 20);

      localStorage.setItem("pages", keys);

      props.progressBar.setAttribute("value", 80);
      await vectorizeDocument(keys);
      props.progressBar.setAttribute("value", 100);
      props.progressStatus("¡Hecho!");
      props.disableChat = false;
   } catch (error) {
      props.progressBar.setAttribute("value", 0);
      props.submit.disabled = false;
      props.progressStatus("Intenta de nuevo");
   }
}

/**
 * Generates and saves all the embeddings per page of the stored document
 */
async function vectorizeDocument(sections) {
   for (const page of sections) {
      let pageContent = localStorage.getItem(page);

      let response = await vectorize({ content: pageContent });

      let container = JSON.stringify(response);

      localStorage.setItem(`e.${page}`, container);
   }
}

/**
 * Uses cosine similarity to compare one vector with all the vectors stored and then ranks the results
 */
function buildContext(sections, vectorX) {
   let results = [];

   for (const page of sections) {
      let container = localStorage.getItem(`e.${page}`);

      let vectorY = JSON.parse(container);

      let similarity = cosineSimilarity(vectorX, vectorY, vectorY.length);

      results.push(similarity);
   }

   /** results are 1:1 with sections **/

   let topResults = dynamicRank(results); // List of indexes for the most relevant results
   let context = "";

   for (const index of topResults) {
      context += localStorage.getItem(sections[index]);
      context += "\n";
   }

   return context;
}

/**
 * Request the embedding for a text
 * @params object - requires the prompt property
 */
async function promptOnto(object) {
   let request = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(object),
   };

   return await fetch(urlGen(PROMPT_END), request).then(async (response) => {
      let json = await response.json();

      return json.answer;
   });
}

/**
 * Request the embedding for a text
 * @params object - requires the content property
 */
async function vectorize(object) {
   let request = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(object),
   };

   return await fetch(urlGen(VECTOR_GENERATOR), request).then((res) =>
      res.json(),
   );
}

/**
 * @params form - FormData object
 */
async function readPDF(form) {
   let request = {
      method: "POST",
      body: form,
   };

   return await fetch(urlGen(PDF_EXTRACTOR), request).then((response) =>
      response.json(),
   );
}

async function ask(question) {
   const questionEmbedding = await vectorize({ content: question });

   const pages = retrievePages();

   const context = buildContext(pages, questionEmbedding);

   const finalPrompt = `We're only talking about what's on the brackets, if the question is unrelated try to make clear what's the topic of the conversation, you can be very creative with this kind of answers
     \{
     ${context}
     \}
     reply please to the next question: ${question}`;

   return await promptOnto({ prompt: finalPrompt });
}

/**
 * Returns the keys to access the content of each page in local storage
 */
function retrievePages() {
   return localStorage.getItem("pages").split(",");
}

function chatListener(event) {
   event.preventDefault();

   if (event.target.message.value.length === 0) {
      return;
   }

   senderProcess(event.target.message.value);

   event.target.reset();
}

chat.addEventListener("submit", chatListener);

file.addEventListener("submit", documentProcessor);

props.documentForm = file;

props.loaded = false;
props.disableChat = true;
