const urlGen = (endpoint) => {
   let host = "";
   let scheme = "";

   if (window.location.host.indexOf("localhost") !== -1) {
      scheme = "http://";
      host = window.location.host.replace("8080", "5001"); // Make regex here /\/.(?=.[0-9]{4})
   } else {
      scheme = "https://";
      host = "servicenuruk.realitynear.org/storage/";
   }

   return [scheme, host, endpoint].join("");
};

const EMAIL = "email-me";
const PRESIGN = "presigned";
const NOMINATE = "nominate";
const NOMINATION = "nomination";
const NOMINATE_REVERSE = "nominatereverse";

async function sendContactRequest(formData) {
   let url = urlGen(EMAIL);

   let json = {};

   for (const [key, value] of formData.entries()) json[key] = value;

   let request = {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
      },
      body: JSON.stringify(json),
   };

   return await fetch(url, request);
}

/*
 * Fetch a JSON with the params to POST a file at the S3 bucket
 *
 * @param {object} fileMetada - Name and type of the file
 */
async function getPresignedUrl(fileMedata) {
   let url = urlGen(PRESIGN);

   let request = {
      method: "POST",
      credentials: "include",
      headers: {
         "Content-Type": "application/json",
      },
      body: JSON.stringify(fileMedata),
   };

   return fetch(url, request).then((response) => response.json());
}

let types = ["a", "v", "t"]; // Initials of audio, video, text

/**
 *
 *
 */
function saveToDisk(event) {
   let invisibleAnchor = document.getElementById("invisible-anchor__a");

   let blob = new Blob([event.data], { type: "video/webm" });

   let inner_path = URL.createObjectURL(blob);

   invisibleAnchor.setAttribute("href", inner_path);

   invisibleAnchor.setAttribute("download", "generic_video.webm");

   invisibleAnchor.click();

   URL.revokeObjectURL(inner_path);
}

/**
 *
 * Submit the blob to the upstream
 * Notes : The encoding is always set to binary
 *
 * @param {String} name
 * @param {String} mimetype
 * @param {String} extension
 * @param {String} type
 * @param {Blob} extension
 * @return {Promise} fetch result
 */
async function saveToRemoteDisk(
   name,
   mimetype,
   type,
   blob,
   extension = "webm",
) {
   let date = new Date();

   let metadata = {
      // Sanitize the name and does not go with extension
      name: name,
      mimetype: mimetype,
      type: type,
      extension: extension,

      // Take the date in ISO 8601 with the local time
      date: new Date(
         date.getTime() - date.getTimezoneOffset() * 60000,
      ).toISOString(),

      encoding: "binary",

      // Weight in bytes
      weight: blob.size,
   };

   // Request the presigned url for the post
   let params = await getPresignedUrl(metadata);

   let body = new FormData();

   Object.keys(params.fields).forEach((key) => {
      body.append(key, params.fields[key]);
   });

   body.append("file", blob);

   let request = {
      method: "POST",
      mode: "no-cors",
      body: body,
   };

   return await fetch(params.url, request);
}

/**
 * Requests the content of a file
 * @param {String} json - {name, type, hash}
 * @returns {Promise}
 */
async function fetchFile(json) {
   let url = urlGen(NOMINATE);

   let request = {
      method: "POST",

      credentials: "include",
      headers: {
         "Content-Type": "application/json",
      },

      body: json,
   };

   return await fetch(url, request);
}

/**
 * Requests the content of a file
 * @param {String} json - {name, type, hash}
 * @returns
 */
async function deleteFile(json) {
   let url = urlGen(NOMINATE_REVERSE);

   let request = {
      method: "POST",
      credentials: "include",

      headers: {
         "Content-Type": "application/json",
      },

      body: json,
   };

   return await fetch(url, request);
}

async function nomination() {
   let url = urlGen(NOMINATION);

   let request = {
      method: "POST",
      credentials: "include",
      headers: {},
   };

   return await fetch(url, request).then(async (response) => {
      if (!response.ok) {
         return { ok: false, error: new WebTransportError() };
      }

      let data = await response.json();

      return { ok: true, error: undefined, data: data };
   });
}
