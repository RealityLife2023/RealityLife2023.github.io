"use strict";

class Request {
   #host;
   #url;

   constructor() {
      this.#host = window.location.host;
   }

   set url(value) {
      this.#url = value;
   }

   #endpoint() {
      return (this.#host += this.#url);
   }

   #formalRequest() {
      return {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
         body: this.body,
      };
   }

   async fetch() {
      const url = this.#endpoint();
      const request = this.#formalRequest();

      fetch(url, request);
   }
}

class Form {
   static feedbackTag = "q";

   constructor(name, index = 0) {
      this.root = document.getElementsByClassName(name)[index];

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
            this.setFeedback("Este campo es necesario", i);
            return;
         }

         scheme[key] = event.target[key].value;
      }

      return scheme;
   }

   cycle(values) {
      if (this.onSubmit(values)) {
         this.accept();
      } else {
         this.reject();
      }
   }

   createRequest() {
      this.request = new Request();
      return this.request;
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

   constructor() {
      this.root = document.getElementsByClassName(Panel.parentName)[0];

      this.tabs = this.root.children[0].children;

      this.optionPanels = this.root.querySelectorAll("ul");

      for (let i = 0; i < this.optionPanels.length; i++) {
         this.tabs[i].addEventListener("click", this.focusTabTitle(this, i));
      }
   }

   Form($class) {
      const form = new Form($class);

      form.root.addEventListener("submit", this.wrapper(form, this), true);

      form.submitButton = this.root.querySelector("button[type=submit]");

      return form;
   }

   /**
    * Invoke and event that allows to reject or to accept
    * @param {Form} form
    * @param {Panel} parent
    * @returns
    */
   wrapper(form, parent) {
      return async (event) => {
         event.preventDefault();
         event.stopPropagation();

         parent.dis$able("disabled");

         const submision = form.deconstructEvent(event);

         const isValid = form.onSubmit(submision);

         setTimeout(() => {
            try {
               if (isValid) {
                  form.accept(submision);
               } else {
                  form.reject(submision);
               }
            } catch (_) {
               /* LET THE USER KNOW SOMETHING WENT WRONG */
            } finally {
               parent.dis$able("");
            }
         }, 1000);
      };
   }

   focusTabTitle(root, index) {
      return (event) => {
         event.stopPropagation();

         const status = event.target.getAttribute("status");

         root.changeTab(status ? status : "", index);
      };
   }

   /* Possible bug checkout the tab role in this */
   dis$able(status) {
      this.root.setAttribute("status", status);

      this.optionPanels[0].setAttribute("status", status);
      this.optionPanels[1].setAttribute("status", status);
   }

   changeTab(key, index) {
      /* Registration */
      this.tabs[0].setAttribute(
         "status",
         (key === "") & (index === 0) ? "selected" : "",
      );
      this.optionPanels[0].setAttribute(
         "display",
         (key === "") & (index === 0) ? "" : "hidden",
      );

      /* Entrance */
      this.tabs[1].setAttribute(
         "status",
         (key === "") & (index === 1) ? "selected" : "",
      );
      this.optionPanels[1].setAttribute(
         "display",
         (key === "") & (index === 1) ? "" : "hidden",
      );
   }
}
// ** NEW UI ** //

const panel = new Panel();

panel.changeTab("", 0);

const directLogin = panel.Form("login-email__form");

/* Email => (email check) => password => (password check) => (submision) => successful login */
const simpleEmail = panel.Form("simple-email__form");
const passwordCheck = panel.Form("password-check__form");

simpleEmail.onSubmit = validateEmail;

simpleEmail.reject = () => {
   simpleEmail.setFeedback("Email no válido.", 0);
};

simpleEmail.accept = ({ email }) => {
   simpleEmail.root.setAttribute("status", "filled");
   passwordCheck.root.setAttribute("status", "focus");

   /**
    * Set animation for transition
    * Pass the value for a request object
    */
};

passwordCheck.onSubmit = ({ original }) => {
   passwordCheck.isValid = verifyPassword({ original });

   return passwordCheck.isValid;
};

passwordCheck.reject = ({ original, confirmation }) => {
   if (!passwordCheck.isValid) {
      passwordCheck.setFeedback("Mínimo 8 letras, con números y símbolos", 0);
      return;
   }

   if (original !== confirmation) {
      passwordCheck.setFeedback("¡No son iguales!", 1);
   }
};

passwordCheck.accept = () => {
   /**
    * Make the request
    * Set animation for transition to dashboard
    */
};

function validateEmail({ email }) {
   const emailCoherence = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
   return emailCoherence.test(email);
}

// Called when submmited not exactly to change//
function verifyPassword({ original }) {
   console.log(original);
   const strengthRegex =
      /^(?=.*[A-Z].*[A-Z])(?=.*[!@#$&*()-_]{1,})(?=.*[0-9].*[0-9]{2,}).{8}$/;

   return strengthRegex.test(original);
}

async function submitResults(data) {
   let formattedData = new FormData(data);

   let structure = {};

   for (const [key, value] of formattedData.entries()) structure[key] = value;

   let body = JSON.stringify(structure);

   let request = {};

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
