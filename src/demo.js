class FormAudioTool extends HTMLElement
{
   connectedCallback()
   {
      this.innerHTML = `

      <p class="guidance__p">2. Dale a play para grabar tu voz</p>
      <button type="button" class="audio-record__button generic-blue__button"><i class="symbol play"></i></button>
      <button type="button" class="audio-stop__button generic-blue__button"><i class="symbol stop"></i></button>
      <div class="time-bar__div"> 
         <p id="clock"> 0:00</p>
         <p class="guidance__p">3. Escribe lo que quieres que diga tu clon.</p>
         <textarea placeholder="Escribe algo para tu clon." name="dialog" maxlength="100" required></textarea>
         <button type="submit" form="parent-form" class="generic-blue__button">CLONAR</button>
         <div class="bar-container__div">
            <label for="human-voice">Tu voz</label>
            <audio class="audio-output__audio" id="human-voice" controls></audio>
            <label for="clone-model">Tu clon</label>
            <audio class="audio-output__audio" id="clone-model" controls autoplay></audio>
         </div>
      </div>
      `;

      this.recordButton = this.children[1];
      this.stopButton = this.children[2];
      this.submitButton = this.children[3].children[3];

      this.dialog = this.children[3].children[2];

      this.humanAudioOutput = this.children[3].children[4].children[1];

      this.modelAudioOutput = this.children[3].children[4].children[3];

      this.stopButton.disabled = true;
      //this.submitButton.disabled = true;

      this.recordButton.onclick = functions.recordAudio;
      this.stopButton.onclick = functions.storeAudio;
      this.submitButton.onclick = functions.checkForm;
   }

   report()
   {
      return { 
         isValid : (this.lastRecord !== undefined && this.dialog.value !== ""),
         message : "Todavía no has grabado un audio"
      };
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
      let sex = form.sex;
      let nation = form.nation.value;
      let age = form.age.value;
      let email = form.email.value;

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

      if(MediaRecorder.isTypeSupported("video/webm;codecs=opus"))
      {
         formAudioTool.mediaRecorder = new MediaRecorder(mediaStream, { mimeType: "video/webm;codecs=opus"});
      }
      else
      {
         formAudioTool.mediaRecorder = new MediaRecorder(mediaStream, { mimeType: "video/mp3"});
      }

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

   submitForm : async function ()
   {

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
         text : formAudioTool.dialog.value, // Textarea
         model_id : "eleven_multilingual_v2",
         voice_settings: {
            stability : 0.5,
            similarity_boost : 0.35,
         }
      };

      useVoice( voice.voice_id, body, audioOutput );

      deleteVoice( voice.voice_id );
   },

   storeAudio : async function ( event )
   {
      event.preventDefault();

      await formAudioTool.mediaRecorder.stop();

      stopTimer();
   },

   checkForm : function ( event )
   {
      event.preventDefault();

      for(let i = 0; i < parent.importantChildren.length; i++)
      {
         let report = parent.importantChildren[i].report();

         if(!report.isValid)
         {
            notification.teller(report.message);
            return false;
         }
      }

      functions.submitForm();
   },
}

let formAudioTool = new FormAudioTool();

let parent = document.getElementsByClassName("chatbot-context__form")[0];

let checkboxes = document.querySelectorAll("input[type=\"checkbox\"]");

parent.importantChildren = [];
parent.sex = "";

parent.importantChildren.push(checkboxes[0], checkboxes[1], formAudioTool);

checkboxes[0].addEventListener("change", (event) => 
{
   event.preventDefault();

   checkboxes[1].checked = !checkboxes[0].checked;
   checkboxes[1].required = false;
   parent.sex = "Male";
});

checkboxes[1].addEventListener("change", (event) => 
{
   event.preventDefault();

   checkboxes[0].checked = !checkboxes[1].checked;
   checkboxes[0].required = false;
   parent.sex = "Female";
});


checkboxes[0].report = () =>
{
   return {
      isValid : (checkboxes[1].checked || checkboxes[0].checked),
      message : "Debes seleccionar un sexo",
   };
};

checkboxes[1].report = () =>
{
   return {
      isValid : (checkboxes[1].checked || checkboxes[0].checked),
      message : "Debes seleccionar un sexo",
   };
};

let age = document.querySelector("input[type=\"number\"]");

parent.importantChildren.push(age);
parent.age = age;

age.report = () =>
{
   return {
      isValid : (age.value !== ""),
      message : "Debes poner una edad",
   };
};

let email = document.querySelector("input[name=\"email\"]");

parent.importantChildren.push(email);
parent.email = email;

email.report = () =>
{
   return {
      isValid : (email.value !== ""),
      message : "Debes poner un correo",
   };
};

let nation = document.querySelector("select");

parent.importantChildren.push(nation);
parent.nation = nation;

nation.report = () =>
{
   return {
      isValid : (nation.value !== ""),
      message : "Debes seleccionar una nación",
   };
};


parent.appendChild(formAudioTool);

document.body.appendChild(notification);