import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:9080",
  withCredentials: true,
});

export default API;
