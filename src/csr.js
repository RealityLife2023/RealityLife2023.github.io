"use strict";

function insertLinks( parent )
{
   const len = parent.children.length;

   document.head.appendChild(parent.children[0]);
   /*

   for(let i = 0; i < len; i++)
   {
      console.log(parent.children[0].tagName );

      document.head.appendChild(parent.children[i]);
   }
    */
}

const platformSpecs = {

   mobile : { 
      html : "mobilechat.html",
   },

   desktop : {
      html : "deskchat.html",
   },
};

async function getDocument(target)
{
   const raw = await fetch(target.html).then(response => response.text());

   const parser = new DOMParser();

   return parser.parseFromString(raw, "text/html");

}

function updateDOM( doc )
{ 
   const head = doc.head;
   const body = doc.body;

   insertLinks( head );

   document.body.appendChild(body.children[0]);

   const script = document.createElement("script");

   script.src = "../src/chatbot.js";
   script.type = "module";

   document.body.appendChild(script);
}

async function getNode(target)
{
   const request = new XMLHttpRequest();

   request.onload = (event) =>
   {
      updateDOM( request.responseXML );
   };

   request.open("GET", target.html, true);
   request.responseType = "document"; // Add it in between open and send
   request.send();
}

getNode(platformSpecs.desktop);
