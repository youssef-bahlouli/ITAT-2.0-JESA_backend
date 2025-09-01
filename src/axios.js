import axios from "axios";

axios
  .get("http://localhost:3000/api/pages/session", {
    withCredentials: true, // This ensures cookies are sent
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error);
  });
