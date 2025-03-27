class TextTool extends HTMLElement {
   static extension = "txt";
   static type = "t";

   connectedCallback() {
      this.innerHTML = `
      <input type="text" placeholder="Nombre del archivo" class="file-name__input">
      <textarea class="document-holder__textarea" rows="10" cols="10" name="text-initial-page"></textarea>
      <button class="audio-upload__button generic-blue__button"><i class="symbol upload"></i></button>
      `;

      this.fileName = this.children[0];
      this.submitButton = this.children[2];
      this.documentHolder = this.children[1];

      this.submitButton.onclick = submitTextFile;
      this.documentHolder.addEventListener("keydown", (event) => {
         textTool.submitButton.disabled = event.target.value.length === 0;
      });

      this.submitButton.disabled = true;
   }

   constructor() {
      super();
   }

   clean() {}
}

window.customElements.define("text-tool", TextTool);

async function submitTextFile(event) {
   event.preventDefault();

   if (textTool.fileName.value.length === 0) {
      notification.teller("Nombre del archivo no válido");
      return;
   }

   let blob = new Blob([textTool.documentHolder.value], { type: "text/plain" });

   textTool.lastDocument = {
      name: textTool.fileName.value,
      mimeType: "text/plain",
      type: TextTool.type,
      blob: blob,
   };

   await saveToRemoteDisk(
      textTool.lastDocument.name,
      textTool.lastDocument.mimeType,
      textTool.lastDocument.type,
      textTool.lastDocument.blob,
      TextTool.extension,
   );

   await dashboard.refresh();

   // Clean the tool

   textTool.submitButton.disabled = false;

   textTool.clean();

   notification.teller("Documento subido con éxito");
}
