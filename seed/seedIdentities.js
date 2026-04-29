require("dotenv").config();
const nibss = require("../src/services/nibss.service");

const testBvns = [
  {
    bvn: "90213478564",
    firstName: "Matthew",
    lastName: "Fadeyi",
    email: "matthew.fadeyi@meilleurbank.com",
    kycType: "bvn",
    dob: "1988-03-17",
    phone: "07062123343",
  },
  {
    bvn: "62918230948",
    firstName: "Omalicha",
    lastName: "Obolanosor",
    email: "omalicha@meilleurbank.com",
    kycType: "bvn",
    dob: "1993-11-29",
    phone: "09192345678",
  },
];

const testNins = [
  {
    nin: "58203746819",
    firstName: "Adaeze",
    lastName: "Nwanneka",
    email: "adaeze@meilleurbank.com",
    kycType: "nin",
    dob: "1996-07-04",
    phone: "08058203746",
  },
  {
    nin: "67433445572",
    firstName: "Kamchi",
    lastName: "Bello",
    email: "kamchi@meilleurbank.com",
    kycType: "nin",
    dob: "1978-10-05",
    phone: "07098765433",
  },
];

(async () => {
  console.log("Seeding BVN records...");
  for (const identity of testBvns) {
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
