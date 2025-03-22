/**
 * Wrapper class for fetch API
 */
class Requester {
   #host;
   #url;
   #isLocal;
   #body;
   #callback;
   #catch;

   static localhost = "localhost";

   /**
    * Initializes the host for future request, taking it from the host
    */
   constructor($callback, $catch) {
      if (window.location.host.indexOf(Requester.localhost) !== -1) {
         this.#isLocal = true;
         this.#host = window.location.host.replace("8080", "5001");
      } else {
         this.#host = "servicenuruk.realitynear.org";
      }

      this.#callback = $callback;
      this.#catch = $catch;
   }

   /**
    * @param {String} value
    */
   set url(value) {
      console.log(value);
      let count = 0,
         startIndex = 0;

      for (let i = 0; i < value.length; i++) {
         if (value[i] === "/" && count === 2) {
            startIndex = i;
            break;
         } else if (value[i] === "/") {
            count++;
         }
      }

      this.#url = value.substring(startIndex);
      console.log(this.#url);
   }

   set body(object) {
      this.#body = object;
   }

   #endpoint() {
      if (this.#host.length === 0 || this.#url.length === 0)
         throw SyntaxError("Host or URL are not defined");

      if (this.#isLocal) {
         return `http://${this.#host}${this.#url}`;
      }

      return `https://${this.#host}${this.#url}`;
   }

   #formalRequest() {
      if (!this.#body) throw Error("Undefined body");

      return {
         method: "POST",
         credentials: "include",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify(this.#body),
      };
   }

   async fetch() {
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
