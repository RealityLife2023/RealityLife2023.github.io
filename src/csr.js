"use strict";

function insertStyles( src, node )
{
   const link = document.createElement("link");

   link.rel = "stylesheet";

   link.href = src

   node.appendChild(link);
}

const platformSpecs = {

   mobile : { 
      style : "../css/mobileChat.css",
      html : "mobilechat.html",
   },

   desktop : {
      style : "../css/chatbot.css", 
      html : "deskchat.html",
   },
}

async function getDocument(target)
{
   const raw = await fetch(target.html).then(response => response.text());

   const parser = new DOMParser();

   return parser.parseFromString(raw, "text/html");
}

async function getNode(target)
{
   const request = new XMLHttpRequest();


   request.onload = (event) =>
   {
      console.log(`Ready state->${request.readyState}`);
      //console.log(request.responseXML);

      const parent = request.responseXML.body.children[0];

      console.log(parent);

      document.body.append(parent);
   };

   request.open("GET", target.html, true);
   request.responseType = "document"; // Add it in between open and send
   request.send();
}

insertStyles( platformSpecs.desktop.style, document.head );
getNode(platformSpecs.desktop);


// Insert node
// Insert styles
