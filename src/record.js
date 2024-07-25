/*
 * Elements that will serve as tools to record the video
 */
class VideoRecord extends HTMLElement
{
   // TODO => avoid innerHTML
   connectedCallback()
   {
      this.innerHTML = `
      <div class="video-record-actions__div">
         <button class="video-record__button generic-blue__button">Grabar</button>
         <button class="stop-record__button generic-blue__button ">Parar</button>
         <input type="text" placeholder="Nombre del archivo" class="file-name__input">
      </div>

      <div class="video-container__div">
	 <video autoplay muted playsinline class="record-screen__video"></video>
	 <p id="clock"></p>
      </div>
      <p id="teller__p"></p>
      `;
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


async function saveToRemoteDisk( event )
{
   let blob = new Blob([event.data], { type : "video/webm" });

   let date = new Date();

   let userNaming = document.getElementsByClassName("file-name__input")[0];

   let teller = document.getElementById("teller__p");

   console.debug(userNaming);

   console.assert(userNaming.value.length != 0);

   let metadata = {

      // Sanitize the name
      name : `${userNaming.value}.webm`,
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
      console.debug(response);
      teller.textContent = "Video subido con exito";

      dashboard.refresh();

   }).catch( (error) => 
   {
      console.log(error);
      teller.textContent = "Algo a ocurrido vuelve porfavor a intentar subirlo";
   });
}

/**
 * Start recording with audio and camera streams
 */
async function recordVideo()
{
   let teller = document.getElementById("teller__p");
   storeRecord.teller = teller;

   let fileName = document.getElementsByClassName("file-name__input")[0];
   if(fileName === "" || fileName.length < 2)
   {
      teller.textContent = "El nombre del archivo no es válido";
      return;
   }

   let videoScreen = document.getElementsByClassName("record-screen__video")[0];

   // Get the microphone and camera
   teller.textContent = "Accediendo al micrófono y cámara";
   let stream = await resolveMedia();
	
   teller.textContent = "Cámara y microfono listo";

   // Wait 2 seconds
   teller.textContent = "Grabando";

   videoScreen.srcObject = stream;

   // Start the recording

   let mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm"});

   mediaRecorder.addEventListener("dataavailable", saveToRemoteDisk);

   storeRecord.mediaRecorder = mediaRecorder;
   storeRecord.videoScreen = videoScreen;

   try
   {
      // Disable the record button
      mediaRecorder.start();
      startTimer();
   }
   catch( error )
   {
      teller.textContent = "Algo salio mal, intenta darle al boton de grabar otra vez o revisa que la camara y el microfono esten conectados";

      console.log( error );

      // Habilitate the record button
   }
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


/* Stops all the streams and calls inderectely a callback for MediaStream*/
async function storeRecord()
{
   storeRecord.teller.textContent = "Guardaremos tu archivo";

   storeRecord.mediaRecorder.stop();

   // Stop the MediaStreamTrack of every device
   storeRecord.videoScreen.srcObject.getTracks().forEach( (track) => track.stop() );

   // Clean the video screen
   storeRecord.videoScreen.pause();

   storeRecord.videoScreen.removeAttribute("src");

   storeRecord.videoScreen.load();
}

let main = document.getElementsByTagName("main")[0];
