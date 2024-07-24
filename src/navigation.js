
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

            console.log(data);

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



// Take all the buttons
// Assing a global listener to them

/*

let views = ["about-us", "team-info", "price-info", "demo-form", "contact-us", "sign-form"];

let lastComponent;

let navButtons = document.getElementsByClassName("panel-option__button");


for(let i = 0; i < navButtons.length; i++)
{
   navButtons[i].shadow = views[i];
   navButtons[i].onclick = testWebComponents;
}

console.log("All settled up! These are the targeted buttons");
console.debug(navButtons);
*/

