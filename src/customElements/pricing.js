
class Pricing extends HTMLElement
{
   connectedCallback()
   {
      this.innerHTML = `
      <ul class="pricing-list__ul">
         <li class="table-container__li">
            <table class="plan__table"></table>
         </li>
         <li class="table-container__li">
            <table class="plan__table"></table>
         </li>
         <li class="table-container__li">
            <table class="plan__table"></table>
         </li>
      </ul>
      `;
   }
}

export { Pricing };
