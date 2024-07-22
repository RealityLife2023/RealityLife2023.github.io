class Team extends HTMLElement
{
   connectedCallback()
   {
      this.innerHTML = `
      <ul class="team-list_ul">
         <li class="team-member__li">
            <span class="member-content__span"></span>
         </li>
         <li class="team-member__li">
            <span class="member-content__span"></span>
         </li>
      </ul>
      <p class="story-telling__p"></p>
      `;

   }
}

export { Team };
