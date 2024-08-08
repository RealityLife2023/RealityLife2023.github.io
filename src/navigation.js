/**
 * Step 1 : Disable only the clicked button
 * Step 1.5 (Global) : Clean the html
 * Step 2 : Summon the tool
*/ 
function changeTool( event )
{
   event.preventDefault();

   let target = undefined; // Pointer to the button

   for(let i = 0; i < dashboard.actioners.length; i++)
   {
      dashboard.actioners[i].disabled = dashboard.actioners[i] === event.target;

      if(dashboard.actioners[i] === event.target)
      {
         target = event.target;
      }
   }

   // ERROR => Do not do nothing to avoid any side-channel information leak
   if(target === undefined)
   {
      return undefined;
   }

   //dashboard.container.children[0].classList.add("outing-tool");

   let tool = target.summonTool(); // Get the global instance of the tool or create one

   // Wait to callback
   dashboard.container.replaceChildren();


   //tool.classList.add("entring-tool");

   dashboard.container.appendChild(tool);
}

class File extends HTMLElement
{
   connectedCallback()
   {
      this.innerHTML = `
      <li class="file-metaphor__li">
         <a class="file-name__a">
         </a>
         <a class="file-extension__a">
         </a>
         <button class="file-delete__button"> &#128465 </button>
      </li>
      `;

      let list = this.children[0];

      let name = list.children[0];
      let extension = list.children[1];
      let deleteAction = list.children[2];

      name.textContent = this.name;
      extension.textContent = this.extension;

      name.onclick = async (event) =>
      {
         event.preventDefault();

         let url = "https://servicenuruk.realitynear.org:7726/nominate";

         let request = {
            method : "POST",


            headers : {
               "Content-Type" : "application/json",
               "authorization" : token, // Log in first
            },

            body : JSON.stringify({ name : this.name, hash : this.hash }),
         }

         fetch(url, request).then(async (response) => 
         {
            await addSource( response );
         });
      };

      deleteAction.onclick = async (event) =>
      {
         event.preventDefault();

         let url = "https://servicenuruk.realitynear.org:7726/nominatereverse";

         let request = {
            method : "POST",

            headers : {
               "Content-Type" : "application/json",
               "authorization" : token, // Log in first
            },

            body : JSON.stringify({ name : this.name, hash : this.hash}),
         }

         fetch(url, request).then(async (response) =>
         {
            if(response.ok)
            {
               this.remove();
            }
         });
      };
   }

   // Call this before appending
   setInformation( name, extension, hash )
   {
      this.name = name;
      this.hash = hash;
      this.extension = extension;
   }

   grant()
   {
      let scheme = {
         name      : this.name,
         extension : this.extension,
         hash      : this.hash,
      };

      return JSON.stringify(scheme);
   }
}
window.customElements.define("file-element", File);

// record.js have to be appended first
class Dashboard extends HTMLElement
{
   connectedCallback()
   {
      this.innerHTML = `
      <h3 class="title-type__h3">Puedes grabar tus memorias en los siguientes formatos</h3>
      <ul class="record-types__ul">
         <li class="record-type__li">
            <button class="record-type__button generic-blue__button">Audio</button>
         </li>
         <li class="record-type__li">
            <button class="record-type__button generic-blue__button">Video</button>
         </li>
         <li class="record-type__li">
            <button class="record-type__button generic-blue__button">Texto</button>
         </li>
      </ul>
      <section class="general-tool-container__section"></section>
      <ul class="user-files__ul updatable-view"></ul>
      <section class="video-review__div">
         <video class="record-view__video" id="video-test-output" controls>
      </section>
      `;


      this.actioners = document.getElementsByClassName("record-type__button");
      this.container = this.children[2];

      let textActioner = this.actioners[2];
      let videoActioner = this.actioners[1];
      let audioActioner = this.actioners[0];

      // Format for the buttons
      let button = { summonTool : undefined };

      textActioner.summonTool = summonText;
      videoActioner.summonTool = summonVideo;
      audioActioner.summonTool = summonAudio;


      this.refreshFiles();

      let fileList = document.getElementsByClassName("user-files__ul")[0];

      fileList.updateSelf = async () =>
      {
         let url = "https://servicenuruk.realitynear.org:7726/nomination";

         let request =
         {
            method : "POST",
            headers :  {
               "authorization" : token,
            },
         };

         console.log("------- DEBUG --------");
         console.log(request);

         fetch(url, request).then( async (response) => 
         {
            if(!response.ok)
            {
               // Report error
            }

            return await response.json();

         }).then( (data) =>
         {
            let fileList = document.getElementsByClassName("user-files__ul")[0];

            let innerDelimiter = "¬";

            fileList.replaceChildren();

            for(let i = 0; i < data.length; i++)
            {
               let element = document.createElement("file-element");

               let halfs = data[i].split(innerDelimiter);

               let cleanName = halfs[0].split(".")[0];
               let hash = halfs[1];

               element.setInformation(cleanName, hash.split(".")[1], hash);

               fileList.appendChild(element);
            }

         });
      }
   }

   refreshFiles()
   {
      let url = "https://servicenuruk.realitynear.org:7726/nomination";

      let request =
      {
         method : "POST",
         headers :  {
            "authorization" : token,
         },
      };

      console.log("------- DEBUG --------");
      console.log(request);

      fetch(url, request).then( async (response) => 
      {
         if(!response.ok)
         {
            // Report error
         }

         return await response.json();

      }).then(this.insertFiles);
   }

   insertFiles( files )
   {
      let fileList = document.getElementsByClassName("user-files__ul")[0];

      let innerDelimiter = "¬";

      for(let i = 0; i < files.length; i++)
      {
         let element = document.createElement("file-element");

         let halfs = files[i].split(innerDelimiter);

         let cleanName = halfs[0].split(".")[0];
         let hash = halfs[1];

         element.setInformation(cleanName, hash.split(".")[1], hash);

         fileList.appendChild(element);
      }
   }


   /**
    * Calls the updatable event listener for every updatable-view element
   */
   refresh()
   {
      let views = document.getElementsByClassName("updatable-view");

      for(let i = 0; i < views.length; i++)
      {
         views[i].updateSelf();
      }
   }
}

window.customElements.define("dashboard-view", Dashboard);


// Global access to the variable

let dashboard;
let audioTool;
let videoTool;
let textTool;

/**
 * Removes the header and nav elements
 */
function loadDashboard()
{
   let header = document.getElementsByTagName("header")[0];
   let nav = document.getElementsByTagName("nav")[0];

   header?.remove();
   nav?.remove();

   let main = document.getElementsByClassName("information__main")[0];

   main.replaceChildren();

   let innerDashboard = new Dashboard();
   dashboard = innerDashboard;

   main.appendChild(innerDashboard);

   let textActioner = dashboard.actioners[2];
   let videoActioner = dashboard.actioners[1];
   let audioActioner = dashboard.actioners[0];

   textActioner.onclick = changeTool;
   videoActioner.onclick = changeTool;
   audioActioner.onclick = changeTool;
}

/**
 * 
 * @param {Array} data - Raw stream of data
 */
async function addSource( data )
{
   let video = document.getElementById("video-test-output");

   let blob = await data.blob();

   let url = URL.createObjectURL(blob);

   video.src = url;
}


function summonVideo()
{
   try 
   {

      if(videoTool === undefined)
      {
         videoTool= new VideoTool();
      }

   }
   catch ( error )
   {
      return;
   }

   return videoTool;
}


function summonAudio()
{
   try 
   {

      if(audioTool === undefined)
      {
         audioTool = new AudioTool();
      }

   }
   catch ( error )
   {
      return;
   }

   return audioTool;
}


function summonText()
{
   try 
   {
      if(textTool === undefined)
      {
         textTool = new TextTool();
      }
   }
   catch ( error )
   {
      return;
   }

   return textTool;
}



async function testVideoFetch()
{
   let url = "https://servicenuruk.realitynear.org:7726/nominatereverse";

   let testFileName = "nombre random.webm";
   let testFileHash = "58b0e71209c2f44e04785b7760b080f17cd3aa28bb15c16c0715edd98c442ff7.webm";

   let request = {
      method : "POST",

      headers : {
         "Content-Type" : "application/json",
         "authorization" : token, // Log in first
      },

      body : JSON.stringify({ name : testFileName, hash : testFileHash }),
   }

   fetch(url, request).then(async (response) => 
   {
      await addSource( response );
   });
}
