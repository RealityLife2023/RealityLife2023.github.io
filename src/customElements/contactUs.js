class ContactUs extends HTMLElement
{
   connectedCallback()
   {
      this.innerHTML = `
      <!-- Inner function for forms-->
      <ul class="contact-options-list__ul">
         <li class="contact-info__li"><button>Personal</button></li>
         <li class="contact-info__li"><button>Enterprise</button></li>
      </ul>

      <!-- Form for contact -->
      <form method="POST" class="contact__form">
         <input type="email" name="email">
         <button type="submit"></button>
      </form>

      <form method="POST" class="enterprise-contact__form">
         <input type="text" name="enterprise">
         <input type="email" name="email">
         <button type="submit"></button>
      </form>
      `;
   }
}

export { ContactUs };
