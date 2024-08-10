class TextTool extends HTMLElement
{
   connectedCallback()
   {
      this.innerHTML = 
      `
      <input type="text" placeholder="Nombre del archivo" class="file-name__input">
      <textarea rows="10" cols="10" name="text-initial-page"></textarea>
      `;
   }

   constructor()
   {
      super();

      this.type = "t";
   }
}

window.customElements.define("text-tool", TextTool);

