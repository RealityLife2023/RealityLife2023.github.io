/*
 * Elements that will serve as tools to record the video
 */
class VideoRecord extends HTMLElement
{
   // TODO => avoid innerHTML
   connectedCallback()
   {
      this.innerHTML = `
         <input type="text" placeholder="Nombre del archivo" class="file-name__input">
         <div class="video-container__div">
            <video autoplay muted playsinline class="record-screen__video"></video>
            <p id="clock">0:00</p>
         </div>
         <div class="video-record-actions__div">
            <button class="video-record__button generic-blue__button">Grabar</button>
            <button class="stop-record__button generic-blue__button ">Parar</button>
            <button class="generic-blue__button ">Subir</button>
         </div>
         <p id="teller__p"></p>
      `;

      this.teller = this.children[3];
      this.fileName = this.children[0];

      this.videoScreen = this.children[1][0];
      this.recordButton = this.children[2][0];
      this.stopButton = this.children[2][1];
      this.submitButton = this.children[2][2];

      this.mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm"});

      /* Settings for the elements */

      this.recordButton.onclick = this.recordVideo;
      this.stopButton.onclick = this.storeRecord;
      this.submitButton.onclick = this.saveToRemoteDisk;

      this.submitButton.disabled = true;
      this.stopButton.onclick = true;
   }

   async saveToRemoteDisk()
   {
      let blob = new Blob([this.stopEvent.data], { type : "video/webm" });

      let date = new Date();

      console.assert(this.fileName.value.length != 0);

      let metadata = {

         // Sanitize the name
         name : `${this.fileName.value}.webm`,
         mimetype : "video/webm",
         extension : "webm",
         // Take the date in ISO 8601 with the local time
         date : new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString(),
         // Take the encoding
         encoding : "binary",
         // Weight in bytes
         weight : blob.size,
      };

      console.debug(metadata);

      // Request the presigned url for the post
      let params = await this.getPresignedUrl(metadata);

      let body = new FormData();

      Object.keys(params.fields).forEach( key => { body.append(key, params.fields[key]) });

      body.append("file", blob);

      let request = 
         {
            method  : "POST",
            mode    : "no-cors",
            body    : body,
         };

      await fetch(params.url, request).then( (response) => {
         // Debug the result
         console.debug(response);
         this.teller.textContent = "Video subido con exito";

         dashboard.refresh();

      }).catch( (error) => 
      {
         console.log(error);
         this.teller.textContent = "Algo a ocurrido vuelve porfavor a intentar subirlo";

         this.submitButton.disabled = false;
      });
   }


   /*
   * Fetch a JSON with the params to POST a file at the S3 bucket
   * 
   * @param {object} fileMetada - Name and type of the file
   */
   async getPresignedUrl(fileMedata)
   {
      let url = "https://servicenuruk.realitynear.org:7726/presigned";

      let request = 
         {
            method  : "POST",
            headers: {
               "Content-Type" : "application/json",
               "authorization" : token, // <- Global token defined in the registrationForms
            },
            body    : JSON.stringify(fileMedata),
         };

      return fetch(url, request).then((response) => response.json());
   }

   captureMediaEvent( event )
   {
      this.stopEvent = event;
   }

   /**
    * Start recording with audio and camera streams
    */
   async recordVideo()
   {

      if(this.fileName === "" || this.fileName.length < 2)
      {
         this.teller.textContent = "El nombre del archivo no es válido";
         return;
      }

      // Get the microphone and camera
      this.teller.textContent = "Accediendo al micrófono y cámara";
      let stream = await resolveMedia();
      
      this.teller.textContent = "Cámara y microfono listo";

      // Wait 2 seconds
      this.teller.textContent = "Grabando";

      this.videoScreen.srcObject = stream;

      this.mediaRecorder.addEventListener("dataavailable", captureMediaEvent);

      // Start the recording
      try
      {
         // Disable the record button
         this.recordButton.disabled = true;
         this.stopButton.disabled = false;

         this.mediaRecorder.start();
         startTimer();
      }
      catch( error )
      {
         this.teller.textContent = "Algo salio mal, intenta darle al boton de grabar otra vez o revisa que la camara y el microfono esten conectados";

         console.log( error );
         // Habilitate the record button
         this.recordButton.disabled = false;
      }
   }

   /* Stops all the streams and calls inderectely a callback for MediaStream*/
   async storeRecord()
   {
      this.teller.textContent = "Guardaremos tu archivo";

      this.mediaRecorder.stop();

      stopTimer();

      // Stop the MediaStreamTrack of every device
      this.videoScreen.srcObject.getTracks().forEach( (track) => track.stop() );

      this.submitButton.disabled = false;

      // Clean the video screen
      this.videoScreen.pause();

      this.videoScreen.removeAttribute("src");

      this.videoScreen.load();
   }
}

// Define the custom element right here!
window.customElements.define("video-record", VideoRecord);


/*
* Request all media disposable, this assumes that the microphone and camera are needed
* @returns {DevicesMediaStream} stream from microphone and camera
*/
async function resolveMedia()
{
   let constraints = { "video": true, "audio": true};
	
   return await navigator.mediaDevices.getUserMedia(constraints);
}


function saveToDisk( event )
{
   let invisibleAnchor = document.getElementById("invisible-anchor__a");

   let blob = new Blob([event.data], { type : "video/webm" });

   let inner_path = URL.createObjectURL(blob);

   invisibleAnchor.setAttribute("href", inner_path);

   invisibleAnchor.setAttribute("download", "generic_video.webm");

   invisibleAnchor.click();

   URL.revokeObjectURL(inner_path);
}

let main = document.getElementsByTagName("main")[0];
