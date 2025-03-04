import { redirect } from "@sveltejs/kit";

const root = "http://localhost:7040/sanguche";

export const actions = 
{
   auth : async ({ request }) =>
   {
      const schema = await request.formData();

      const body = JSON.stringify({
         email    : schema.get("email"),
         password : schema.get("password")
      });


      const response = await fetch(root, {

         method : "POST",
         headers : 
         {
            "Content-Type" : "application/json",
         },
         body : body,
      });

      /** Redirect */
      if(response.ok)
      {
         redirect(303, "/dashboard");
      }
   }
};