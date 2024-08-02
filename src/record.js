
let tool = {
   fileName : undefined,
   teller   : undefined,
   submitButton   : undefined,
   recordButton   : undefined,
   stopButton     : undefined,
   mediaRecorder  : undefined,
   videoScreen    : undefined,
   video          : undefined,
}

/*
* Request all media disposable, this assumes that the microphone and camera are needed
* @returns {DevicesMediaStream} stream from microphone and camera
*/
async function resolveMedia()
{
   let constraints = { "video": true, "audio": true};
	
   return await navigator.mediaDevices.getUserMedia(constraints);
}


/*
* Fetch a JSON with the params to POST a file at the S3 bucket
* 
* @param {object} fileMetada - Name and type of the file
*/
async function getPresignedUrl(fileMedata)
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


/**
 * Start recording with audio and camera streams
 */
async function recordVideo( event )
{
   event.preventDefault();

   if(tool.fileName.value === "" || tool.fileName.length < 2)
   {
      tool.teller.textContent = "El nombre del archivo no es válido";
      return;
   }

   // Get the microphone and camera
   tool.teller.textContent = "Accediendo al micrófono y cámara";
   
   tool.teller.textContent = "Cámara y microfono listo";

   // Wait 2 seconds
   tool.teller.textContent = "Grabando";

   let stream = await resolveMedia();
   tool.mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm"});


   tool.mediaRecorder.addEventListener("dataavailable", ( event ) => {tool.video = event});

   tool.videoScreen.srcObject = stream;

   // Start the recording
   try
   {
      // Disable the record button
      tool.recordButton.disabled = true;
      tool.stopButton.disabled = false;

      tool.mediaRecorder.start();
      startTimer();
   }
   catch( error )
   {
      tool.teller.textContent = "Algo salio mal, intenta darle al boton de grabar otra vez o revisa que la camara y el microfono esten conectados";

      console.log( error );
      // Habilitate the record button
      tool.recordButton.disabled = false;
   }
}

/* Stops all the streams and calls inderectely a callback for MediaStream*/
async function storeRecord( event )
{
   event.preventDefault();

   tool.teller.textContent = "Guardaremos tu archivo";

   tool.mediaRecorder.stop();

   stopTimer();

   // Stop the MediaStreamTrack of every device
   tool.videoScreen.srcObject.getTracks().forEach( (track) => track.stop() );

   tool.submitButton.disabled = false;

   // Clean the video screen
   tool.videoScreen.pause();

   tool.videoScreen.removeAttribute("src");

   tool.videoScreen.load();
}

/**
 * 
 * Captures click event of submit button and expects the tool to have the video data stored
 * 
 * @param {Event} event 
 */
async function saveToRemoteDisk( event )
{
   event.preventDefault();

   tool.submitButton.disabled = true;

   let blob = new Blob([tool.video.data], { type : "video/webm" });

   let date = new Date();

   console.assert(tool.fileName.value.length != 0);

   let metadata = {

      // Sanitize the name and does not go with extension
      name : `${tool.fileName.value}`,
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
   let params = await getPresignedUrl(metadata);

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
      console.log("========= DEBUG ========");
      console.debug(response);

      tool.teller.textContent = "Video subido con éxito";

      tool.recordButton.disabled = false;

      tool.stopButton.disabled = true;
      tool.submitButton.disabled = true;

      dashboard.refresh();

   }).catch( (error) => 
   {
      console.log(error);
      tool.teller.textContent = "Algo a ocurrido vuelve porfavor a intentar subirlo";

      tool.submitButton.disabled = false;
   });
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

      tool.teller = this.children[3];
      tool.fileName = this.children[0];

      tool.videoScreen = this.children[1].children[0];
      tool.recordButton = this.children[2].children[0];
      tool.stopButton = this.children[2].children[1];
      tool.submitButton = this.children[2].children[2];

      /* Settings for the elements */

      tool.recordButton.onclick = recordVideo;
      tool.stopButton.onclick = storeRecord;
      tool.submitButton.onclick = saveToRemoteDisk;

      tool.submitButton.disabled = true;
      tool.stopButton.disabled = true;
   }
}

// Define the custom element right here!
window.customElements.define("video-record", VideoRecord);

