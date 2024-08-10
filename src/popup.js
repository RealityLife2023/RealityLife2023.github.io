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
            <video class="record-view__video" id="video-test-output" controls></video>
         </section>
      </div> 
      `;

      let container = this.children[0];

      this.quitButton = container.children[0].children[0];

      this.video = container.children[1].children[0];

      this.quitButton.onclick = () => 
      {
         this.style.display = "none";
         this.video.pause();

         this.video.removeAttribute("src");

         this.video.load();
      };
   }

   activate( url )
   {
      this.style.display = "block";

      this.video.src = url;
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