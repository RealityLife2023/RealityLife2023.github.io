function selectForm( selected, unselected)
{
   selected.setAttribute("id", "selected-form");

   unselected.setAttribute("id", "unselected-form");

}

let firstChild = document.getElementById("open-sign-form");

let secondChild = document.getElementById("open-signup-form");

// Trigger for events

let anchor = document.getElementById("slider-trigger-forward");

let button = document.getElementById("slider-trigger-backward");


anchor.onclick = (event) =>
{
   event.preventDefault();

   selectForm( secondChild, firstChild );
};

button.onclick = (event) =>
{
   event.preventDefault();

   selectForm( firstChild, secondChild );
};

console.log("------ DEBUGGING FORMS ------");

console.log(firstChild);
console.log(secondChild);


if( !firstChild || !secondChild)
{
   console.log("Empty variables, please check typos");

   selectForm = () => {};
}

firstChild.addEventListener("submit",  async (event) => {

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


// SignUp functionality

secondChild.addEventListener("submit",  async (event) => {

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

         div.textContent = "¡Has quedado registrado! Te invitamos a que ingreses con email";

         event.target.appendChild(div);

         await setTimeout(loadDashboard, 2000);
   });
});
}
