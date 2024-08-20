class FormAudioTool extends HTMLElement
{
   connectedCallback()
   {
      this.innerHTML = `

      <button type="button" class="audio-record__button generic-blue__button"><i class="symbol play"></i></button>
      <button type="button" class="audio-stop__button generic-blue__button"><i class="symbol stop"></i></button>
      <p id="clock"> 0:00</p>

      <div class="time-bar__div"> 
         <div class="bar-container__div">
            <audio class="audio-output__audio human-voice" controls></audio>
            <audio class="audio-output__audio clone-model" controls autoplay></audio>
         </div>
      </div>
      <button type="button" class="generic-blue__button">CLONAR</button>
      `;

      this.recordButton = this.children[0];
      this.stopButton = this.children[1];

      this.humanAudioOutput = this.children[3].children[0].children[0];

      this.modelAudioOutput = this.children[3].children[0].children[1];

      this.stopButton.disabled = true;

      this.recordButton.onclick = functions.recordAudio;
      this.stopButton.onclick = functions.storeAudio;
      this.children[4].onclick = functions.generateVoice;

      console.log(this.recordButton.onclick);
   }

   extractHuman( form )
   {
      let formData = new FormData();

      let schema = this.constituteHuman(form);

      Object.keys(schema).forEach( key => { formData.append(key, schema[key]) });

      return formData;
   }

   modelVoice()
   {

      let formData = new FormData();

      let schema = {
         name : "MiguelNav",
         description : "20 years old Colombian with no strong accent",
      }

      Object.keys(schema).forEach( key => { formData.append(key, schema[key]); });

      formData.append("files", this.lastRecord.blob);

      return formData;
   }

   constituteHuman( form )
   {
/*
      let email = form.children[2].value;
      let nation = form.children[3].value;
      let age = form.children[4].value;
*/

      let email = "test@test.com";
      let nation = "Kosovo";
      let age = "34";

      let human = new Human();

      human.nation = nation;
      human.email = email;
      human.age = age;
      human.voiceSample = this.lastRecord.blob;

      return human;
   }
}

window.customElements.define("form-audio-tool", FormAudioTool);

let functions = {

   getRecordData : async function( event )
   {
      event.preventDefault();

      formAudioTool.stopButton.disabled = true;

      let blob = new Blob([event.data], { type : formAudioTool.mediaRecorder.mimeType });

      formAudioTool.lastRecord =
      {
         mimeType : formAudioTool.mediaRecorder.mimeType,
         type : formAudioTool.type,
         blob : blob,
      };

      let blobUrl = URL.createObjectURL(blob); 

      formAudioTool.humanAudioOutput.src = blobUrl;

      formAudioTool.humanAudioOutput.load();
   },

   recordAudio : async function ( event )
   {
      let mediaStream = await resolveMediaOnlyAudio();

      formAudioTool.mediaRecorder = new MediaRecorder(mediaStream, { mimeType :"audio/webm;codecs=opus" });

      formAudioTool.mediaRecorder.addEventListener("dataavailable" , functions.getRecordData);

      formAudioTool.mediaRecorder.srcObject = mediaStream;

      await formAudioTool.mediaRecorder.start();

      formAudioTool.recordButton.disabled = true;
      formAudioTool.stopButton.disabled = false;

      startTimer();
   },

   submitFormTest : async function ( event )
   {
      event.preventDefault();

      // TODO => Check the if the url is valid
      if(formAudioTool.humanAudioOutput.src.length === 0)
      {
         notification.teller("El audio no es válido, intenta nuevamente");
      }

      let human = formAudioTool.extractHuman(parent);

      binaryTrial( human );
   },

   submitForm : async function ( event )
   {
      event.preventDefault();

      // TODO => Check the if the url is valid
      if(formAudioTool.humanAudioOutput.src.length === 0)
      {
         notification.teller("El audio no es válido, intenta nuevamente");
      }

      let human = new Human();

      human.age = parent.age.value;

      human.dialog = parent.dialog.value;

      human.voiceSample = formAudioTool.blob;

      await clone( human );
   },

   storeAudio : async function ( event )
   {
      await formAudioTool.mediaRecorder.stop();

      stopTimer();
   },

   consumeEleven: async function ( event )
   {

      event.preventDefault();

      let human = formAudioTool.modelVoice();

      let voice = await addVoice( human );

      let audioOutput = 
      {
         appendSrc : function ( data )
         {
            let base = "data:audio/mp3;base64,";
            formAudioTool.modelAudioOutput.src = base + data;
         },
      };

      let body = 
      {
         text : "Esta es una prueba con varias horas de antelacion al proyecto",
         model_id : "eleven_multilingual_v2",
         voice_settings: {
            stability : 0.5,
            similarity_boost : 0.35,
         }
      };

      useVoice( voice.voice_id, body, audioOutput );
   },

   generateVoice()
   {
      let audioOutput = 
      {
         appendSrc : function ( url )
         {
            formAudioTool.modelAudioOutput.src = url;
            formAudioTool.modelAudioOutput.load();
         },
      };

      let body = 
      {
         text : "Prueba con varias horas de antelacion al proyecto",
         model_id : "eleven_multilingual_v2",
         voice_settings: {
            stability : 0.5,
            similarity_boost : 0.35,
         }
      };

      useVoice( "Xb7hH8MSUJpSbSDYk0k2", body, audioOutput);
   }
}

let formAudioTool = new FormAudioTool();

let parent = document.getElementsByClassName("chatbot-context__form")[0];

parent.appendChild(formAudioTool);