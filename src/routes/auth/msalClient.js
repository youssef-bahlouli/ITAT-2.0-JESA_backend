import { ConfidentialClientApplication } from "@azure/msal-node";

const msalConfig = {
  auth: {
    clientId: process.env.CLIENT_ID, // ✅ Must be defined
    authority: "https://login.microsoftonline.com/common", // or your default tenant
    clientSecret: process.env.CLIENT_SECRET,
  },
};

export const msalClient = new ConfidentialClientApplication(msalConfig);
