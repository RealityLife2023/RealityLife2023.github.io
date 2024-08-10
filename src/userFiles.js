const fileManager = 
{
   fulfill : async function ( containerElement )
   {
      // TODO => Handle error
      let response = await nomination();

      let data = response.data;

      let innerDelimiter = "¬";

      containerElement.replaceChildren();

      // Efectivly fulfill the container with the information
      for(let i = 0; i < data.length; i++)
      {
         let element = document.createElement("file-element");

         let halfs = data[i].split(innerDelimiter);

         let cleanName = halfs[0];
         let type = halfs[1];
         let hash = halfs[2];

         element.setInformation(cleanName, type, hash);

         containerElement.appendChild(element);
      }
   }
};

class File extends HTMLElement
{
   connectedCallback()
   {
      this.innerHTML = `
      <li class="file-metaphor__li">
         <i class="symbol"></i>
         <a class="file-name__a"></a>
         <button class="file-delete__button"><i class="symbol trash"></i></button>
      </li>
      `;

      let list = this.children[0];

      let name = list.children[1];
      let symbol = list.children[0];
      let deleteAction = list.children[2];

      name.textContent = this.name;

      symbol.classList.add("file-" + this.type);

      name.onclick = async (event) =>
      {
         event.preventDefault();

         fetchFile( this.grant() ).then( async (data) => 
            {
               let blob = await data.blob();

               let url = URL.createObjectURL(blob);

               vWindow.activate( url );
            });
      }

      deleteAction.onclick = async (event) =>
      {
         event.preventDefault();

         deleteFile( this.grant() ).then(async (response) =>
         {
            // TODO => Make plan B
            if(response.ok)
            {
               // TODO => Remove the remanent of the file in the navigator
               this.remove();
            }
         });
      }
   }

   // Call this before appending
   setInformation( name, type, hash)
   {
      this.name = name;
      this.hash = hash;
      this.type = type;
   }

   grant()
   {
      let scheme = {
         name      : this.name,
         hash      : this.hash,
         type      : this.type,
      };

      return JSON.stringify(scheme);
   }
}

window.customElements.define("file-element", File);