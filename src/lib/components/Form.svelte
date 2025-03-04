<script>

   import { enhance } from "$app/forms";
   import "$lib/css/library.css";

   let passwordSuggestion = "¿problema con la contra?";

</script>

<style>

</style>

<main class="information__main">
   <div class="sign-forms__div">
      <div class="form-container__div">
         <form 
            method="POST"
            action="?/auth"
            class="sign-account__form white-generic__form"
            id="open-sign-form"
            use:enhance>

            <label>
               <input type="email" name="email" placeholder="Tu correo" required>
            </label>
            <label for="password">
               <input type="password" name="password" placeholder="Tu contraseña" required>
            </label>
            <p class="suggestion">{passwordSuggestion}</p>
            <button type="submit" class="generic-blue__button">INGRESAR</button>
         </form>
      </div>
   </div>
</main>