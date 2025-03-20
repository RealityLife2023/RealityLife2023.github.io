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
            this.setFeedback("Este campo es necesario", i);
            return;
         }

         scheme[key] = event.target[key].value;
      }

      return scheme;
   }

   wrapper(root) {
      return async (event) => {
         event.preventDefault();
         event.stopPropagation();

         const values = root.deconstructEvent(event);

         if (values) {
            root.onSubmit(values);

            root.cycle(values);
         }
         // Invoke and event that allows to reject or to accept, nothing to do with fetching til now
      };
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

   focusTabTitle(root, index) {
      return (event) => {
         event.stopPropagation();

         const status = event.target.getAttribute("status");

         root.changeTab(status ? status : "", index);
      };
   }

   /* Possible bug checkout the tab role in this */
   disable() {
      this.root.setAttribute("status", "disabled");

      this.optionPanels[0].setAttribute("status", "disabled");
      this.optionPanels[1].setAttribute("status", "disabled");
   }

   changeTab(key, index) {
      /* Registration */
      this.tabs[0].setAttribute(
         "status",
         (key === "") & (index === 0) ? "selected" : "",
      );
      this.optionPanels[0].setAttribute(
         "status",
         (key === "") & (index === 0) ? "" : "hidden",
      );

      /* Entrance */
      this.tabs[1].setAttribute(
         "status",
         (key === "") & (index === 1) ? "selected" : "",
      );
      this.optionPanels[1].setAttribute(
         "status",
         (key === "") & (index === 1) ? "" : "hidden",
      );
   }
}

// ** NEW UI ** //

const panel = new Panel();

panel.changeTab("", 0);

const directLogin = new Form("login-email__form");

/* Email => (email check) => password => (password check) => (submision) => successful login */
const simpleEmail = new Form("simple-email__form");
const passwordCheck = new Form("password-check__form");

passwordCheck.onSubmit = verifyPassword;

simpleEmail.onSubmit = validateEmail;

simpleEmail.accept = () => {
   simpleEmail.disable();
   /**
    * Set animation for transition
    * Pass the value for a request object
    */
};

passwordCheck.accept = () => {
   passwordCheck.disable();
   /**
    * Make the request
    * Set animation for transition to dashboard
    */
};

async function validateEmail(email) {
   const regex = /^[\w-\.]+@([\w-]+\.)+[\w.]{2-4}/;
   return regex.test(email);
}

// Called when submmited not exactly to change//
async function verifyPassword(password) {
   const strengthRegex =
      /^(?=.*[A-Z].*[A-Z])(?=.*[!@#$&*()-_]{1,})(?=.*[0-9].*[0-9]{2,}).{8}$/;

   return strengthRegex.test(password);
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
