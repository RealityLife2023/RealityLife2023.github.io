"use strict";

const PLATFORMS = 
[
   {s:'Windows 10', r:/(Windows 10.0|Windows NT 10.0)/},
   {s:'Windows 8.1', r:/(Windows 8.1|Windows NT 6.3)/},
   {s:'Windows 8', r:/(Windows 8|Windows NT 6.2)/},
   {s:'Windows 7', r:/(Windows 7|Windows NT 6.1)/},
   {s:'Windows Vista', r:/Windows NT 6.0/},
   {s:'Windows Server 2003', r:/Windows NT 5.2/},
   {s:'Windows XP', r:/(Windows NT 5.1|Windows XP)/},
   {s:'Windows 2000', r:/(Windows NT 5.0|Windows 2000)/},
   {s:'Windows ME', r:/(Win 9x 4.90|Windows ME)/},
   {s:'Windows 98', r:/(Windows 98|Win98)/},
   {s:'Windows 95', r:/(Windows 95|Win95|Windows_95)/},
   {s:'Windows NT 4.0', r:/(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/},
   {s:'Windows CE', r:/Windows CE/},
   {s:'Windows 3.11', r:/Win16/},
   {s:'Android', r:/Android/},
   {s:'Open BSD', r:/OpenBSD/},
   {s:'Sun OS', r:/SunOS/},
   {s:'Chrome OS', r:/CrOS/},
   {s:'Linux', r:/(Linux|X11(?!.*CrOS))/},
   {s:'iOS', r:/(iPhone|iPad|iPod)/},
   {s:'Mac OS X', r:/Mac OS X/},
   {s:'Mac OS', r:/(Mac OS|MacPPC|MacIntel|Mac_PowerPC|Macintosh)/},
   {s:'QNX', r:/QNX/},
   {s:'UNIX', r:/UNIX/},
   {s:'BeOS', r:/BeOS/},
   {s:'OS/2', r:/OS\/2/},
   {s:'Search Bot', r:/(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/}
];


const DESKTOP_REGEX =  /(Windows|Macintosh|Mac OS X|Linux|BSD|Solaris|Chrome|UNIX|BeOS)/i;
const MOBILE_REGEX = /(Android|iOS)|iPhone|Windows Phone|BlackBerry|Symbian|webOS|Bada|Tizen|Firefox OS|KaiOS/i;


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

   checkPlatform()
   {
      const os = window.navigator.userAgent;


      if(MOBILE_REGEX.test(os))
      {
         console.log(os);
         return platformSpecs.mobile;
      }
      else if(DESKTOP_REGEX.test(os))
      {
         return platformSpecs.desktop;
      }
   }
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



getNode(platformSpecs.checkPlatform());
