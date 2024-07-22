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
               <button class="record-type__button generic-blue__button">Text</button>
            </li>
            <li>
               <input class="file-deposit__input" type="file">
            </li>
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
   }
}

export { Dashboard };

