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

