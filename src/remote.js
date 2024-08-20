
const url = "https://servicenuruk.realitynear.org:7726/";

const CLONE = "clone";
const PRESIGN = "presigned";
const NOMINATE = "nominate";
const NOMINATION = "nomination";
const NOMINATE_REVERSE = "nominatereverse";


class Human 
{
   sex = "m|f";
   age = 0;
   email = "";
   nation = "";
   voiceSample = undefined;
}

/*
* Fetch a JSON with the params to POST a file at the S3 bucket
* 
* @param {object} fileMetada - Name and type of the file
*/
async function getPresignedUrl(fileMedata)
{
   let endpoint = `${url}${PRESIGN}`;

   let request = 
      {
         method  : "POST",
         headers : {
            "Content-Type"  : "application/json",
            "authorization" : token, // <- Global token defined in the registrationForms
         },
         body    : JSON.stringify(fileMedata),
      };

   return fetch(endpoint, request).then((response) => response.json());
}

let types = ["a", "v", "t"]; // Initials of audio, video, text

/**
 * 
 * 
 */
function saveToDisk( event )
{
   let invisibleAnchor = document.getElementById("invisible-anchor__a");

   let blob = new Blob([event.data], { type : "video/webm" });

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
async function saveToRemoteDisk( name, mimetype, type, blob, extension = "webm" )
{

   let date = new Date();

   let metadata = {

      // Sanitize the name and does not go with extension
      name : name,
      mimetype  : mimetype,
      type      : type,
      extension : extension,

      // Take the date in ISO 8601 with the local time
      date : new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString(),

      encoding : "binary",

      // Weight in bytes
      weight : blob.size,
   };

   // Request the presigned url for the post
   let params = await getPresignedUrl(metadata);

   let body = new FormData();

   Object.keys(params.fields).forEach( key => { body.append(key, params.fields[key]) });

   body.append("file", blob);

   let request = 
      {
         method  : "POST",
         mode    : "no-cors",
         body    : body,
      };

   return await fetch(params.url, request);
}


/**
 * Requests the content of a file
 * @param {String} json - {name, type, hash}
 * @returns {Promise}
 */
async function fetchFile( json )
{
   let endpoint = `${url}${NOMINATE}`;

   let request = {
      method : "POST",

      headers : {
         "Content-Type" : "application/json",
         "authorization" : token, // Log in first
      },

      body : json,
   }

   return await fetch(endpoint, request);
}

/**
 * Requests the content of a file
 * @param {String} json - {name, type, hash}
 * @returns 
 */
async function deleteFile( json )
{
   let endpoint = `${url}${NOMINATE_REVERSE}`;

   let request = {
      method : "POST",

      headers : {
         "Content-Type" : "application/json",
         "authorization" : token, // Log in first
      },

      body : json,
   }

   return await fetch(endpoint, request);
}

async function nomination()
{
   let endpoint = `${url}${NOMINATION}`;

   let request =
   {
      method : "POST",
      headers :  {
         "authorization" : token,
      },
   };

   return await fetch(endpoint, request).then( async (response) => 
   {
      if(!response.ok)
      {
         return { ok : false, error : new WebTransportError()};
      }

      let data = await response.json();

      return { ok : true , error : undefined, data : data};
   });
}


/**
 * 
 * @param {Human} human 
 */
async function binaryTrial( human )
{
   let endpoint = `${url}binary-trial`;
   
   fetch(endpoint, { method : "POST", body : human });
}


async function addVoice( human )
{
   let endpoint = "https://api.elevenlabs.io/v1/voices/add";

   let request = {
      method : "POST",
      body : human,
      headers : {
         "xi-api-key" : "cc4bc4d19d421e2923099e9a0aa6fbbb",
      },
   };

   return await fetch(endpoint, request).then((response) => response.json());
}

function useVoice( voiceId, body, audioOutput )
{

   let enpoint = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

   let request = {
      method : "POST",
      body : JSON.stringify(body),
      headers : {
         "xi-api-key" : "cc4bc4d19d421e2923099e9a0aa6fbbb",
         "Content-Type" : "application/json",
      },
      query : {
         "output_format" : "mp3_44100_96",
      }
   };

   fetch(enpoint, request).then((response) =>
   {
      console.log(response);

      audioOutput.appendSrc(response.response.data);
   });
}