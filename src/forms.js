"use strict";

class Form {
   set endpoint(value) {
      this.url = value;

      // ** TODO : PING DOMAIN ** //
   }

   static feedbackTag = "q";

   constructor(name, index = 0) {
      this.root = document.getElementsByClassName(name)[index];

      this.root.addEventListener("submit", this.wrapper(this), true);

      this.submitButton = this.root.querySelector("button[type=submit]");

      this.fields = this.root.querySelectorAll("div");

      for (let i = 0; i < this.fields.length; i++) {
         this.fields[i].name = this.fields[i].children[0].name;
      }
   }

   deconstructEvent(event) {
      const len = this.fields.length;
      let scheme = {};

      for (let i = 0; i < len; i++) {
         const key = this.fields[i].name;

         if (event.target[key].value === "") {
            this.setFeedback("This field is required!", i);
            return;
         }

         scheme[key] = event.target[key].value;
      }

      return scheme;
   }

   wrapper(root) {
      return async (event) => {
         event.preventDefault();

         const values = root.deconstructEvent(event);

         if (values) {
            root.onSubmit(values);
         }
      };
   }

   /**
    * To be extended
    */
   onSubmit() {}

   /**
    * To be extended
    */
   accept() {}

   /**
    * To be extended
    */
   reject() {}

   setFeedback(message, fieldIndex) {
      const root = this.fields[fieldIndex];

      root.querySelector(Form.feedbackTag).textContent = message;
   }
}

class Panel {
   static parentName = "sign-options__div";

   constructor(index) {
      this.root = document.getElementsByClassName(Panel.parentName).children[
         index
      ];
   }

   disable() {}
}

// ** NEW UI ** //

const simpleEmail = new Form("simple-email__form");

const directLogin = new Form("login-email__form");

const passwordCheck = new Form("password-check__form");

passwordCheck.onSubmit = verifyPassword;

async function validateEmail(email) {
   const regex = /^[\w-\.]+@([\w-]+\.)+[\w.]{2-4}/;
   return regex.test(email);
}

// Called when submmited not exactly to change//
async function verifyPassword({ original, confirmation }) {
   const strengthRegex =
      /^(?=.*[A-Z].*[A-Z])(?=.*[!@#$&*()-_]{1,})(?=.*[0-9].*[0-9]{2,}).{8}$/;

   /** Cases :  */
   if (!strengthRegex.test(original)) {
      console.log(`Your passkey ${original} can improve!`);
   }

   if (confirmation.length === 0) {
   }

   return original === confirmation;
}

async function submitResults(data) {
   let formattedData = new FormData(data);

   let structure = {};

   for (const [key, value] of formattedData.entries()) structure[key] = value;

   let body = JSON.stringify(structure);

   let request = {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
      },
      body: body,
   };

   await fetch("https://servicenuruk.realitynear.org:7726/sign", request)
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
