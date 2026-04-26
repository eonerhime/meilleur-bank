require("dotenv").config();
const nibss = require("../src/services/nibss.service");

const testIdentities = [
  {
    bvn: "12345678901",
    firstName: "Amara",
    lastName: "Efejiro",
    dob: "1995-06-15",
    phone: "08012345678",
  },
  {
    bvn: "98765432101",
    firstName: "Tolu",
    lastName: "Nwachukwu",
    dob: "1990-03-22",
    phone: "07098765432",
  },
];

const testNins = [
  {
    nin: "12433445572",
    firstName: "Kamchi",
    lastName: "Bello",
    dob: "1978-10-05",
    phone: "07098765433",
  },
  {
    nin: "11223344556",
    firstName: "Fatima",
    lastName: "Ilia",
    dob: "1998-11-05",
    phone: "07098765433",
  },
];

(async () => {
  console.log("Seeding BVN records...");
  for (const identity of testIdentities) {
    try {
      const res = await nibss.insertBvn(identity);
      console.log("BVN seeded:", res);
    } catch (err) {
      console.error("BVN seed error:", err.response?.data || err.message);
    }
  }

  console.log("Seeding NIN records...");
  for (const nin of testNins) {
    try {
      const res = await nibss.insertNin(nin);
      console.log("NIN seeded:", res);
    } catch (err) {
      console.error("NIN seed error:", err.response?.data || err.message);
    }
  }

  console.log("Seeding complete.");
  process.exit(0);
})();
