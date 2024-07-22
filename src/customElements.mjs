/**
 * This all are custom elements, do not touch it until it gets tests for all screens and uses
 */

import Home from "./customElements/home.js";
import Team from "./customElements/team.js";
import Demo from "./customElements/demo.js";

import AboutUs from "./customElements/aboutUs.js";
import Pricing from "./customElements/pricing.js";

import ContactUs from "./customElements/contactUs.js";
import Dashboard from "./customElements/dashboard.js";

import { SignFrom, SignUpForm } from "./customElements/signForms.js";


// Registering all the custom elements
window.customElements.define("about-us", AboutUs);
window.customElements.define("main-home", Home);
window.customElements.define("sign-form", SignForm);
window.customElements.define("contact-us", ContactUs);
window.customElements.define("price-info", Pricing);
window.customElements.define("team-info", Team);
window.customElements.define("demo-form", Demo);
window.customElements.define("main-dashboard", Dashboard);


