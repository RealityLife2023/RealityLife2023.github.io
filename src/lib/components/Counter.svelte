<script>

   const numbers = $state([1,2,3,4]);
   const factorial = $derived(numbers.reduce((previous, next) => previous * next));

   function inflateSeries()
   {
      numbers.push( numbers.length + 1 );
   }

   $inspect(numbers).with(console.trace);

</script>


<style>

   button
   {
      font-family: 'Times New Roman', Times, serif;
      font-weight: 500;
      font-size : 3rem;
      width : auto;
      height : auto;
      padding : 0.34rem;
   }

   p
   {
      font-size: 6vh;
      font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
      margin : 3rem auto;
   }
</style>


<!---->

<p>{numbers.join(" * ")} = {factorial}</p>

<button onclick={inflateSeries}> Add number </button>