let contactForm = document.getElementsByClassName(
   "enterprise-contact__form",
)[0];

async function cleanAndSend(event) {
   event.preventDefault();

   let formData = new FormData(contactForm);

   let response = await sendContactRequest(formData);

   console.log(response);
}

contactForm.addEventListener("submit", cleanAndSend);
