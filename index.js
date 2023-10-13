const https = require("https");
const aws = require("aws-sdk");

const ses = new aws.SES({
  region: "ap-south-1",
  credentials:{
    accessKeyId: "AKIAUQ3P2X2BSEH4CEUJ",
    secretAccessKey: "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"
  }
});

const FormType = {
  HIRING: "hiring",
  SALES: "sales",
};

// exports.handler = async (event) => {
const test_function = async (event) => {
  try {
    console.log(event.body);
    const requestBody = JSON.parse(event.body);

    // const result = await postRequest(requestBody);
    // console.log("result is: ", result);

    await sendEmail(requestBody);

    const responseBody = {
      success: true,
      message: "Details submitted successfully",
    };

    const response = {
      statusCode: 200,
      body: JSON.stringify(responseBody),
      isBase64Encoded: false,
      headers: { "Access-Control-Allow-Origin": "*" },
    };

    return response;
  } catch (error) {
    console.log("Error is: ", error);

    const responseBody = {
      success: false,
      message: "Could not add details",
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
    };

    const response = {
      body: JSON.stringify(responseBody),
      isBase64Encoded: false,
    };

    return response;
  }
};

function postRequest(requestBody) {
  const requestHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    Authorization: "Bearer keybQg3YaSl14Qsqo",
  };

  const requestOptions = {
    host: "api.airtable.com",
    path: "/v0/appbfEKBP2pkcXVbX/Contact%20Us%20Details",
    method: "POST",
    headers: requestHeaders,
  };

  const requestData = JSON.stringify({
    fields: {
      Name: requestBody.fullName,
      "Phone Number": requestBody.phoneNumber,
      "Email Id": requestBody.email,
      "Desired Services": requestBody.desiredServices?.toString() || "Not Selected",
      "Project Timeline": requestBody.projectTimeline || "Not Selected",
      Subject: requestBody.subject,
      Message: requestBody.message,
      "Communication Mode": requestBody.communicationMode?.toString() || "Not Selected",
      "Doc Link": requestBody.docLink || "",
      Source: requestBody.source || "bombaysoftwares.com",
    },
  });

  return new Promise((resolve, reject) => {
    const req = https.request(requestOptions, (res) => {
      let rawData = "";

      res.on("data", (chunk) => {
        rawData += chunk;
      });

      res.on("end", () => {
        try {
          resolve(JSON.parse(rawData));
        } catch (err) {
          reject(new Error(err));
        }
      });
    });

    req.on("error", (err) => {
      reject(new Error(err));
    });

    req.write(JSON.stringify(requestData));
    req.end();
  });
}

function sendEmail(requestBody) {
  return new Promise((resolve, reject) => {
    let RECEIVERS = [];

    let DEFAULT_RECEIVERS = [
      "arpit@bombaysoftwares.com",
      "pallav@bombaysoftwares.com",
      "sourabh@bombaysoftwares.com",
    ];

    const formTypeFromrequest = requestBody.formType;

    if (formTypeFromrequest === FormType.HIRING) {
      RECEIVERS = ["hr@bombaysoftwares.com"];
    } else if (formTypeFromrequest === FormType.SALES) {
      RECEIVERS = ["sales@bombaysoftwares.com"];
    }

    DEFAULT_RECEIVERS.forEach((receiver) => RECEIVERS.push(receiver));

    const SENDER = "connect@bombaysoftwares.com";
    const source = requestBody.source || "bombaysoftwares.com";
    const isFromCampusby = requestBody.source === "campusby.com";
    const subject = isFromCampusby
      ? "New Contact Form inquiry for Campusby: " + requestBody.subject
      : "New Contact Form inquiry for Bombay Softwares: " + requestBody.subject;
    let bodyString =
      "Form Type: " +
      (requestBody.formType || "") +
      "\nName: " +
      requestBody.fullName +
      "\nEmail: " +
      requestBody.email +
      "\nPhone Number: " +
      requestBody.phoneNumber +
      "\nDesired Services: " +
      (requestBody.desiredServices?.toString() || "Not Selected") +
      "\nProject Timeline: " +
      (requestBody.projectTimeline || "Not Selected") +
      "\nMessage: " +
      requestBody.message +
      "\nCommunication Mode: " +
      (requestBody.communicationMode?.toString() || "Not Selected") +
      "\nChannel: " +
      (requestBody.channel || source) +
      "\nDoc Link: " +
      (requestBody.docLink || "Not Attached");
    if (isFromCampusby) {
      bodyString += "\nCollege: " + requestBody.subject;
    }
    bodyString += "\nSource: " + source;
    const params = {
      Destination: {
        ToAddresses: ["dhyeybhattasana1999@gmail.com"],
      },
      Message: {
        Body: {
          Text: {
            Data: bodyString,
            Charset: "UTF-8",
          },
        },
        Subject: {
          Data: subject,
          Charset: "UTF-8",
        },
      },
      Source: "dhyeybhattasana1999@gmail.com",
    };
    ses.sendEmail(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

test_function({body:JSON.stringify({
  fullName: "Dhyey",
  phoneNumber: "7226899076",
  email: "dhyeybhattasana1999@gmail.com",
  // desiredServices: ["website maintenance", "Others"],
  projectTimeline: "1-3 months",
  communicationMode: ["email"],
  subject: "test1",
  message: "test1",
  docLink: "",
  source: "",
})})
