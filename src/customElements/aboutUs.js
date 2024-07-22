
class AboutUs extends HTMLElement
{
   connectedCallback()
   {
      this.innerHTML = `
      <article class="about-us__article">
         <p class="paragraph__p">Reality LIFE es una multiplataforma diseñada para mantener vivos tus recuerdos, conocimientos y legado. Enfrentamos la inevitabilidad de la muerte y las enfermedades mentales como el alzheimer y la demencia con una solución que asegura que nunca dejes de ser un apoyo para tus seres queridos. Con Reality LIFE, tus experiencias y sabiduría perduran y continúan guiando a tus familiares y amigos, ofreciendo una conexión eterna e inquebrantable.</p>
         <p class="paragraph__p">Nuestro objetivo es transformar la manera en que te relacionas con tus seres queridos, incluso después de haber partido. En Reality LIFE, preservamos tus recuerdos más valiosos, anécdotas y conocimientos, y los convertimos en un avatar digital interactivo. Permitimos que tus familiares y amigos interactúen contigo de una manera inmersiva y gamificada, asegurando que tus datos sean protegidos y permanezcan inalterados a través de la tecnología Blockchain.</p>
         <img class="paragraph-image__img" src="../static/white-pane.png">
         <p class="paragraph__p">Utilizamos Inteligencia Artificial para capturar y replicar tu personalidad, tus respuestas y tu estilo único de comunicación. Garantizamos la seguridad y autenticidad de tus recuerdos y datos personales, asegurando que solo aquellos que tú elijas tengan acceso. Ofrecemos experiencias de interacción a través de realidad virtual y aumentada, permitiendo que tus seres queridos sientan tu presencia de una manera conmovedora y real.</p>
         <img class="paragraph-image__img" src="../static/white-pane.png">
         <p class="paragraph__p">En Reality LIFE, no solo almacenamos datos, sino que preservamos tu legado emocional e intelectual. Imagina un futuro donde tus hijos, nietos y generaciones venideras puedan conversar contigo, aprender de tus experiencias y sentir tu apoyo constante. Nuestra plataforma no solo honra tu vida, sino que también la celebra, brindando consuelo y compañía a tus seres queridos.</p>
         <p class="paragraph__p">No dejes que el tiempo borre tu impacto en la vida de quienes amas. Con Reality LIFE, tu esencia permanecerá viva y activa, proporcionando un apoyo continuo y valioso. Convierte tus recuerdos en un legado eterno y asegúrate de que tu voz nunca se apague. Reality LIFE: Tu Vida, Tu Legado, Siempre Vivo.</p>
         <button class="call-to-action__button generic-blue__button">COMIENZA AHORA</button>
      </article>
      `;
   }
}

export { AboutUs };
