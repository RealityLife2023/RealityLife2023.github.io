class VisualizationWindow extends HTMLElement
{
   connectedCallback()
   {
      this.innerHTML = `
      <div class="viwindow-container-background__div">
         <div class="viwindow-controls__div">
            <button class="exit-viwindow__button"><i class="symbol cancel"></i></button>
         </div>
         <section class="video-review__section">
            <video class="record-view__video"  controls></video>
            <audio class="record-view__audio" controls></audio>
            <text class="record-view__text" readonly></text>
         </section>
      </div> 
      `;

      let container = this.children[0];

      this.quitButton = container.children[0].children[0];

      this.video = container.children[1].children[0];
      this.audio = container.children[1].children[1];
      this.text = container.children[1].children[2];

      this.views = {
         "v" : this.video,
         "a" : this.audio,
         "t" : this.text,
      };

      this.currentType = "";

      this.quitButton.onclick = (event) => 
      {
         event.preventDefault();

         this.style.display = "none";

         this.views[this.currentType].removeAttribute("id");

         switch( this.currentType )
         {
            case "v":
               this.video.pause();

               URL.revokeObjectURL(this.video.src);

               this.video.removeAttribute("src");

               this.video.load();
               break;

            case "a":
               this.audio.pause();

               URL.revokeObjectURL(this.audio.src);

               this.audio.removeAttribute("src");
               break;
         }
      };
   }

   constructor()
   {
      super();

      this.activationId = "activated-view";
   }

   activate( type )
   {
      this.currentType = type;
      this.views[type].setAttribute("id", this.activationId)

      this.style.display = "block"; // Appear
   }

   loadResource( url )
   {
      switch( this.currentType )
      {
         case "v":
            this.video.src = url;
            break;

         case "a":
            this.audio.src = url;
            break;

         // TODO => solve text blob problem
         case "t":
            this.text.value = url;
            break;
      }
   }
}

window.customElements.define("view-window", VisualizationWindow);

let vWindow = new VisualizationWindow();

class Notification extends HTMLElement
{
   connectedCallback()
   {
      this.innerHTML = `
      <div class="fixed-bottom__div">
         <div class="notification-bar__div">
            <p class="notification-teller__p">Texto de relleno</p>
         </div>
      </div> 
      `;

      this.bar = this.children[0].children[0];

      this.parapraph = this.bar.children[0];
   }

   /**
    * Pops up a notification for the user
    * 
    * @param {String} message 
    */
   teller( message )
   {
      this.parapraph.textContent = message;

      this.bar.setAttribute("id", "active-notification");

      function hide()
      {
         hide.element.setAttribute("id", "hidden-notification");
      }

      hide.element = this.bar;

      // 5 seconds
      setTimeout(hide, 5000);
   }
}

window.customElements.define("notification-tool", Notification);

let notification = new Notification();