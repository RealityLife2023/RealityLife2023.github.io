
class SignForm extends HTMLElement
{
   /**
    * Pure HTML injection
    */
   connectedCallback()
   {
      // TODO => Code a programatically better way to add all this content

      this.id = "sign_generic";

      this.innerHTML = `
      <form method="POST" class="sign-account__form" id="sign_generic">
         <input type="email" name="email" placeholder="INGRESA TU CORREO">
         <input type="password" name="password" placeholder="INGRESA TU CONTRASEÑA">
         <a>¿Olvidaste la contraseña?</a>
         <button type="submit" class="generic-blue__button">INGRESAR</button>
         <p>¿Todavía no tienes una cuenta? <a href="">Regístrate aquí</a></p>
      </form>
      `;

   }


   /**
    * Adds the JS functionality to the page
    * Creates for the form a submit listener for the data
    */
   getDirty()
   {
      let form = document.getElementById(this.id);

      form.addEventListener("submit",  async (event) => {

         event.preventDefault();

         // Get the form content
         let formattedData = new FormData(event.target);

         let structure = {};

         for(const [key,value] of formattedData.entries())
            structure[key] = value;


         let body = JSON.stringify(structure);

         let request = {
            method  : "POST",
            headers :{
               "Content-Type" : "application/json",
            },
            body    : body,
         };

         let div = document.createElement("div");

         div.classList.add("prompt");

         await fetch("https://servicenuruk.realitynear.org:7726/sign", request).then( async (raw) => raw.json()).then(async (response) =>
            {
               token = response.token;

               // ERROR (user prompt)
               if(!response.ok)
               {
                  // Put red the border bottom of both inputs
                  let inputs = [event.target.children[0], event.target.children[1]];

                  inputs.forEach( element => { element.style.borderBottom = "2px solid var(--red-warn)";} );
                  inputs.forEach( element => { element.onclick = (event) => { event.target.style.borderColor = "2px solid var(--deep-blue)"; }});

                  div.textContent = "Uy, puede que tengas un errorsito, puedes contactar a soporte si es necesario";

                  event.target.appendChild(div);
                  
                  throw new Error("Something went wrong");
               }

               div.textContent = "Disfruta tu tiempo aquí";

               event.target.appendChild(div);

               await setTimeout(loadDashboard, 2000);
         });
      });
   }
}

class SignUpForm extends HTMLElement
{
   /**
    * Pure HTML injection
    */
   connectedCallback()
   {
      // TODO => Code a programatically better way to add all this content

      this.id = "signup_generic";

      this.innerHTML = `
      <form method="POST" class="sign-account__form" id="signup_generic">
         <input  class="new-account-field__input" type="text" name="forename" placeholder="INGRESA TU NOMBRE">
         <input class="new-account-field__input" type="text" name="surname" placeholder="INGRESA TU APELLIDO">
         <input class="new-account-field__input" type="email" name="email" placeholder="INGRESA TU CORREO">
         <input class="new-account-field__input" type="password" name="password" placeholder="INGRESA TU CONTRASEÑA">
         <button type="submit" class="generic-blue__button">REGISTRARME</button>
      </form>
      `;

   }


   /**
    * Adds the JS functionality to the page
    * Creates for the form a submit listener for the data
    */
   getDirty()
   {
      let form = document.getElementById(this.id);

      form.addEventListener("submit",  async (event) => {

         event.preventDefault();

         // Get the form content
         let formattedData = new FormData(event.target);

         let structure = {};

         for(const [key,value] of formattedData.entries())
            structure[key] = value;


         let body = JSON.stringify(structure);

         let request = {
            method  : "POST",
            headers :{
               "Content-Type" : "application/json",
            },
            body    : body,
         };

         let div = document.createElement("div");

         div.ClassList.add("prompt");

         await fetch("https://servicenuruk.realitynear.org:7726/signup", request).then( async (response) =>
            {

               // ERROR (user prompt)
               if(!response.ok)
               {
                  div.textContent = "Algo falló, vuelve a intentar y si no funciona contacta a soporte";

                  event.target.appendChild(div);
                  
                  throw new Error("Something went wrong");
               }

               div.textContent = "Disfruta tu tiempo aquí";

               event.target.appendChild(div);

               await setTimeout(loadDashboard, 2000);
         });
      });
   }
}
