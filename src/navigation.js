
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
         <ul class="user-files__ul">
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

      }).then(insertFiles);
   }


   insertFiles( files )
   {
      let fileList = document.getElementsByClassName("user-files__ul")[0];

      console.log(files);

      for(let i = 0; i < files.length; i++)
      {
         let element = document.createElement("li");

         element.textContent = files[i];

         fileList.appendChild(element);
      }
   }
}


window.customElements.define("dashboard-view", Dashboard);



function loadDashboard()
{
   let main = document.getElementsByClassName("information__main")[0];

   main.replaceChildren();

   let dashboard = new Dashboard();

   main.appendChild(dashboard);

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

