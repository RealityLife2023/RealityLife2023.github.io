class FormAudioTool extends HTMLElement
{
   connectedCallback()
   {
      this.innerHTML = `

      <button type="button" class="audio-record__button generic-blue__button"><i class="symbol play"></i></button>
      <button type="button" class="audio-stop__button generic-blue__button"><i class="symbol stop"></i></button>
      <div class="time-bar__div"> 
         <p id="clock"> 0:00</p>
         <button class="generic-blue__button">CLONAR</button>
         <div class="bar-container__div">
            <audio class="audio-output__audio human-voice" controls></audio>
            <audio class="audio-output__audio clone-model" controls autoplay></audio>
         </div>
      </div>
      `;

      this.recordButton = this.children[0];
      this.stopButton = this.children[1];

      this.humanAudioOutput = this.children[3].children[2].children[0];

      this.modelAudioOutput = this.children[3].children[2].children[1];

      this.stopButton.disabled = true;

      this.recordButton.onclick = functions.recordAudio;
      this.stopButton.onclick = functions.storeAudio;
      this.children[3].children[1].onclick = functions.consumeEleven;
   }

   extractHuman( form )
   {
      let formData = new FormData();

      let schema = this.constituteHuman(form);

      formData.append("name", schema.email);

      formData.append("files", this.lastRecord.blob);

      formData.append("description", schema.description);

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
      let sex = form.children[1].checked ? "Male" : "Female";
      let nation = form.children[3].value;
      let age = form.children[4].value;
      let email = form.children[2].value;

      let human = new Human();

      human.email = email;

      human.generateDescription(age, sex, nation);

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

      let human = formAudioTool.extractHuman( parent );

      let voice = await addVoice( human ); // Create a clone of the voice

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
         text : parent.children[5].value, // Textarea
         model_id : "eleven_multilingual_v2",
         voice_settings: {
            stability : 0.5,
            similarity_boost : 0.35,
         }
      };

      useVoice( voice.voice_id, body, audioOutput );
   },

   storeAudio : async function ( event )
   {
      event.preventDefault();

      await formAudioTool.mediaRecorder.stop();

      stopTimer();
   },

   consumeEleven: async function ( event )
   {
      event.preventDefault();

      let human = formAudioTool.extractHuman( parent );

      let voice = await addVoice( human ); // Create a clone of the voice

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
         text : "Esta es una prueba con varias horas de antelacion al proyecto",
         model_id : "eleven_multilingual_v2",
         voice_settings: {
            stability : 0.5,
            similarity_boost : 0.35,
         }
      };

      useVoice( voice.voice_id, body, audioOutput );
   },

   generateVoice( event )
   {
      event.preventDefault();

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