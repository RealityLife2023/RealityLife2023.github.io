
class PopupView extends HTMLElement
{
   connectedCallback()
   {
      this.innerHTML = `
         <div class="popup-container-background__div">
            <div class="popup-controls__div">
               <button class="exit-popup__button">&#10060;</button>
            </div>
            <section class="video-review__section">
               <video class="record-view__video" id="video-test-output" controls=""></video>
            </section>
      </div> 
      `;
   }
}