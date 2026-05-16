/**
 * Seed sample inquiries for the current school's school admin JWT.
 * Usage: NODE_PATH=backend node backend/scripts/seedInquiries.js <JWT_FROM_LOGIN>
 *
 * Optional: BASE_URL=http://localhost:5000 npm run ...
 */
const token = process.argv[2];
const base = process.env.API_BASE || "http://localhost:5000";

if (!token) {
  console.error("Usage: node backend/scripts/seedInquiries.js <school_admin_jwt>");
  process.exit(1);
}

const samples = [
  {
    studentFullName: "Sample Student A",
    fatherName: "Parent A",
    motherName: "Parent B",
    mobileNumber: "9999999901",
    email: "",
    gender: "MALE",
    interestedClass: "Demo Class",
    source: "WALK_IN",
    status: "PENDING",
    counselorNotes: "Seed inquiry",
  },
  {
    studentFullName: "Sample Student B",
    fatherName: "Parent C",
    mobileNumber: "9999999902",
    gender: "FEMALE",
    interestedClass: "Demo Class",
    source: "WEBSITE",
    status: "FOLLOW_UP",
    followUpDate: new Date().toISOString(),
    counselorNotes: "Needs follow-up",
  },
];

async function main() {
  for (const body of samples) {
    const res = await fetch(`${base}/api/school-admin/inquiries`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) console.error(j);
    else console.log("created", j.data?.inquiryId);
  }
}

main();
