/* text implementation of GCNotify using Axios */

import axios from 'axios';

interface smsResponse {
  "id": string,
  "reference": string,
  "content": {
    "body": string,
    "from_number": string
  },
  "uri": string,
  "template": {
    "id": string,
    "version": number,
    "uri": string
  }
}

const sendSmsMortality = async function(phoneNumber) {

  console.log("sendMortalitySMS: START");

  // if no phone number is supplied (i.e.missing from profile)
  if (!phoneNumber) {
    phoneNumber = process.env.BCTW_GCNOTIFY_TEST_PHONE_NUMBER;
    console.log("sendMortalitySMS: no phone number supplied; using BCTW_GCNOTIFY_TEST_PHONE_NUMBER");
  }

  console.log("sendMortalitySMS: phone number = " + phoneNumber);

  const gcNotifyApiSecretKey = process.env.BCTW_GCNOTIFY_API_SECRET_KEY;
  const gcNotifySmsEndpoint = `${process.env.BCTW_GCNOTIFY_API_HOSTNAME}${process.env.BCTW_GCNOTIFY_API_ENDPOINT_SMS}`;
  const gcNotifySmsTemplateMortality = process.env.BCTW_GCNOTIFY_TEMPLATE_SMS_MORTALITY;
  const gcNotifySmsTemplateMortalityCancelled = process.env.BCTW_GCNOTIFY_TEMPLATE_SMS_MORTALITY_CANCELLED;

  console.log("sendMortalitySMS: gcNotifySmsEndpoint = " + gcNotifySmsEndpoint);
  console.log("sendMortalitySMS: gcNotifySmsTemplateMortality = " + gcNotifySmsTemplateMortality);
  console.log("sendMortalitySMS: gcNotifySmsTemplateMortalityCancelled = " + gcNotifySmsTemplateMortalityCancelled);

  function getCurrentDateTime() {
    const d = new Date();
    return (d.toLocaleString());
  }

  function getRandomDeviceId() {
    return (Math.floor((Math.random() * 9999) + 60000));
  }

  const smsPayloadPersonalisation = {
    wlh_id: "21-12345",
    animal_id: "Betty",
    device_id: getRandomDeviceId(),
    frequency: "125.67",
    species: "Caribou",
    date_time: getCurrentDateTime(),
    latitude: "48.41970",
    longitude: "-123.37022"
  }

  const smsPayload = {
    phone_number: phoneNumber,
    template_id: gcNotifySmsTemplateMortality,
    personalisation: smsPayloadPersonalisation
  }

  console.log("sendMortalitySMS: smsPayload = %j", smsPayload);
  console.log("sendMortalitySMS: making call to API");

  const response = await axios.post(
    gcNotifySmsEndpoint,
    smsPayload,
    {
      headers: {
        'Authorization': 'ApiKey-v1 ' + gcNotifyApiSecretKey,
        'Content-Type': 'application/json'
      }
    }
  )
  const post: smsResponse = response.data;
  console.log("sendMortalitySMS: response = %j", post);
  
}

export {
  sendSmsMortality
}