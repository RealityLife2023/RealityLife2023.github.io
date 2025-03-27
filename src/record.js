/*
 * Elements that will serve as tools to record the video
 */
class VideoTool extends HTMLElement {
   static extension = "webm";
   static type = "v";

   // TODO => avoid innerHTML
   connectedCallback() {
      this.innerHTML = `
         <input type="text" placeholder="Nombre del archivo" class="file-name__input">
         <div class="video-container__div">
            <video autoplay muted playsinline class="record-screen__video"></video>
            <p id="clock">0:00</p>
         </div>
         <div class="video-record-actions__div">
            <button class="video-record__button generic-blue__button"><i class="symbol play"></i></button>
            <button class="stop-record__button generic-blue__button "><i class="symbol stop"></i></button>
            <button class="generic-blue__button "><i class="symbol upload"></i></button>
         </div>
      `;

      this.fileName = this.children[0];

      this.videoScreen = this.children[1].children[0];
      this.recordButton = this.children[2].children[0];
      this.stopButton = this.children[2].children[1];
      this.submitButton = this.children[2].children[2];

      /* Settings for the elements */

      this.recordButton.onclick = recordVideo;
      this.stopButton.onclick = storeRecord;
      this.submitButton.onclick = submitVideoFile;

      this.submitButton.disabled = true;
      this.stopButton.disabled = true;
   }

   constructor() {
      super();
   }
}

// Define the custom element right here!
window.customElements.define("video-tool", VideoTool);

/*
 * Request all media disposable, this assumes that the microphone and camera are needed
 *
 * @returns {DevicesMediaStream} stream from microphone and camera
 */
async function resolveMedia() {
   let constraints = { video: true, audio: true };

   return await navigator.mediaDevices.getUserMedia(constraints);
}

/**
 * Start recording with audio and camera streams
 */
async function recordVideo(event) {
   event.preventDefault();

   if (videoTool.fileName.value === "" || videoTool.fileName.length < 2) {
      notification.teller("El nombre del archivo no es válido");
      return;
   }

   // Get the microphone and camera
   notification.teller("Accediendo al micrófono y cámara");

   let stream = await resolveMedia();

   if (MediaRecorder.isTypeSupported("video/webm")) {
      videoTool.mediaRecorder = new MediaRecorder(stream, {
         mimeType: "video/webm",
      });
   } else {
      videoTool.mediaRecorder = new MediaRecorder(stream, {
         mimeType: "video/mp4",
      });
   }

   videoTool.mediaRecorder.addEventListener("dataavailable", (event) => {
      let blob = new Blob([event.data], {
         type: videoTool.mediaRecorder.mimeType,
      });

      videoTool.lastVideo = {
         name: videoTool.fileName.value,
         mimeType: videoTool.mediaRecorder.mimeType,
         type: videoTool.type,
         blob: blob,
      };
   });

   videoTool.videoScreen.srcObject = stream;

   // Start the recording
   try {
      // Disable the record button
      videoTool.recordButton.disabled = true;
      videoTool.stopButton.disabled = false;

      videoTool.mediaRecorder.start();
      startTimer();
   } catch (error) {
      notification.teller(
         "Algo salio mal, intenta darle al boton de grabar otra vez o revisa que la camara y el microfono esten conectados",
      );

      console.log(error);
      // Habilitate the record button
      videoTool.recordButton.disabled = false;
   }
}

/**
 * Stops all the streams and calls inderectely a callback for MediaStream
 */
async function storeRecord(event) {
   event.preventDefault();

   videoTool.mediaRecorder.stop();

   stopTimer();

   // Stop the MediaStreamTrack of every device
   videoTool.videoScreen.srcObject.getTracks().forEach((track) => track.stop());

   videoTool.submitButton.disabled = false;

   // Clean the video screen
   videoTool.videoScreen.pause();

   videoTool.videoScreen.removeAttribute("src");

   videoTool.videoScreen.load();

   notification.teller("Ya puedes guardar tu archivo");
}

/**
 *
 */
async function submitVideoFile(event) {
   event.preventDefault();

   // ERROR => Record not saved
   if (videoTool.lastVideo === undefined) {
   }

   videoTool.submitButton.disabled = true;

   await saveToRemoteDisk(
      videoTool.lastVideo.name,
      videoTool.lastVideo.mimeType,
      videoTool.lastVideo.type,
      videoTool.lastVideo.blob,
   );

   await dashboard.refresh();

   notification.teller("Audio subido con éxito");

   videoTool.recordButton.disabled = false;
}
