import http from "k6/http";
import { check } from "k6";

export function login(baseURL, email, password) {
  const url = `${baseURL}/mobile/store/v4/login`;
  const payload = JSON.stringify({
    email: email,
    password: password,
  });

  const params = {
    headers: {
      "content-type": "application/json",
      "Accept-Charset": "utf-8",
      Accept: "application/json",
    },
  };

  const response = http.post(url, payload, {...params,tags:{name:"login"}});
  const isSuccessful= check(response, { "Login is done successfully": (r) => r.status === 200 },
);

if(!isSuccessful){
    console.error(`Login failed for ${email} Status: ${response.status}, Body: ${response.body}`);
    return null;
}

  return {
    token: response.json().token,
    store_id: response.json().store_id,
  };
}
