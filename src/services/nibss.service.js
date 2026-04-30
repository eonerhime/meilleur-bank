require("dotenv").config();
const axios = require("axios");

const BASE_URL = process.env.NIBSS_BASE_URL;
let nibssToken = null;
let tokenExpiry = null;

// Fetch and cache NIBSS JWT token (refreshes automatically)
const getNibssToken = async () => {
  const now = Date.now();
  if (nibssToken && tokenExpiry && now < tokenExpiry) return nibssToken;

  const res = await axios.post(`${BASE_URL}/api/auth/token`, {
    apiKey: process.env.NIBSS_API_KEY,
    apiSecret: process.env.NIBSS_API_SECRET,
  });

  nibssToken = res.data.token;
  tokenExpiry = now + 55 * 60 * 1000; // refresh 5 min before 1hr expiry
  return nibssToken;
};

// Helper: authenticated NIBSS request
const nibssRequest = async (method, path, data = null) => {
  console.log("-->NIBSS transfer request:", method, path, data);

  try {
    const token = await getNibssToken();
    const config = {
      method,
      url: `${BASE_URL}${path}`,
      headers: { Authorization: `Bearer ${token}` },
      ...(data && { data }),
    };
    console.log(
      "NIBSS request body being sent:",
      JSON.stringify(data, null, 2),
    );

    const res = await axios(config);
    return res.data;
  } catch (error) {
    console.error(
      "NIBSS Error Response:",
      JSON.stringify(error.response?.data, null, 2),
    );
    console.error("NIBSS Error Status:", error.response?.status);
    console.error(
      "NIBSS Error Headers:",
      JSON.stringify(error.response?.headers, null, 2),
    );
    throw error;
  }
};

// ── Identity ──────────────────────────────────────────
const insertBvn = (payload) => nibssRequest("post", "/api/insertBvn", payload);
const insertNin = (payload) => nibssRequest("post", "/api/insertNin", payload);
const validateBvn = (bvn) => nibssRequest("post", "/api/validateBvn", { bvn });
const validateNin = (nin) => nibssRequest("post", "/api/validateNin", { nin });

// ── Accounts ──────────────────────────────────────────
const createAccount = (payload) =>
  nibssRequest("post", "/api/account/create", payload);
const nameEnquiry = (accountNo) =>
  nibssRequest("get", `/api/account/name-enquiry/${accountNo}`);
const getBalance = (accountNo) =>
  nibssRequest("get", `/api/account/balance/${accountNo}`);

// ── Transfers ──────────────────────────────────────────
<<<<<<< Updated upstream
const transfer = (payload) => nibssRequest("post", "/api/transfer", payload);
const getTransaction = (txId) =>
  nibssRequest("get", `/api/transaction/${txId}`);
=======
const transfer = ({ from, to, amount }) =>
  nibssRequest("post", "/api/transfer", {
    from,
    to,
    amount,
  });
console.log("=> NIBSS transfer function:", transfer);

const getTransaction = (ref) => nibssRequest("get", `/api/transaction/${ref}`);
>>>>>>> Stashed changes

module.exports = {
  insertBvn,
  insertNin,
  validateBvn,
  validateNin,
  createAccount,
  nameEnquiry,
  getBalance,
  transfer,
  getTransaction,
};
