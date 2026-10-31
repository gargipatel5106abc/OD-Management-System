const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Cleaning existing database...");
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.verificationResult.deleteMany();
  await prisma.evidence.deleteMany();
  await prisma.oDRecord.deleteMany();
  await prisma.oDRequest.deleteMany();
  await prisma.eventParticipant.deleteMany();
  await prisma.event.deleteMany();
  await prisma.studentCoordinator.deleteMany();
  await prisma.club.deleteMany();
  await prisma.facultyCoordinator.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany();

  console.log("👤 Creating Users and Profiles...");

  // 1. SWC Admin
  const swcUser = await prisma.user.create({
    data: {
      email: "swc.director@vit.ac.in",
      name: "Dr. S. Balasubramanian",
      role: "SWC",
    },
  });

  // 2. Faculty Coordinators
  const fac1User = await prisma.user.create({
    data: {
      email: "k.ramanathan@vit.ac.in",
      name: "Dr. K. Ramanathan",
      role: "FACULTY",
    },
  });
  const fac1 = await prisma.facultyCoordinator.create({
    data: {
      userId: fac1User.id,
      employeeId: "EMP-FAC-8819",
      name: "Dr. K. Ramanathan",
      department: "School of Computer Science and Engineering (SCOPE)",
      email: "k.ramanathan@vit.ac.in",
      phone: "+91 94441 22334",
    },
  });

  const fac2User = await prisma.user.create({
    data: {
      email: "sunita.rao@vit.ac.in",
      name: "Dr. Sunita Rao",
      role: "FACULTY",
    },
  });
  const fac2 = await prisma.facultyCoordinator.create({
    data: {
      userId: fac2User.id,
      employeeId: "EMP-FAC-7421",
      name: "Dr. Sunita Rao",
      department: "School of Electronics Engineering (SENSE)",
      email: "sunita.rao@vit.ac.in",
      phone: "+91 98840 55667",
    },
  });

  const fac3User = await prisma.user.create({
    data: {
      email: "m.anand@vit.ac.in",
      name: "Dr. M. Anand",
      role: "FACULTY",
    },
  });
  const fac3 = await prisma.facultyCoordinator.create({
    data: {
      userId: fac3User.id,
      employeeId: "EMP-FAC-6102",
      name: "Dr. M. Anand",
      department: "Office of Student Welfare & Physical Education",
      email: "m.anand@vit.ac.in",
      phone: "+91 97910 88990",
    },
  });

  // 3. Clubs
  const clubCoding = await prisma.club.create({
    data: {
      name: "CodeChef VIT Chennai",
      code: "CODECHEF",
      category: "TECHNICAL",
      description: "Premier competitive programming and software engineering community at VIT Chennai.",
      facultyCoordinatorId: fac1.id,
    },
  });

  const clubRobotics = await prisma.club.create({
    data: {
      name: "Robotics Club VIT Chennai",
      code: "ROBOTICS",
      category: "TECHNICAL",
      description: "Building autonomous systems, robotic combat platforms, and embedded automation.",
      facultyCoordinatorId: fac2.id,
    },
  });

  const clubIEEE = await prisma.club.create({
    data: {
      name: "IEEE Student Branch VIT",
      code: "IEEE",
      category: "TECHNICAL",
      description: "Advancing technology for humanity through international hackathons, workshops, and symposiums.",
      facultyCoordinatorId: fac2.id,
    },
  });

  const clubCultural = await prisma.club.create({
    data: {
      name: "Dhwani Cultural Club",
      code: "CULTURAL",
      category: "CULTURAL",
      description: "Campus cultural hub coordinating music, performing arts, and interstate festivals.",
      facultyCoordinatorId: fac3.id,
    },
  });

  const clubSports = await prisma.club.create({
    data: {
      name: "VIT Stallions Sports Club",
      code: "SPORTS",
      category: "SPORTS",
      description: "University athletic council organizing inter-collegiate tournaments and sports meets.",
      facultyCoordinatorId: fac3.id,
    },
  });

  // Club Coordinator User (Student Coordinator for CodeChef)
  const clubCoordUser = await prisma.user.create({
    data: {
      email: "club.codechef@vit.ac.in",
      name: "Tanmay Deshmukh (CodeChef Lead)",
      role: "CLUB",
    },
  });
  await prisma.studentCoordinator.create({
    data: {
      userId: clubCoordUser.id,
      regNo: "22BCE1544",
      name: "Tanmay Deshmukh",
      clubId: clubCoding.id,
    },
  });

  // 4. Students (10 Realistic Students)
  const studentDataList = [
    {
      name: "Rahul Sharma",
      regNo: "23BCE1001",
      email: "rahul.sharma2023@vitstudent.ac.in",
      program: "B.Tech Computer Science and Engineering",
      school: "SCOPE",
      year: 3,
      section: "A",
      odHoursUsed: 18,
    },
    {
      name: "Aisha Khan",
      regNo: "23BCE1002",
      email: "aisha.khan2023@vitstudent.ac.in",
      program: "B.Tech Computer Science and Engineering",
      school: "SCOPE",
      year: 3,
      section: "B",
      odHoursUsed: 12,
    },
    {
      name: "Arjun Patel",
      regNo: "23BCE1010",
      email: "arjun.patel2023@vitstudent.ac.in",
      program: "B.Tech Electronics and Communication",
      school: "SENSE",
      year: 2,
      section: "C",
      odHoursUsed: 8,
    },
    {
      name: "Priya Sundaram",
      regNo: "23BCE1025",
      email: "priya.sundaram2023@vitstudent.ac.in",
      program: "B.Tech Computer Science and Engineering",
      school: "SCOPE",
      year: 3,
      section: "A",
      odHoursUsed: 36, // Near limit (36 / 40)
    },
    {
      name: "Vikram Nair",
      regNo: "23BCE1042",
      email: "vikram.nair2023@vitstudent.ac.in",
      program: "B.Tech Electrical & Electronics",
      school: "SELECT",
      year: 4,
      section: "B",
      odHoursUsed: 24,
    },
    {
      name: "Sneha Reddy",
      regNo: "23BCE1088",
      email: "sneha.reddy2023@vitstudent.ac.in",
      program: "B.Tech Mechanical Engineering",
      school: "SMEC",
      year: 2,
      section: "D",
      odHoursUsed: 16,
    },
    {
      name: "Karthik V",
      regNo: "23BCE1104",
      email: "karthik.v2023@vitstudent.ac.in",
      program: "B.Tech Computer Science and Engineering",
      school: "SCOPE",
      year: 1,
      section: "F",
      odHoursUsed: 6,
    },
    {
      name: "Divya Menon",
      regNo: "23BCE1150",
      email: "divya.menon2023@vitstudent.ac.in",
      program: "B.Tech Chemical Engineering",
      school: "SCHEME",
      year: 3,
      section: "A",
      odHoursUsed: 30,
    },
    {
      name: "Rohan Gupta",
      regNo: "23BCE1192",
      email: "rohan.gupta2023@vitstudent.ac.in",
      program: "B.Sc Data Science",
      school: "SAS",
      year: 2,
      section: "B",
      odHoursUsed: 10,
    },
    {
      name: "Ananya Iyer",
      regNo: "23BCE1234",
      email: "ananya.iyer2023@vitstudent.ac.in",
      program: "B.Tech Computer Science and Engineering",
      school: "SCOPE",
      year: 3,
      section: "C",
      odHoursUsed: 20,
    },
  ];

  const createdStudents = [];
  for (const s of studentDataList) {
    const user = await prisma.user.create({
      data: {
        email: s.email,
        name: s.name,
        role: "STUDENT",
      },
    });
    const student = await prisma.student.create({
      data: {
        userId: user.id,
        regNo: s.regNo,
        name: s.name,
        email: s.email,
        program: s.program,
        school: s.school,
        year: s.year,
        section: s.section,
        odHoursUsed: s.odHoursUsed,
        maxHours: 40,
        phone: "+91 98765 43210",
      },
    });
    createdStudents.push(student);
  }

  console.log("📅 Creating Events...");

  // Events
  const event1 = await prisma.event.create({
    data: {
      title: "VIT TechFest 2026 - National Hackathon",
      eventCode: "EVT-2026-TF01",
      clubId: clubCoding.id,
      description: "Flagship 24-hour national hackathon focused on AI, Web3, and Cloud computing applications.",
      category: "HACKATHON",
      eventDate: "2026-10-08",
      startTime: "09:00",
      endTime: "17:00",
      expectedHours: 8,
      venue: "MG Auditorium, VIT Chennai",
      latitude: 12.8406,
      longitude: 80.1534,
      venueRadiusMeters: 600,
      expectedParticipants: 120,
      reasonOD: "Students representing VIT Chennai in high-intensity full-day hackathon sprint tracks.",
      status: "SWC_APPROVED",
      swcRemarks: "Approved by SWC Director for 8 hours On-Duty per student.",
      approvedAt: new Date("2026-10-01T10:00:00Z"),
    },
  });

  const event2 = await prisma.event.create({
    data: {
      title: "Robo Wars 2026 - Combat Robotics League",
      eventCode: "EVT-2026-RW02",
      clubId: clubRobotics.id,
      description: "Inter-collegiate arena battle championship for 15kg and 30kg combat bots.",
      category: "TECHNICAL",
      eventDate: "2026-10-14",
      startTime: "10:00",
      endTime: "16:00",
      expectedHours: 6,
      venue: "Indoor Sports Complex Arena, VIT Chennai",
      latitude: 12.8415,
      longitude: 80.1542,
      venueRadiusMeters: 500,
      expectedParticipants: 80,
      reasonOD: "Arena robot inspection, pilot controls, and tournament elimination rounds.",
      status: "SWC_APPROVED",
      swcRemarks: "Approved for 6 hours OD for registered pilot and pit-crew participants.",
      approvedAt: new Date("2026-10-02T11:30:00Z"),
    },
  });

  const event3 = await prisma.event.create({
    data: {
      title: "Inter-Collegiate Badminton Championship",
      eventCode: "EVT-2026-SP03",
      clubId: clubSports.id,
      description: "South Zone Inter-University badminton tournament qualifiers and finals.",
      category: "SPORTS",
      eventDate: "2026-10-09", // TODAY
      startTime: "09:00",
      endTime: "16:00",
      expectedHours: 7,
      venue: "VIT Sports Arena - Court 2 & 3",
      latitude: 12.8398,
      longitude: 80.1528,
      venueRadiusMeters: 400,
      expectedParticipants: 45,
      reasonOD: "Official university representation in state-level athletic championship.",
      status: "SWC_APPROVED",
      swcRemarks: "Sanctioned 7 hours OD for official university badminton contingent.",
      approvedAt: new Date("2026-10-05T09:00:00Z"),
    },
  });

  const event4 = await prisma.event.create({
    data: {
      title: "National AI & Cloud Symposium",
      eventCode: "EVT-2026-AI04",
      clubId: clubIEEE.id,
      description: "Research paper presentations and keynote by industry leaders in generative models.",
      category: "CONFERENCE",
      eventDate: "2026-10-22",
      startTime: "09:00",
      endTime: "17:00",
      expectedHours: 8,
      venue: "Netaji Auditorium, Academic Block 1",
      latitude: 12.8406,
      longitude: 80.1534,
      venueRadiusMeters: 600,
      expectedParticipants: 150,
      reasonOD: "Technical session attendance and student research paper presentations.",
      status: "PENDING_SWC",
      reasonOD: "Student researchers presenting peer-reviewed papers during instructional hours.",
    },
  });

  const event5 = await prisma.event.create({
    data: {
      title: "Dhwani Cultural Fest - Battle of Bands",
      eventCode: "EVT-2026-CU05",
      clubId: clubCultural.id,
      description: "Annual cultural extravaganza featuring 14 university music bands.",
      category: "CULTURAL",
      eventDate: "2026-10-18",
      startTime: "11:00",
      endTime: "17:00",
      expectedHours: 6,
      venue: "Open Air Amphitheatre, VIT Chennai",
      latitude: 12.842,
      longitude: 80.155,
      venueRadiusMeters: 500,
      expectedParticipants: 100,
      reasonOD: "Acoustic stage setups, stage sound engineering, and competitive band performances.",
      status: "SWC_APPROVED",
      swcRemarks: "Approved for accredited band members and backstage stage managers.",
      approvedAt: new Date("2026-10-04T14:00:00Z"),
    },
  });

  const event6 = await prisma.event.create({
    data: {
      title: "Web3 & Zero-Knowledge Cryptography Workshop",
      eventCode: "EVT-2026-W306",
      clubId: clubCoding.id,
      description: "Hands-on masterclass on zk-SNARKs and smart contract security auditing.",
      category: "WORKSHOP",
      eventDate: "2026-09-28",
      startTime: "10:00",
      endTime: "16:00",
      expectedHours: 6,
      venue: "Tech Tower Lab 304, VIT Chennai",
      latitude: 12.8406,
      longitude: 80.1534,
      venueRadiusMeters: 500,
      expectedParticipants: 60,
      reasonOD: "Advanced hands-on security workshop accredited for technical OD credits.",
      status: "COMPLETED",
      swcRemarks: "Completed and OD credits credited.",
      approvedAt: new Date("2026-09-20T10:00:00Z"),
    },
  });

  const event7 = await prisma.event.create({
    data: {
      title: "IoT Autonomous Drone Sprint 2026",
      eventCode: "EVT-2026-DR07",
      clubId: clubRobotics.id,
      description: "Outdoor GPS waypoint autonomous drone obstacle challenge.",
      category: "TECHNICAL",
      eventDate: "2026-10-25",
      startTime: "09:00",
      endTime: "17:00",
      expectedHours: 8,
      venue: "VIT Chennai Football Ground",
      latitude: 12.839,
      longitude: 80.151,
      venueRadiusMeters: 700,
      expectedParticipants: 50,
      reasonOD: "Field telemetry testing and obstacle navigation flight trials.",
      status: "SWC_APPROVED",
      swcRemarks: "Approved with field safety precautions.",
      approvedAt: new Date("2026-10-06T15:00:00Z"),
    },
  });

  const event8 = await prisma.event.create({
    data: {
      title: "Autonomous RC Speed Drifting Challenge",
      eventCode: "EVT-2026-RC08",
      clubId: clubRobotics.id,
      description: "High speed RC drifting competition on concrete testbed.",
      category: "OTHER",
      eventDate: "2026-10-29",
      startTime: "13:00",
      endTime: "17:00",
      expectedHours: 4,
      venue: "Parking Lot B",
      expectedParticipants: 40,
      reasonOD: "Hobbyist showcase and trial runs.",
      status: "SWC_REJECTED",
      swcRemarks: "Rejected: Venue conflicts with scheduled continuous assessment tests (CAT-II).",
    },
  });

  const event9 = await prisma.event.create({
    data: {
      title: "International IEEE AI Ethics Summit",
      eventCode: "EVT-2026-ET09",
      clubId: clubIEEE.id,
      description: "Global hybrid conference on regulatory governance and ethical AI.",
      category: "CONFERENCE",
      eventDate: "2026-11-05",
      startTime: "09:00",
      endTime: "17:00",
      expectedHours: 8,
      venue: "MG Auditorium",
      expectedParticipants: 200,
      reasonOD: "International delegate conference and student moderation.",
      status: "PENDING_SWC",
    },
  });

  const event10 = await prisma.event.create({
    data: {
      title: "State Level Inter-College Cricket Trophy",
      eventCode: "EVT-2026-CR10",
      clubId: clubSports.id,
      description: "Knockout cricket tournament between 16 engineering universities.",
      category: "SPORTS",
      eventDate: "2026-10-11",
      startTime: "08:00",
      endTime: "16:00",
      expectedHours: 8,
      venue: "Main Cricket Stadium, VIT Chennai",
      expectedParticipants: 30,
      reasonOD: "Official university 1st XI squad matches.",
      status: "SWC_APPROVED",
      swcRemarks: "Approved for university cricket team members.",
      approvedAt: new Date("2026-10-05T10:00:00Z"),
    },
  });

  console.log("📋 Adding Official Participant Lists...");

  // TechFest 2026 Participant List (Includes Rahul 23BCE1001, Aisha 23BCE1002, Vikram 23BCE1042, Ananya 23BCE1234)
  const techfestRoster = [
    { regNo: "23BCE1001", name: "Rahul Sharma", program: "B.Tech CSE", year: 3, section: "A", type: "PARTICIPANT" },
    { regNo: "23BCE1002", name: "Aisha Khan", program: "B.Tech CSE", year: 3, section: "B", type: "PARTICIPANT" },
    { regNo: "23BCE1042", name: "Vikram Nair", program: "B.Tech EEE", year: 4, section: "B", type: "PARTICIPANT" },
    { regNo: "23BCE1234", name: "Ananya Iyer", program: "B.Tech CSE", year: 3, section: "C", type: "PARTICIPANT" },
    { regNo: "23BCE1088", name: "Sneha Reddy", program: "B.Tech MECH", year: 2, section: "D", type: "PARTICIPANT" },
  ];
  for (const p of techfestRoster) {
    await prisma.eventParticipant.create({
      data: {
        eventId: event1.id,
        regNo: p.regNo,
        studentName: p.name,
        program: p.program,
        year: p.year,
        section: p.section,
        participationType: p.type,
        attendanceStatus: "PRESENT",
        addedBy: "CLUB",
      },
    });
  }

  // Robo Wars 2026 Participant List (CRUCIAL: Arjun Patel 23BCE1010 was OMITTED by club to trigger Demo Mismatch Scenario!)
  const robowarsRoster = [
    { regNo: "23BCE1001", name: "Rahul Sharma", program: "B.Tech CSE", year: 3, section: "A" },
    { regNo: "23BCE1002", name: "Aisha Khan", program: "B.Tech CSE", year: 3, section: "B" },
    { regNo: "23BCE1042", name: "Vikram Nair", program: "B.Tech EEE", year: 4, section: "B" },
  ];
  for (const p of robowarsRoster) {
    await prisma.eventParticipant.create({
      data: {
        eventId: event2.id,
        regNo: p.regNo,
        studentName: p.name,
        program: p.program,
        year: p.year,
        section: p.section,
        participationType: "PARTICIPANT",
        attendanceStatus: "PRESENT",
        addedBy: "CLUB",
      },
    });
  }

  // Completed Web3 Workshop Roster
  const web3Roster = [
    { regNo: "23BCE1002", name: "Aisha Khan", program: "B.Tech CSE", year: 3, section: "B" },
    { regNo: "23BCE1150", name: "Divya Menon", program: "B.Tech CHEM", year: 3, section: "A" },
  ];
  for (const p of web3Roster) {
    await prisma.eventParticipant.create({
      data: {
        eventId: event6.id,
        regNo: p.regNo,
        studentName: p.name,
        program: p.program,
        year: p.year,
        section: p.section,
        participationType: "PARTICIPANT",
        attendanceStatus: "PRESENT",
        addedBy: "CLUB",
      },
    });
  }

  console.log("📝 Generating OD Requests, Verification Results, and Scenarios...");

  // ==========================================
  // SCENARIO 1: PERFECT MATCH & AUTO-VERIFICATION
  // Student 23BCE1001 (Rahul) applied for VIT TechFest 2026
  // Matched with Club Roster + Geotagged photo verified -> Status AUTO_VERIFIED
  // ==========================================
  const rahulStudent = createdStudents.find((s) => s.regNo === "23BCE1001");
  const odReq1 = await prisma.oDRequest.create({
    data: {
      requestNumber: "OD-2026-TF1001",
      studentId: rahulStudent.id,
      eventId: event1.id,
      reason: "Presented and competed in 24-hr Hackathon building an autonomous decentralized smart grid solution.",
      status: "AUTO_VERIFIED",
      requestedHours: 8,
      createdAt: new Date("2026-10-08T18:30:00Z"),
    },
  });

  // Evidence with Geotagged Photo at VIT Chennai
  await prisma.evidence.create({
    data: {
      odRequestId: odReq1.id,
      type: "GEOTAGGED_PHOTO",
      title: "Event Pitch Presentation Photo (Geo-tagged)",
      fileName: "techfest_pitch_stage_geotagged.jpg",
      fileUrl: "/evidence/techfest_pitch.jpg",
      fileSize: "3.4 MB",
      mimeType: "image/jpeg",
      gpsLatitude: 12.8406,
      gpsLongitude: 80.1534,
      photoTimestamp: new Date("2026-10-08T11:20:00Z"),
      photoLocationName: "VIT Chennai MG Auditorium, Kelambakkam Vandalur Road",
      isGeoVerified: true,
      geoVerificationNotes: "GPS location within 25 meters of official venue coordinates (12.8406, 80.1534). Timestamp inside 09:00-17:00 window.",
    },
  });

  await prisma.evidence.create({
    data: {
      odRequestId: odReq1.id,
      type: "CERTIFICATE",
      title: "Hackathon Finalist Certificate",
      fileName: "techfest_finalist_cert_23BCE1001.pdf",
      fileUrl: "/evidence/techfest_cert.pdf",
      fileSize: "1.2 MB",
      mimeType: "application/pdf",
    },
  });

  // Verification result: 8 Checks all PASS
  await prisma.verificationResult.create({
    data: {
      odRequestId: odReq1.id,
      checkEventExists: true,
      checkSwcApproved: true,
      checkDateMatch: true,
      checkTimeMatch: true,
      checkParticipantMatch: true,
      checkEvidenceMatch: true,
      checkLocationMatch: true,
      checkOdLimit: true,
      overallStatus: "VERIFIED",
      mismatchDetails: null,
      verifiedAt: new Date("2026-10-08T18:35:00Z"),
    },
  });

  // ==========================================
  // SCENARIO 2: PARTICIPANT MISMATCH DEMO
  // Student 23BCE1010 (Arjun Patel) applied for Robo Wars 2026
  // But Club Roster omitted him -> Status VERIFICATION_REQUIRED
  // Student submitted explanation -> Waiting for Faculty Coordinator correction!
  // ==========================================
  const arjunStudent = createdStudents.find((s) => s.regNo === "23BCE1010");
  const odReq2 = await prisma.oDRequest.create({
    data: {
      requestNumber: "OD-2026-RW1010",
      studentId: arjunStudent.id,
      eventId: event2.id,
      reason: "Piloted 15kg combat bot 'ThunderBolt' in arena quarterfinals and pit-crew repairs.",
      status: "VERIFICATION_REQUIRED",
      requestedHours: 6,
      studentExplanation: "I was part of Team Thunderbolt registered under pilot ID #42. The club coordinator uploaded an incomplete batch list omitting the pit-crew and co-pilot roster. Attached is my arena badge and team photo.",
      clubExplanation: "Club coordinator Tanmay acknowledged that Team Thunderbolt's auxiliary members were on sheet 2 of our internal spreadsheet and missed during the initial CSV upload.",
      createdAt: new Date("2026-10-08T19:00:00Z"),
    },
  });

  await prisma.evidence.create({
    data: {
      odRequestId: odReq2.id,
      type: "GEOTAGGED_PHOTO",
      title: "Arena Pit Crew Photo with Combat Bot",
      fileName: "robowars_arena_pit_23BCE1010.jpg",
      fileUrl: "/evidence/robowars_pit.jpg",
      fileSize: "2.8 MB",
      mimeType: "image/jpeg",
      gpsLatitude: 12.8415,
      gpsLongitude: 80.1542,
      photoTimestamp: new Date("2026-10-14T11:45:00Z"),
      photoLocationName: "Indoor Sports Complex Arena, VIT Chennai",
      isGeoVerified: true,
      geoVerificationNotes: "GPS location matches venue. Flagged due to participant roster mismatch.",
    },
  });

  await prisma.evidence.create({
    data: {
      odRequestId: odReq2.id,
      type: "TICKET_PASS",
      title: "Robo Wars Pit Crew Official Accreditation Badge",
      fileName: "robowars_pitcrew_badge.pdf",
      fileUrl: "/evidence/robowars_badge.pdf",
      fileSize: "850 KB",
      mimeType: "application/pdf",
    },
  });

  // Verification result for Mismatch: Participant Match is FALSE
  await prisma.verificationResult.create({
    data: {
      odRequestId: odReq2.id,
      checkEventExists: true,
      checkSwcApproved: true,
      checkDateMatch: true,
      checkTimeMatch: true,
      checkParticipantMatch: false, // ✗ Mismatch!
      checkEvidenceMatch: true,
      checkLocationMatch: true,
      checkOdLimit: true,
      overallStatus: "VERIFICATION_REQUIRED",
      mismatchDetails: JSON.stringify([
        "Student 23BCE1010 is not found on the club's official participant list for 'Robo Wars 2026 - Combat Robotics League'.",
      ]),
      verifiedAt: new Date("2026-10-08T19:05:00Z"),
    },
  });

  // ==========================================
  // SCENARIO 3: COMPLETED & APPROVED OD RECORD
  // Aisha Khan (23BCE1002) for Web3 Workshop -> Already SWC Approved & Recorded
  // ==========================================
  const aishaStudent = createdStudents.find((s) => s.regNo === "23BCE1002");
  const odReq3 = await prisma.oDRequest.create({
    data: {
      requestNumber: "OD-2026-W31002",
      studentId: aishaStudent.id,
      eventId: event6.id,
      reason: "Participated in hands-on zk-SNARKs smart contract cryptography masterclass.",
      status: "SWC_APPROVED",
      requestedHours: 6,
      swcRemarks: "Verified against CodeChef attendance roster and lab geotag. Approved by SWC.",
      createdAt: new Date("2026-09-28T17:00:00Z"),
      updatedAt: new Date("2026-09-29T10:00:00Z"),
    },
  });

  const recordHash3 = crypto
    .createHash("sha256")
    .update(`OD-2026-W31002-23BCE1002-6-${event6.id}-SWC_APPROVED`)
    .digest("hex");

  await prisma.oDRecord.create({
    data: {
      odRequestId: odReq3.id,
      studentId: aishaStudent.id,
      eventId: event6.id,
      regNo: aishaStudent.regNo,
      studentName: aishaStudent.name,
      eventTitle: event6.title,
      clubName: clubCoding.name,
      eventDate: event6.eventDate,
      startTime: event6.startTime,
      endTime: event6.endTime,
      hoursGranted: 6,
      venue: event6.venue,
      approvalAuthority: "Student Welfare Centre (SWC) - Dr. S. Balasubramanian",
      approvedAt: new Date("2026-09-29T10:00:00Z"),
      recordHash: recordHash3,
    },
  });

  await prisma.verificationResult.create({
    data: {
      odRequestId: odReq3.id,
      checkEventExists: true,
      checkSwcApproved: true,
      checkDateMatch: true,
      checkTimeMatch: true,
      checkParticipantMatch: true,
      checkEvidenceMatch: true,
      checkLocationMatch: true,
      checkOdLimit: true,
      overallStatus: "VERIFIED",
      verifiedAt: new Date("2026-09-28T17:10:00Z"),
    },
  });

  // Additional approved record for Rahul Sharma (earlier event) to make his used hours 18
  const odReqHist = await prisma.oDRequest.create({
    data: {
      requestNumber: "OD-2026-HIST1001",
      studentId: rahulStudent.id,
      eventId: event6.id,
      reason: "Presented in South Zone Technical Symposium 2026.",
      status: "SWC_APPROVED",
      requestedHours: 18,
      swcRemarks: "Sanctioned 18 hours OD for interstate technical symposium presentation.",
      createdAt: new Date("2026-08-23T10:00:00Z"),
    },
  });

  const earlierRecordHash = crypto
    .createHash("sha256")
    .update(`OD-HIST-01-23BCE1001-18`)
    .digest("hex");

  await prisma.oDRecord.create({
    data: {
      odRequestId: odReqHist.id,
      studentId: rahulStudent.id,
      eventId: event6.id,
      regNo: rahulStudent.regNo,
      studentName: rahulStudent.name,
      eventTitle: "South Zone Technical Symposium 2026",
      clubName: "CodeChef VIT Chennai",
      eventDate: "2026-08-22",
      startTime: "09:00",
      endTime: "17:00",
      hoursGranted: 18,
      venue: "Academic Block 2 Audi",
      approvalAuthority: "Student Welfare Centre (SWC) - Dr. S. Balasubramanian",
      approvedAt: new Date("2026-08-25T11:00:00Z"),
      recordHash: earlierRecordHash,
    },
  });

  // ==========================================
  // SCENARIO 4: PENDING REQUEST FOR TODAY'S EVENT
  // Vikram Nair (23BCE1042) applying for Inter-Collegiate Badminton
  // ==========================================
  const vikramStudent = createdStudents.find((s) => s.regNo === "23BCE1042");
  await prisma.oDRequest.create({
    data: {
      requestNumber: "OD-2026-SP1042",
      studentId: vikramStudent.id,
      eventId: event3.id,
      reason: "Men's Singles Quarterfinalist representing VIT Chennai University team.",
      status: "SUBMITTED",
      requestedHours: 7,
      createdAt: new Date("2026-10-09T08:30:00Z"),
    },
  });

  console.log("🔔 Adding In-App Notifications...");

  // Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: rahulStudent.userId,
        role: "STUDENT",
        title: "OD Request Verified",
        message: "Your OD request for 'VIT TechFest 2026' has passed automated verification and is queued for SWC approval.",
        type: "SUCCESS",
        linkUrl: "/student",
      },
      {
        userId: arjunStudent.userId,
        role: "STUDENT",
        title: "Action Required: Participant Mismatch",
        message: "Your OD request for 'Robo Wars 2026' was flagged: You were not found on the club's official roster. Please submit clarification.",
        type: "WARNING",
        linkUrl: "/student",
      },
      {
        userId: fac2User.id,
        role: "FACULTY",
        title: "Participant Mismatch Requires Correction",
        message: "Student Arjun Patel (23BCE1010) reported a roster mismatch for 'Robo Wars 2026'. As Faculty Coordinator, only you can submit the corrected verification.",
        type: "ACTION_REQUIRED",
        linkUrl: "/faculty",
      },
      {
        userId: clubCoordUser.id,
        role: "CLUB",
        title: "Roster Clarification Flagged",
        message: "Student Arjun Patel (23BCE1010) reported omission from the Robo Wars 2026 roster. Review with Faculty Coordinator.",
        type: "INFO",
        linkUrl: "/club",
      },
      {
        userId: swcUser.id,
        role: "SWC",
        title: "New OD Requests In Queue",
        message: "Rahul Sharma (23BCE1001) has 1 verified OD request ready for final sign-off.",
        type: "ACTION_REQUIRED",
        linkUrl: "/swc",
      },
    ],
  });

  console.log("📜 Adding Audit Logs...");

  await prisma.auditLog.createMany({
    data: [
      {
        action: "EVENT_PROPOSAL_SUBMITTED",
        entityType: "EVENT",
        entityId: event1.id,
        actorName: "Tanmay Deshmukh (CodeChef)",
        actorRole: "CLUB",
        details: "Submitted OD eligibility proposal for 'VIT TechFest 2026 - National Hackathon' (8 expected hours).",
        timestamp: new Date("2026-09-28T14:20:00Z"),
      },
      {
        action: "SWC_EVENT_APPROVED",
        entityType: "EVENT",
        entityId: event1.id,
        actorName: "Dr. S. Balasubramanian",
        actorRole: "SWC",
        details: "Sanctioned OD eligibility for 'VIT TechFest 2026' for up to 8 hours per verified participant.",
        timestamp: new Date("2026-10-01T10:00:00Z"),
      },
      {
        action: "CLUB_PARTICIPANT_LIST_UPLOADED",
        entityType: "PARTICIPANT_LIST",
        entityId: event1.id,
        actorName: "Tanmay Deshmukh (CodeChef)",
        actorRole: "CLUB",
        details: "Uploaded official post-event attendance roster with 5 students.",
        timestamp: new Date("2026-10-08T18:00:00Z"),
      },
      {
        action: "OD_REQUEST_SUBMITTED",
        entityType: "OD_REQUEST",
        entityId: odReq1.id,
        actorName: "Rahul Sharma (23BCE1001)",
        actorRole: "STUDENT",
        details: "Submitted OD request OD-2026-TF1001 with 2 evidence files (geotagged photo + certificate).",
        timestamp: new Date("2026-10-08T18:30:00Z"),
      },
      {
        action: "AUTO_VERIFICATION_MATCHED",
        entityType: "OD_REQUEST",
        entityId: odReq1.id,
        actorName: "Automated Verification Engine",
        actorRole: "SYSTEM",
        details: "All 8 verification checks PASSED. Matched club participant roster and geotag radius (VIT Chennai).",
        timestamp: new Date("2026-10-08T18:35:00Z"),
      },
      {
        action: "MISMATCH_DETECTED",
        entityType: "OD_REQUEST",
        entityId: odReq2.id,
        actorName: "Automated Verification Engine",
        actorRole: "SYSTEM",
        details: "Student Arjun Patel (23BCE1010) was not found on the official participant list submitted by Robotics Club. Status moved to VERIFICATION_REQUIRED.",
        timestamp: new Date("2026-10-08T19:05:00Z"),
      },
    ],
  });

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

