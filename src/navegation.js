
let token;

function testWebComponents( event )
{
   if(lastComponent)
      lastComponent.remove();

   let htmlPiece = document.createElement(event.target.shadow);

   let main = document.getElementsByClassName("information__main")[0];

   main.appendChild(htmlPiece);

   lastComponent = htmlPiece;
}


// Take all the buttons
// Assing a global listener to them

/*

let views = ["about-us", "team-info", "price-info", "demo-form", "contact-us", "sign-form"];

let lastComponent;

let navButtons = document.getElementsByClassName("panel-option__button");


for(let i = 0; i < navButtons.length; i++)
{
   navButtons[i].shadow = views[i];
   navButtons[i].onclick = testWebComponents;
}

console.log("All settled up! These are the targeted buttons");
console.debug(navButtons);
*/

 
