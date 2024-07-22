class Home extends HTMLElement
{
   connectedCallback()
   {
      this.innerHTML = `
      <article class="home__article">
         <aside class="home-left__aside">
            <img src="../static/manor.png">
            <span class="globe-decoration__span">
               <img src="../static/globe.png">
               <p>Recuerdos</p>
            </span>
            <span class="globe-decoration__span">
               <img src="../static/globe.png">
               <p>Acompañamiento</p>
            </span>
            <span class="globe-decoration__span">
               <img src="../static/globe.png">
               <p>Tecnología</p>
            </span>
         </aside>
         <aside class="home-right__aside">
            <p>Reality LIFE es una plataforma que preserva tus recuerdos, conocimientos y legado, enfrentando la muerte y enfermedades mentales como el alzheimer y la demencia. Utilizando tecnología Blockchain e Inteligencia Artificial, crea un avatar digital interactivo que permite a tus seres queridos mantener una conexión eterna contigo.</p>
            <p>Nuestra tecnología asegura la seguridad y autenticidad de tus datos, ofreciendo una experiencia inmersiva a través de realidad virtual y aumentada. Reality LIFE no solo almacena datos, sino que preserva tu legado emocional e intelectual, proporcionando consuelo y compañía constante a tus seres queridos.</p>
         </aside>
      </article>
      <section class="call-to-action__section">
         <button class="call-to-action__button generic-blue__button">COMIENZA AHORA</button>
         <q class="generic-quote__q">¡Empieza a almacenar tu legado hoy mismo!</q>
         <div class="sign-options__div">
            <p>Regístrate o inicia sesión</p>
            <ul class="sign-options__ul">
               <li class="sign-option__li">
                  <button class="generic-white__button oauth-sign__button">
                     Continúa con Google
                  </button>
               </li>
               <li class="sign-option__li">
                  <button class="generic-white__button" id="slider-trigger-backward">
                     Continúa con email
                  </button>
               </li>
            </ul>
            <p class="sign-call__p">¿Todavía no tienes una cuenta? <a id="slider-trigger-forward">Regístrate aquí</a></p>
         </div>
         <div class="sign-forms__div">
            <form method="POST" class="sign-account__form white-generic__form">
               <input type="email" name="email" placeholder="Tu correo">
               <input type="password" name="password" placeholder="Tu contraseña">
               <a>¿Olvidaste la contraseña?</a>
               <button type="submit" class="generic-blue__button">INGRESAR</button>
            </form>
         </div>
      </section>
      `;
   }
}


export { Home };
