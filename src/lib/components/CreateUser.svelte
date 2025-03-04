<script>

  import { buildErrorMessage } from "vite";

</script>


<!-- -->

<form>

   <div class="input-container">
      <label for="username"> </label>
      <input type="text" name="username" value={username}

      autocomplete="email"
      placeholder="direccion@dominio.com"
      required
      />

   {#if error}
      <small class="input-admission-notice"></small>
   {/if}
   </div>
</form>