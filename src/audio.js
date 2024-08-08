/*
* Request only the audio media to the navigator
* @returns {DevicesMediaStream} stream from only microphone
*/
async function resolveMediaOnlyAudio()
{
   let constraints = { "audio": true };
	
   return await navigator.mediaDevices.getUserMedia(constraints);
}

class AudioTool extends HTMLElement
{
   connectedCallback()
   {
      this.innerHTML = `

      <input type="text" placeholder="Nombre del archivo" class="file-name__input">
      <button class="audio-record__button generic-blue__button"><i class="symbol play"></i></button>
      <button class="audio-stop__button generic-blue__button"><i class="symbol stop"></i></button>
      <button class="audio-upload__button generic-blue__button"><i class="symbol upload"></i></button>
      <p id="clock"> 0:00</p>

      <div class="time-bar__div"> 
         <div class="bar-container__div">
            <audio class="audio-output__audio" controls>
         </div>
      </div>

      <p id="teller"></p>

      `;

      this.fileName = this.children[0];
      this.recordButton = this.children[1];
      this.stopButton = this.children[2];
      this.submitButton = this.children[3];
      this.timer = this.children[4];
      this.teller = this.children[6];

      this.audioOutput = this.children[5].children[0].children[0];

      this.recordButton.onclick = recordAudio;
      this.stopButton.onclick = storeAudioRecord;
      this.submitButton.onclick = saveAudioToRemoteDisk;

      this.stopButton.disabled = true;
      this.submitButton.disabled = true;

      this.recordPool = [];
      this.dataPool = [];
   }

   movePlayer()
   {
      this.children[5].children[0].setAttribute("id", "fulfilled");
   }
}

window.customElements.define("audio-tool", AudioTool);


async function getRecordData( event )
{
   event.preventDefault();

   audioTool.stopbutton.disabled = true;

   let blob = new Blob([event.data], { type : audioTool.currentMediaRecorder.mimeType });
   saveAudioToRemoteDisk.blob  = blob;

   let blobUrl = URL.createObjectURL(blob); 

   audioTool.audioOutput.src = blobUrl;

   audioTool.audioOutput.load();

   audioTool.audioOutput.addEventListener("loadeddata", () => {

      audioTool.movePlayer();

      //audioTool.audioOutput.play();

   });

   audioTool.submitButton.disabled = false;
}

async function saveAudioToRemoteDisk( event )
{
   event.preventDefault();

   let date = new Date();

   let metadata = {

      // Sanitize the name and does not go with extension
      name : `${audioTool.fileName.value}`,
      mimetype : saveAudioToRemoteDisk.blob.type,
      extension : saveAudioToRemoteDisk.blob.type.split("/")[1],
      // Take the date in ISO 8601 with the local time
      date : new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString(),
      // Take the encoding
      encoding : "binary",
      // Weight in bytes
      weight : saveAudioToRemoteDisk.blob.size,
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

      audioTool.teller.textContent = "Audio subido con éxito";

      audioTool.recordButton.disabled = false;

      audioTool.stopButton.disabled = true;
      audioTool.submitButton.disabled = true;

      dashboard.refresh();

   }).catch( (error) => 
   {
      console.log( error );

      audioTool.teller.textContent = "Algo a ocurrido vuelve porfavor a intentar subirlo";

      audioTool.submitButton.disabled = false;
   });
}


async function recordAudio( event )
{
   event.preventDefault();

   let mediaStream = await resolveMediaOnlyAudio();

   let mediaRecorder = new MediaRecorder(mediaStream);

   mediaRecorder.addEventListener("dataavailable" , getRecordData);

   audioTool.recordPool.push(mediaRecorder);

   mediaRecorder.srcObject = mediaStream;

   try
   {
      audioTool.currentMediaRecorder = mediaRecorder;

      audioTool.stopButton.disabled = false;
      audioTool.recordButton.disabled = true;

      await audioTool.currentMediaRecorder.start();

      startTimer();
   }
   catch( error )
   {
      audioTool.teller.textContent = "Algo salio mal, intenta darle al boton de grabar otra vez o revisa que la camara y el microfono esten conectados";

      console.log( error );

      // Habilitate the record button
      audioTool.recordButton.disabled = false;
   }
}

async function storeAudioRecord()
{
   await audioTool.currentMediaRecorder.stop();

   audioTool.teller.textContent = "Audio grabado con éxito";

   stopTimer();

   //audioTool.loadAnimation();

   //audiotTool.serveNewAudio();
}
