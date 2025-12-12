# signupsigninv2
signUPsignIN (V2)

From sign-up to show-up — without the chaos.

signUPsignIN is a lightweight event coordination platform designed for volunteer-run youth sports and community organizations. It replaces paper sign-ups, taped schedules, and guesswork with a simple workflow for managing event slots, checking volunteers in on arrival, and clearly seeing who showed up.

V2 is intentionally focused on event-day execution, not user accounts or complex administration.

⸻

🎯 What signUPsignIN Solves

On event night, organizers need to know:
	•	Who signed up
	•	Who actually showed up
	•	Where coverage is missing

signUPsignIN provides that clarity in real time — without forcing volunteers to create accounts or learn complex software.

⸻

✅ What’s Included in V2

Event & Slot Management
	•	Create and edit events
	•	Define volunteer slots with capacity and categories
	•	Control slot order and structure
	•	Share public signup links

Public Signup
	•	No login required for volunteers
	•	Capacity enforcement
	•	Mobile-friendly experience

Volunteer Check-In
	•	Public check-in page (no login)
	•	QR-based access per event
	•	Name search
	•	Timestamped attendance
	•	Already-checked-in state handling

Admin Experience
	•	Admin dashboard with upcoming events
	•	Event details and slot management
	•	QR generation for check-in
	•	Clean, consistent admin UI

Reporting
	•	Attendance detail reports
	•	Checked-in vs no-show visibility
	•	Slot and category context
	•	CSV export

⸻

🔒 Security & Architecture
	•	Admin authentication with organization scoping
	•	Row-level security (RLS) enforced in Supabase
	•	Public pages are read-only and scoped to individual events
	•	Volunteers never require accounts

⸻

🚫 Explicitly Out of Scope for V2

These features are intentionally excluded from V2:
	•	User management UI (roles, invites, permissions)
	•	Volunteer accounts or profiles
	•	Notifications (email/SMS)
	•	Advanced analytics
	•	Mobile apps
	•	Billing or plans

These are planned for future versions based on real-world usage.

⸻

🅿️ Roadmap

Planned future enhancements are tracked in the V3 Roadmap issue.
V2 scope is frozen.

⸻

🛠 Tech Stack
	•	Static frontend (HTML / CSS / JS)
	•	Supabase (Postgres, Auth, RLS)
	•	GitHub Pages hosting
	•	QR-based public access

⸻

🚀 Status

Current version: v2.0.0
Status: Production-ready

⸻

📣 Philosophy

signUPsignIN is built for real environments:
	•	Busy gyms
	•	Volunteer-run events
	•	Non-technical users

Every feature must reduce confusion on event day.
Anything that doesn’t — doesn’t ship.
