# VIT Chennai – Automated On-Duty (OD) Management System

## Project Overview

The **Automated On-Duty (OD) Management System** is a centralized web-based platform designed for VIT Chennai to digitize and streamline the existing On-Duty approval process.

Traditionally, OD applications involve manual paperwork, multiple levels of verification, and administrative coordination. This system replaces the paper-based workflow with an automated, transparent, and secure digital pipeline.

The platform connects students, clubs, faculty coordinators, and the Student Welfare Committee (SWC) through a structured approval process.

### OD Approval Workflow

**Student → Club → Faculty Coordinator → SWC → Immutable OD Record**

The primary objective is to ensure accurate participant verification, prevent fraudulent OD claims, simplify administrative tasks, and maintain a reliable digital record of approved applications.

---

## Key Features

### 1. Dual-Source Participant Verification
- Cross-verifies student-submitted OD applications against official club attendance rosters.
- Identifies discrepancies between claimed and verified participation.
- Prevents unauthorized or incorrect OD approvals.

### 2. Automated 8-Point Verification Engine

Every OD application passes through an automated verification engine consisting of eight independent checks:

1. **Student Registry Validation:** Verifies the student's registration and institutional details.
2. **Event Pre-Approval:** Checks whether the event has received prior SWC approval.
3. **Date Validation:** Ensures the requested OD date matches the approved event schedule.
4. **Duration Validation:** Verifies the requested OD duration against the permitted event duration.
5. **Roster Verification:** Confirms whether the student appears in the official club attendance roster.
6. **Evidence Validation:** Checks the supporting documents and evidence submitted with the application.
7. **Geofence Verification:** Validates the student's event location using geotagged photographic evidence.
8. **Quota Validation:** Ensures the application complies with the student's semester OD hour limit.

### 3. Geotagged Photograph Verification (EXIF/GPS)
- Extracts GPS coordinates from submitted photographs using EXIF metadata.
- Uses the Haversine distance formula to calculate the distance between the photograph's location and the registered campus event venue.
- Automatically flags photographs that fall outside the permitted geofence radius.

### 4. Roster Mismatch & Faculty Correction Protocol
- Identifies discrepancies between student applications and official attendance records.
- Restricts official roster corrections to authorized Faculty Coordinators.
- Maintains a controlled correction workflow to ensure accountability and data integrity.

### 5. Semester OD Quota Tracking
- Implements a semester OD limit of **40 hours per student**.
- Displays live OD hour consumption and remaining quota.
- Provides visual progress indicators and warning thresholds when students approach their limits.

### 6. Cryptographic SHA-256 Ledger
- Generates SHA-256 cryptographic hashes for finalized OD records.
- Maintains tamper-evident records for improved data integrity.
- Enables verification of whether stored records have been modified after finalization.

### 7. SWC Executive Analytics Dashboard
Provides SWC administrators with a centralized analytics dashboard featuring interactive visualizations powered by Recharts.

Key analytics include:
- Monthly OD application and approval trends.
- Club-wise student participation and engagement.
- Automated verification status breakdown.
- Student OD quota monitoring and cap watchlists.

---

## User Roles & Dedicated Portals

The platform provides separate dashboards and role-based access for four categories of users.

| User Role | Portal | Responsibilities |
|---|---|---|
| Student | `/student` | Submit OD applications, upload evidence, track application status, and monitor semester OD quota. |
| Club | `/club` | Propose events, manage participant information, and upload official attendance rosters. |
| Faculty Coordinator | `/faculty` | Verify club submissions, review roster mismatches, and authorize official roster corrections. |
| SWC Administrator | `/swc` | Pre-approve events, review OD applications, make final approval decisions, and monitor institutional analytics. |

---

## Technology Stack

| Technology | Purpose |
|---|---|
| Next.js 14 | Full-stack React framework and application routing |
| TypeScript | Type-safe application development |
| Tailwind CSS | Responsive UI styling |
| Prisma ORM | Database access and management |
| SQLite | Relational database |
| Recharts | Interactive analytics and data visualization |
| SHA-256 | Cryptographic hashing and record integrity |
| EXIF/GPS | Geolocation metadata extraction and verification |

---

## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

Make sure you have the following installed:

- Node.js (LTS recommended)
- npm
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <project-folder>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Initialize the Database

Push the Prisma schema to the SQLite database:

```bash
npx prisma db push
```

### 5. Seed Demo Data

```bash
npx prisma db seed
```

*Note: Ensure the seed script is configured in your Prisma setup before running this command.*

### 6. Start the Development Server

```bash
npm run dev
```

Open your browser and navigate to:

```text
http://localhost:3000
```

### 7. Build for Production

To create an optimized production build:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

---

## Interactive Testing Scenarios

The system includes guided test scenarios to demonstrate its verification and approval workflows.

### Scenario A: Direct Auto-Verification

**Objective:** Demonstrate successful OD verification when all submitted information matches the official records.

Workflow:
1. Create and submit an event proposal.
2. Obtain SWC pre-approval for the event.
3. Upload the official participant attendance roster.
4. Log in as a student listed in the roster.
5. Submit an OD application with the required supporting evidence.
6. Allow the automated 8-point verification engine to process the application.
7. Review the verification results and final OD status.

**Expected Outcome:** The application successfully passes automated verification when all required conditions are satisfied.

### Scenario B: Roster Mismatch & Faculty Correction

**Objective:** Demonstrate how the system handles discrepancies between student-submitted information and official club records.

Workflow:
1. Create an approved event and upload its official attendance roster.
2. Log in as a student who is not included in the uploaded roster.
3. Submit an OD application for the event.
4. Allow the verification engine to identify the roster mismatch.
5. Log in as the authorized Faculty Coordinator.
6. Review the discrepancy and verify the student's participation.
7. Perform the permitted roster correction.
8. Re-evaluate the application and review its updated verification status.

**Expected Outcome:** The mismatch is flagged, and only an authorized Faculty Coordinator can perform the official correction.

---

## API Reference

The application exposes 14 REST API endpoints to support event management, OD applications, participant verification, approvals, and administrative operations.

| Module | Description |
|---|---|
| Event Management | Handles event proposals and event-related information. |
| SWC Pre-Approval | Manages event approval and authorization. |
| Participant Rosters | Supports attendance roster synchronization and management. |
| OD Applications | Handles student OD submissions and application tracking. |
| Automated Verification | Executes the eight-point verification process. |
| Evidence Validation | Processes supporting documents and geotagged photographs. |
| Faculty Corrections | Handles authorized roster mismatch corrections. |
| OD Quota Tracking | Retrieves semester OD consumption and remaining limits. |
| Final Approval | Manages SWC approval and rejection decisions. |
| Digital Ledger | Generates and verifies SHA-256 record hashes. |
| Analytics | Provides aggregated data for the SWC dashboard. |

*Refer to the API route files for the complete list of 14 endpoints, their HTTP methods, request parameters, and response formats.*

---

## Project Directory Structure

The project follows a modular Next.js application architecture.

```text
project-root/
│
├── app/
│   ├── student/             # Student portal
│   ├── club/                # Club management portal
│   ├── faculty/             # Faculty coordinator portal
│   ├── swc/                 # SWC administration portal
│   └── api/                 # REST API routes
│
├── components/              # Reusable UI components
│
├── lib/                     # Shared utilities and business logic
│
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Demo data seeding
│
├── public/                  # Static assets
│
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.ts       # Tailwind configuration
└── README.md                # Project documentation
```

*The directory structure above is a high-level representation. Refer to the repository for the complete implementation.*

---

## Project Objectives

The system aims to achieve the following:

- **Automation:** Eliminate repetitive manual OD processing and paperwork.
- **Transparency:** Provide clear application statuses and verification results.
- **Accuracy:** Reduce incorrect claims through multi-layered participant verification.
- **Accountability:** Enforce role-based permissions for sensitive administrative operations.
- **Security:** Maintain tamper-evident digital records using SHA-256 hashing.
- **Efficiency:** Simplify coordination between students, clubs, faculty coordinators, and SWC.

---

## Conclusion

The VIT Chennai Automated OD Management System transforms the conventional paper-based On-Duty process into a centralized, secure, and automated digital workflow.

By combining role-based access control, automated verification, geolocation validation, quota monitoring, cryptographic record integrity, and executive analytics, the platform aims to make institutional OD management more efficient, transparent, and reliable.
