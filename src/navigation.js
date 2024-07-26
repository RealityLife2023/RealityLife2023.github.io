
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
         <button class="file-delete__button">
         &#128465
         </button>
      </li>
      `;
   }

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
            <li>
               <input class="file-deposit__input" type="file">
            </li>
         </ul>
         <ul class="user-files__ul updatable-view">
         </ul>

         <video id="test-video-output" controls><video/>
      `;

      let actioners = document.getElementsByClassName("record-type__button");

      let audioActioner = actioners[0];
      let videoActioner = actioners[1];
      let textActioner = actioners[2];

      videoActioner.onclick = async (event) => 
      {
         event.preventDefault();

         event.target.setAttribute("disabled", "");

         // Instantiate the video-record
         let videoRecord = new VideoRecord();

         main.appendChild(videoRecord);

         // Set all buttons
         let recordButton = document.getElementsByClassName("video-record__button")[0];
         let stopButton = document.getElementsByClassName("stop-record__button")[0];

         recordButton.onclick = recordVideo;
         stopButton.onclick = storeRecord;
      };

      audioActioner.onclick = async (event) =>
      {
      };

      textActioner.onclick = async (event) =>
      {
         
      };

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
               let element = document.createElement("li");

               let cleanName = data[i].split(innerDelimiter)[0];
               
               element.textContent = cleanName;

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

      console.log(files);

      for(let i = 0; i < files.length; i++)
      {
         let element = document.createElement("li");

         let cleanName = files[i].split(innerDelimiter)[0];

         element.textContent = cleanName;

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

function loadDashboard()
{
   let main = document.getElementsByClassName("information__main")[0];

   main.replaceChildren();

   let innerDashboard = new Dashboard();

   dashboard = innerDashboard;

   main.appendChild(innerDashboard);
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

   video.src = video;
}


async function testVideoFetch()
{
   let url = "https://servicenuruk.realitynear.org:7726/nominatereverse";

   let testFileName = "";
   let testFileHash = "";

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
