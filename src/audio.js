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

      `;

      this.fileName = this.children[0];
      this.recordButton = this.children[1];
      this.stopButton = this.children[2];
      this.submitButton = this.children[3];
      this.timer = this.children[4];

      this.audioOutput = this.children[5].children[0].children[0];

      this.recordButton.onclick = recordAudio;
      this.stopButton.onclick = storeAudioRecord;
      this.submitButton.onclick = submitAudioFile;

      this.stopButton.disabled = true;
      this.submitButton.disabled = true;
   }

   constructor()
   {
      super();

      this.type = "a";
   }

   movePlayer()
   {
      this.children[5].children[0].setAttribute("id", "fulfilled");
   }
}

window.customElements.define("audio-tool", AudioTool);


/*
* Request only the audio media to the navigator
* @returns {DevicesMediaStream} stream from only microphone
*/
async function resolveMediaOnlyAudio()
{
   let constraints = { "audio": true };
	
   return await navigator.mediaDevices.getUserMedia(constraints);
}


async function recordAudio( event )
{
   event.preventDefault();

   if(audioTool.fileName.value.length === 0)
   {
      notification.teller("Nombre del archivo no válido");
      return;
   }

   let mediaStream = await resolveMediaOnlyAudio();

   let mediaRecorder = new MediaRecorder(mediaStream, { mimeType :"audio/webm;codecs=opus" });

   mediaRecorder.addEventListener("dataavailable" , getRecordData);

   //audioTool.recordPool.push(mediaRecorder); // TODO => LocalStorage pool

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
      notification.teller("Algo salio mal, intenta darle al botón de grabar otra vez o revisa que la cámara y el micrófono estén conectados");

      console.log( error );

      audioTool.recordButton.disabled = false; // Record available again
   }
}


/**
 * Captures the event of "dataavailable" in the MediaRecorder
 */
async function getRecordData( event )
{
   event.preventDefault();

   audioTool.stopButton.disabled = true;

   let blob = new Blob([event.data], { type : audioTool.currentMediaRecorder.mimeType });

   audioTool.lastRecord =
   {
      name : audioTool.fileName.value,
      mimetype : audioTool.currentMediaRecorder.mimeType,
      type : audioTool.type,
      blob : blob,
   };

   let blobUrl = URL.createObjectURL(blob); 

   audioTool.audioOutput.src = blobUrl;

   audioTool.audioOutput.load();

   audioTool.audioOutput.addEventListener("loadeddata", () => {

      audioTool.movePlayer();
   });

   audioTool.submitButton.disabled = false;
}


/**
 *
 */
async function submitAudioFile( event )
{
   event.preventDefault();

   // ERROR => Record not saved
   if(audioTool.lastRecord === undefined)
   {
      console.log("[ERR] : Last record is empty check record process");
   }

   audioTool.submitButton.disabled = true;

   await saveToRemoteDisk(audioTool.lastRecord.name, audioTool.lastRecord.mimeType, audioTool.lastRecord.type, audioTool.lastRecord.blob);

   await dashboard.refresh();

   audioTool.recordButton.disabled = false;

   notification.teller("Audio subido con éxito");
}



/**
 *
 */
async function storeAudioRecord()
{
   await audioTool.currentMediaRecorder.stop();

   notification.teller("Audio grabado con éxito");

   stopTimer();

   //audioTool.loadAnimation();
}
