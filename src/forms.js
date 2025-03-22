"use strict";

/**
 *  TODOS
 * Finish Panel request rutine
 *    Test with backend
 * Finish registration form checks
 *    Done
 * Checkout google's ID
 *    Done
 * (Optional for deployment)
 * On click check to remove feedback
 * Possible feedback animation
 */

/**
 * Class to use any form
 */
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
   #request;
   #requestBody = {};

   static parentName = "sign-options__div";

   constructor() {
      this.root = document.getElementsByClassName(Panel.parentName)[0];

      this.tabs = this.root.children[0].children;

      this.optionPanels = this.root.querySelectorAll("ul");

      for (let i = 0; i < this.optionPanels.length; i++) {
         this.tabs[i].addEventListener("click", this.focusTabTitle(this, i));
      }

      this.#request = new Requester(this.$then, this.$catch);
   }

   async $then(response) {
      if (response.ok) {
         notification.teller("Disfruta tu tiempo aquí");

         await setTimeout(loadDashboard, 2000);
      }
   }

   $catch(error) {
      notification.teller("Checa por errores o mira tu conexión");
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
    * @returns Listener for click event
    */
   wrapper(form, parent) {
      return async (event) => {
         event.preventDefault();
         event.stopPropagation();

         parent.dis$able("disabled");

         const submision = form.deconstructEvent(event);

         const isValid = form.onSubmit(submision);

         setTimeout(parent.routine(isValid, form, submision), 1000);
      };
   }

   routine(isValid, form, submision) {
      return () => {
         try {
            if (isValid) {
               this.#request.url = form.root.action; // Do not forget to use the root
               this.#addValues(submision);
               form.accept(submision, this.#next(this.#request));
            } else {
               form.reject(submision);
            }
         } catch (_) {
            /* LET THE USER KNOW SOMETHING WENT WRONG */
         } finally {
            this.dis$able("");
         }
      };
   }

   #addValues(values) {
      Object.assign(this.#requestBody, values);

      this.#request.body = this.#requestBody;
   }

   /**
    *
    * @param {Requester} request
    * @returns
    */
   async #next(request) {
      return new Promise((resolve) => {
         resolve(() => {
            request.fetch();
         });
      });
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

simpleEmail.accept = () => {
   simpleEmail.root.setAttribute("status", "filled");
   passwordCheck.root.setAttribute("status", "focus");
};

passwordCheck.onSubmit = ({ original, confirmation }) => {
   const isValid = validatePassword(original);

   if (!isValid) {
      passwordCheck.setFeedback("Mínimo 8 letras, con números y símbolos", 2);
      return false;
   }

   if (original !== confirmation) {
      passwordCheck.setFeedback("¡No son iguales!", 3);
      return false;
   }

   return true;
};

passwordCheck.accept = async ({ _ }, next) => {
   console.log("Accept callback consumed");
   next.then((func) => func());
};

directLogin.onSubmit = ({ email, password }) => {
   if (!validateEmail(email) && !validatePassword(password)) {
      directLogin.setFeedback("Correo o contraseña no válidos");
      return false;
   }
   return true;
};

directLogin.accept = ({ _ }, next) => {
   next.then((func) => func());
};

function validateEmail({ email }) {
   const emailCoherence = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
   return emailCoherence.test(email);
}

function validatePassword(string) {
   const strengthRegex =
      /(?=.*[aA-zZ])(?=.*[!@#$&*()_]{1,})(?=.*[0-9]{1,}).{8,}/;
   return strengthRegex.test(string);
}

window.testJoin = () => {
   const urlGen = (endpoint) => {
      const domain = "https://servicenuruk.realitynear.org";

      return [domain, endpoint].join();
   };

   const url = urlGen("/chat/ask");
   console.log(url);
};
