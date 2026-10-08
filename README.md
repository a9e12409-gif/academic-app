# Academic Metro Hub

A mobile-first Arabic RTL study planner built with React, Tailwind CSS, Vite, and Lucide icons.

## Run locally

1. Install Node.js 18 or newer.
2. Run npm install in this folder.
3. Run npm run dev and open the local URL printed by Vite.

## Included

- Weekly metro timetable with computed 90-minute sessions and automatic break lengths.
- Course registration from timetable entries, per-course absence counts, and WhatsApp links.
- Study files stored in IndexedDB; notes, video URLs, tasks, schedules, and exams stored in localStorage.
- Exam timeline, countdowns, and review shortcut into each course.
- JSON export/import for timetable data.
- Optional notifications 15 minutes before a class. They require browser permission and the app to remain open.

Study files are not embedded in JSON backups. Their references remain in exported data, but the file blobs stay in the browser profile where they were attached.
