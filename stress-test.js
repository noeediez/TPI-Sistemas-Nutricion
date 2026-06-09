import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 100,
  duration: "30s",
};

export default function () {
  const res = http.get("https://dip-crunch.vercel.app/");

  check(res, {
    "status es 200": (r) => r.status === 200,
  });

  sleep(1);
}