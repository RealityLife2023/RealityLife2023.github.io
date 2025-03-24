/**
 * Wrapper class for fetch API
 */
class Requester {
   #host;
   #endpoint;
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
   set endpoint(value) {
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

      this.#endpoint = value.substring(startIndex);
   }

   set body(object) {
      this.#body = object;
   }

   #genUrl() {
      if (this.#host.length === 0 || this.#endpoint.length === 0)
         throw SyntaxError("Host or URL are not defined");

      if (this.#isLocal) {
         return `http://${this.#host}${this.#endpoint}`;
      }

      return `https://${this.#host}${this.#endpoint}`;
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
      const url = this.#genUrl();
      const request = this.#formalRequest();

      await fetch(url, request).then(this.#callback).catch(this.#catch);
   }
}
