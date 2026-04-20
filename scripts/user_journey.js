import { sleep, group, check } from "k6";
import { login } from "../modules/auth.js";
import http, { request } from "k6/http";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";
import { SharedArray } from "k6/data";
import papaparse from "https://jslib.k6.io/papaparse/5.1.1/index.js";

const csvData = new SharedArray("users", function () {
  const data = papaparse.parse(open("../data/users.csv"), {
    header: true,
    skipEmptyLines: true,
  }).data;
  return data;
});

export const options = {
  stages: [
    { duration: "1m", target: 10 },
    { duration: "5m", target: 10 },
    { duration: "1m", target: 0 },
  ],
  thresholds: {
    "http_req_duration{name:login}": ["p(95)<2000"],
    "http_req_duration{name:menu}": ["p(95)<3000"],
    "http_req_failed{name:login}": ["rate<0.01"],
    "http_req_failed{name:menu}": ["rate<0.01"],
  },
};

export default function () {
  const user = csvData[(__VU - 1) % csvData.length];

  const baseURl = "https://food-preprod.yassir.io";

  let authData;
  // STEP 1: LOGIN using email and password
  group("01-Login using Email", function () {
    authData = login(baseURl, user.email, user.password);

    if (!authData) {
      return;
    }
    sleep(1);
  });

  // STEP 2: Get Store Menu

  group("02-Get Store Menu", function () {
    const getMenuURL = `${baseURl}/mobile/store/v2/menu/${authData.store_id}`;

    const params = {
      headers: {
        authorization: authData.token,
      },
    };
    const response = http.get(getMenuURL, {
      ...params,
      tags: { name: "menu" },
    });

    check(response, {
      "Getting Menu status is 200": (r) => r.status === 200,
      "Menu has content": (r) => r.body.length > 0,
    });
    sleep(2);
  });
}

export function handleSummary(data) {
  return {
    "summaryReport.html": htmlReport(data),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}
