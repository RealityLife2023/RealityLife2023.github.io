


class VideoTool extends HTMLElement
{
   connectedCallback()
   {
      this.innerHTML =
      `
      <div class="video-container__div">
       <video autoplay muted playsinline class="record-screen__video"></video>
       <p id="clock"></p>
      </div>

      <button class="record-action__button generic-blue__button">Grabar</button>
      <button class="record-action__button generic-blue__button">Parar</button>
      `;

      let record = this.children[0];

      record.onclick( (event) =>
      {
         event.preventDefault();

         if(this.fileName().length === 0)
         {
            notification.teller("No has puesto un nombre para el archivo");
            return;
         }
         
      });
   }
}
