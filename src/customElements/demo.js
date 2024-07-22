class Demo extends HTMLElement
{
   connectedCallback()
   {
      this.innerHTML = `
      <form method="POST" class="chatbot-context__form">
         <input type="button" name="male">
         <input type="button" name="female">
         <input type="email" name="email">
         <input type="datetime" name="nation">
         <button type="submit"></button>
      </form>
      `;
      
   }
}

export { Demo };
