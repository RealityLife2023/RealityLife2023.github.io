<script>
   export let name;
   export let description;
   export let scientificName;
   export let profileSrc;

</script>


<!-- -->

<div>
   <div class="profile-parent">
      <img src={profileSrc} alt="" class="profile">
   </div>

   <p class="name">{name}</p>
   <p class="scientific-name">{scientificName}</p>
   <p class="description">{description}</p>
</div>