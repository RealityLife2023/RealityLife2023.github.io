function selectForm( selected, unselected)
{
   selected.setAttribute("id", "selected-form");

   unselected.setAttribute("id", "unselected-form");
}

// BAD PRACTICE, SOLVE ASAP
let token;
//

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

/**
console.log("------ DEBUGGING FORMS ------");
console.log(firstChild);
console.log(secondChild);
**/

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

   await fetch("https://servicenuruk.realitynear.org:7726/sign", request).then( async (raw) => {
      
      // ERROR => It is necessary to check the request
      if(!raw.ok)
      {
         // Put red the border bottom of both inputs
         let inputs = [event.target.children[0], event.target.children[1]];

         inputs.forEach( element => { element.style.borderBottom = "2px solid var(--red-warn)";} );
         inputs.forEach( element => { element.onclick = (event) => { event.target.style.borderColor = "2px solid var(--deep-blue)"; }});

         notification.teller("Puede que tengas un error");

         throw new Error("[NETERR] : Possible bad request");
      }

      return raw.json();

   }).then(async (response) =>
      {
         token = response.token;

         notification.teller("Disfruta tu tiempo aquí");

         await setTimeout(loadDashboard, 2000);
   });
});


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

   await fetch("https://servicenuruk.realitynear.org:7726/signup", request).then( async (response) =>
      {
         // ERROR - (user prompt)
         if(!response.ok)
         {
            notification.teller("Puede que tengas un error");

            throw new Error("[NETERR] : Possible bad request");
         }

         notification.teller("¡Has quedado registrado! ingresa con email");
   });
});
