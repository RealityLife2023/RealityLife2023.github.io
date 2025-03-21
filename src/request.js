/**
 * Wrapper class for fetch API
 */
class Requester {
   #host;
   #url;
   #isLocal;
   #body;

   static localhost = "localhost";

   async #callback(response) {
      return await response.json();
   }

   async #catch(error) {
      return false;
   }

   async submitResults(data) {
      let formattedData = new FormData(data);

      let structure = {};

      for (const [key, value] of formattedData.entries())
         structure[key] = value;

      let body = JSON.stringify(structure);

      let request = {};

      await fetch("https://servicenuruk.realitynear.org:7726/sign", request) // Change endpoint and host
         .then(async (raw) => {
            // ERROR => It is necessary to check the request
            if (!raw.ok) {
               notification.teller("Puede que tengas un error");

               throw new Error("[NETERR] : Possible bad request");
            }

            return raw.json();
         })
         .then(async (response) => {
            token = response.token;

            notification.teller("Disfruta tu tiempo aquí");

            await setTimeout(loadDashboard, 2000);
         });
   }

   /**
    * Initializes the host for future request, taking it from the host
    */
   constructor() {
      if (window.location.host.indexOf(Requester.localhost) !== -1) {
         this.#isLocal = true;
         this.#host = window.location.host.replace("8080", "5001");
      } else {
         this.#host = "servicenuruk.realitynear.org";
      }
   }

   set url(value) {
      this.#url = value;
   }

   set body(object) {
      this.#body = object;
   }

   #endpoint() {
      if (this.#isLocal) {
         return `http://${this.#host}${this.#url}`;
      }

      return `https://${this.#host}${this.#url}`;
   }

   #formalRequest() {
      return {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify(this.#body),
      };
   }

   async fetch() {
      console.log(this.#body);
      return;

      const url = this.#endpoint();
      const request = this.#formalRequest();

      await fetch(url, request).then(this.#callback).catch(this.#catch);
   }
}

async function moduleTest() {
   /*@type Request*/
   const request = new Request();

   request.url = "/user/create";

   request.body = {
      forename: "Miguel",
      surname: "Bye",
      email: "test.night@test.com",
      password: "12345",
   };

   const response = await request.fetch();

   console.log(response);
}

// moduleTest();
