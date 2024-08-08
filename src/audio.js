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

      <button class="audio-record__button"><i class="symbol play"></i></button>
      <button class="audio-stop__button"><i class="symbol stop"></i></button>
      <button class="audio-upload__button"><i class="symbol upload"></i></button>
      <p id="clock"> 0:00</p>

      <div class="time-bar__div"> 
         <div class="bar-container__div">
            <audio class="audio-output__audio" controls>
         </div>
      </div>

      <p id="teller"></p>

      `;

      this.recordButton = this.children[0];
      this.stopButton = this.children[1];
      this.uploadButton = this.children[2];
      this.timer = this.children[3];
      this.teller = this.children[5];

      this.audioOutput = this.children[4].children[0].children[0];

      this.recordButton.onclick = recordAudio;
      this.stopButton.onclick = storeAudioRecord;

      this.stopButton.disabled = true;
      this.uploadButton.disabled = true;

      this.recordPool = [];
      this.dataPool = [];
   }

   movePlayer()
   {
      this.children[3].setAttribute("id", "fulfilled");
   }
}

window.customElements.define("audio-tool", AudioTool);


async function getRecordData( event )
{
   event.preventDefault();

   let blob = new Blob([event.data], { type : audioTool.currentMediaRecorder.mimeType });

   let blobUrl = URL.createObjectURL(blob); 

   audioTool.audioOutput.src = blobUrl;

   audioTool.audioOutput.load();

   audioTool.audioOutput.addEventListener("loadeddata", () => {

      audioTool.movePlayer();

      //audioTool.audioOutput.play();

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
