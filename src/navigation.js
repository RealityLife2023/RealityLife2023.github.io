class Dashboard extends HTMLElement {
   connectedCallback() {
      this.innerHTML = `
      <h3 class="title-type__h3">Puedes grabar tus memorias en los siguientes formatos</h3>
      <ul class="record-types__ul">
         <li class="record-type__li">
            <button class="record-type__button generic-blue__button">Audio</button>
         </li>
         <li class="record-type__li">
            <button class="record-type__button generic-blue__button">Video</button>
         </li>
         <li class="record-type__li">
            <button class="record-type__button generic-blue__button">Texto</button>
         </li>
      </ul>
      <section class="general-tool-container__section"></section>
      <ul class="user-files__ul updatable-view"></ul>
      `;

      this.actioners = document.getElementsByClassName("record-type__button");
      this.container = this.children[2];
      this.userFiles = this.children[3];

      let textActioner = this.actioners[2];
      let videoActioner = this.actioners[1];
      let audioActioner = this.actioners[0];

      textActioner.summonTool = summonText;
      videoActioner.summonTool = summonVideo;
      audioActioner.summonTool = summonAudio;

      this.refresh();
   }

   async refresh() {
      await fileManager.fulfill(this.userFiles);
   }
}

window.customElements.define("dashboard-view", Dashboard);

// Global access to the variable
let dashboard;
let audioTool;
let videoTool;
let textTool;

/**
 * Removes the header and nav elements
 */
function loadDashboard() {
   let header = document.getElementsByTagName("header")[0];
   let nav = document.getElementsByTagName("nav")[0];

   header?.remove();
   nav?.remove();

   let main = document.getElementsByClassName("information__main")[0];

   main.replaceChildren();

   let innerDashboard = new Dashboard();
   dashboard = innerDashboard;

   main.appendChild(innerDashboard);
   document.body.appendChild(vWindow);

   let textActioner = dashboard.actioners[2];
   let videoActioner = dashboard.actioners[1];
   let audioActioner = dashboard.actioners[0];

   textActioner.onclick = changeTool;
   videoActioner.onclick = changeTool;
   audioActioner.onclick = changeTool;
}

/**
 *
 * @param {Array} data - Raw stream of data
 */
async function addSource(data) {
   let video = document.getElementById("video-test-output");
}

function summonVideo() {
   try {
      if (videoTool === undefined) {
         videoTool = new VideoTool();
      }
   } catch (error) {
      return;
   }

   return videoTool;
}

function summonAudio() {
   try {
      if (audioTool === undefined) {
         audioTool = new AudioTool();
      }
   } catch (error) {
      return;
   }

   return audioTool;
}

function summonText() {
   try {
      if (textTool === undefined) {
         textTool = new TextTool();
      }
   } catch (error) {
      return;
   }

   return textTool;
}

/**
 * Step 1 : Disable only the clicked button
 * Step 1.5 (Global) : Clean the html
 * Step 2 : Summon the tool
 */
function changeTool(event) {
   event.preventDefault();

   let target = undefined; // Pointer to the button

   for (let i = 0; i < dashboard.actioners.length; i++) {
      dashboard.actioners[i].disabled = dashboard.actioners[i] === event.target;

      if (dashboard.actioners[i] === event.target) {
         target = event.target;
      }
   }

   // ERROR => Do not do nothing to avoid any side-channel information leak
   if (target === undefined) {
      return undefined;
   }

   //dashboard.container.children[0].classList.add("outing-tool");

   let tool = target.summonTool(); // Get the global instance of the tool or create one

   // Wait to callback
   dashboard.container.replaceChildren();

   //tool.classList.add("entring-tool");

   dashboard.container.appendChild(tool);
}

/* Plug the notification component */
document.body.appendChild(notification);

let emailButton = document.querySelector("#sign-button");

let section = document.getElementsByClassName("generic-quote__q")[0];

emailButton.onclick = (event) => {
   event.preventDefault();
   event.stopPropagation();

   section.scrollIntoView({ behavior: "smooth" });
};

window.successSign = async (profile) => {
   const requester = new Requester(panel.$catch, panel.$then);

   requester.endpoint = "/user/thirdparty";

   await requester.fetch();
};

const buttonWrapper = () => {
   const parent = document.createElement("div");

   parent.classList.add("parent-wrapper");

   window.google.accounts.id.renderButton(parent, {
      type: "icon",
      width: "200",
   });

   document.body.appendChild(parent);

   const button = parent.querySelector("div[role=button]");

   return {
      click: () => {
         button.click();
      },
   };
};

window.onload = () => {
   window.google.accounts.id.initialize({
      client_id: `622906780336-2c3a8e462lh55q976e4tvq1269bu3k36.apps.googleusercontent.com`,
      ux_mode: "popup",
      callback: successSign,
   });

   const wrapper = buttonWrapper();

   window.handleGoogleLogin = () => {
      wrapper.click();
   };
};

/** GATHER ALL THIRDPARTY BUTTONS AND ADD LISTENER */

const thirdparty = document.getElementsByClassName("thirdparty-option-go");

for (let i = 0; i < thirdparty.length; i++) {
   console.log(thirdparty[i]);
   thirdparty[i].onclick = () => {
      window.handleGoogleLogin();
   };
}
