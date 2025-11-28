Below is a **clean, professional, short, Firebase-only** system design for your Mess Management System.
No emojis, no extra fluff — exactly like a proper **SYSTEM_DESIGN.md** file.

---

# SYSTEM_DESIGN.md

## Project: Mess Management System (Marathi UI)

## Architecture: React + Firebase (No Express)

---

## 1. Architectural Overview

The system is a web-based mess management platform designed for mess owners and their customers.
It consists of:

* React frontend deployed on Firebase Hosting
* Firebase Authentication for owner login
* Firestore for all data storage
* Firebase Cloud Functions for backend logic
* Firebase Scheduled Functions for daily cron operations
* Firebase Storage is not required
* Public customer lookup page (no login needed)

The application is fully Marathi and minimal in required data inputs.

---

## 2. User Roles

### 2.1 Mess Owner (Authenticated)

* Logs in through Firebase Auth
* Manages customers
* Marks daily attendance
* Views dashboards and reports
* Handles subscription renewals
* Receives expiry summary emails

### 2.2 Customer (No Login)

* Searches name + mess name
* Views subscription details
* Views validity and remaining days
* Views attendance calendar (read-only)

---

## 3. Core Features

### 3.1 Customer Management

* Create customer with: name, mobile number, start date
* Auto-generate: end date (+30 days), remaining days
* Update or delete customer
* List customers with filters: active, expiring, expired

### 3.2 Subscription Lifecycle

* Subscription = 30-day cycle
* End date auto-calculated
* Renewal adds next 30 days
* Expiry states updated automatically
* History stored for each renewal

### 3.3 Attendance System

* QR-based attendance:
  Cloud Function validates QR token
  Saves attendance record for the day

* Manual attendance:
  Owner toggles presence in UI

* Reports: daily, weekly, monthly

### 3.4 Automated Alerts

Daily scheduled Cloud Function:

* Calculate remaining days for each customer
* Identify expiring and expired customers
* Send summary email to the mess owner

### 3.5 Customer Public Profile

* No authentication required
* Input: customer name + mess name
* System returns:

  * validity
  * remaining days
  * start date
  * end date
  * attendance summary

---

## 4. System Components

### 4.1 Frontend (React)

Responsibilities:

* Owner dashboard UI
* Customer management UI
* Attendance interface
* Renewal UI
* Marathi language UI
* Public profile page

Technologies:

* React + Vite
* Tailwind CSS
* Firestore SDK
* Firebase Auth SDK

### 4.2 Firebase Authentication

* Only mess owners have login accounts
* Customer side does not require login
* Email/password or phone authentication supported

### 4.3 Firestore Database

Collections:

1. messOwners
2. customers
3. attendance
4. messSettings
5. renewals
6. publicProfiles (optional cached data)

### 4.4 Cloud Functions

#### 4.4.1 QR Token Function

* Generates short-lived QR token for the day
* Parses and validates token during scan
* Writes attendance record

#### 4.4.2 Public Profile Function

* Input: name + mess ID
* Returns limited customer data

#### 4.4.3 Subscription Cron Function

* Runs daily using Scheduled Functions
* Recalculates remaining days
* Updates expiry states
* Sends summary email to mess owner

#### 4.4.4 Renewal Handler

* Adds new subscription cycle
* Updates customer record
* Adds entry in renewals collection

---

## 5. Data Models (Simplified)

### 5.1 Customer Document

```
{
  id: string,
  messId: string,
  name: string,
  mobile: string,
  startDate: timestamp,
  endDate: timestamp,
  remainingDays: number,
  status: "active" | "expiring" | "expired",
  createdAt: timestamp
}
```

### 5.2 Attendance Document

```
{
  id: string,
  messId: string,
  customerId: string,
  date: yyyy-mm-dd,
  time: timestamp,
  method: "qr" | "manual"
}
```

### 5.3 Renewal Log

```
{
  id: string,
  customerId: string,
  messId: string,
  previousEndDate: timestamp,
  newEndDate: timestamp,
  renewedAt: timestamp
}
```

---

## 6. Workflows

### 6.1 Customer Registration

1. Owner inputs name and mobile number
2. Selects start date
3. System calculates end date = start + 30 days
4. Customer stored in Firestore

### 6.2 Daily Attendance

QR Mode:

* Owner generates QR
* Customer scans
* Cloud function validates and stores attendance

Manual Mode:

* Owner selects customer
* Marks attendance

### 6.3 Subscription Expiry Handling

Daily cron:

* Fetch active customers
* Compute remaining days
* Set statuses
* Send summary email

### 6.4 Public Profile Fetch

* Customer enters name + mess name
* Function queries customer record
* Returns limited details

---

## 7. Security

* Firebase Auth protects owner-only routes
* Firestore security rules enforce role separation
* Public profile exposes only non-sensitive data
* QR attendance tokens are time-limited
* No address, no photo, minimal PII kept

---

## 8. Hosting and Deployment

* Firebase Hosting serves React build
* Firestore stores all data
* Cloud Functions deployed as backend
* Scheduled Functions enabled via Firebase console
* No external server required

---

If you want, I can now generate:

* Firestore schema in detail
* Cloud Functions folder structure
* API endpoints (Firebase callable + HTTP functions)
* React folder structure
* UI wireframes
* Marathi UI JSON (translations)

Tell me what you need next.
