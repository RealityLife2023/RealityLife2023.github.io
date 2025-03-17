"use strict";

class Form {
   set endpoint(value) {
      this.url = value;

      // ** TODO : PING DOMAIN ** //
   }

   constructor(name, index = 0) {
      this.root = document.getElementsByClassName(name)[index];

      this.root.addEventListener("submit", this.onSubmit(this));

      this.submitButton = this.root.querySelector("button[type=submit]");

      this.fields = this.root.querySelectorAll("div");
   }

   onSubmit(root) {
      return (event) => {
         event.preventDefault();

         const form = event.target;

         root.setFeedback(
            validateEmail(form.email.value)
               ? "invalid email, please check"
               : "valid email! please pass",
            0,
         );
      };
   }

   setFeedback(message, fieldIndex) {
      const root = this.fields[fieldIndex];

      root.querySelector("q").textContent = message;
   }
}

async function validateEmail(email) {
   console.log(email);
   const regex = /^[\w-\.]+@([\w-]+\.)+[\w.]{2-4}/;
   return regex.test(email);
}

// ** NEW UI ** //

const directLogin = new Form("login-email__form");

const passwordCheck = new Form("password-check__form");

async function verificationStage() {}

async function verifyPassword(original, decoy) {
   const strengthRegex =
      /^(?=.*[A-Z].*[A-Z])(?=.*[!@#$&*()-_]{1,})(?=.*[0-9].*[0-9]{2,}).{8}$/;

   if (!strengthRegex.test(original)) {
   }

   if (decoy.length === 0) {
      // Do not alert
   }

   return original === decoy;
}

const simpleEmail = new Form("simple-email__form");

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
