# Development Prompt (generated from the project requirements)

Before writing any code, the original assignment brief was converted into the
following refined build prompt. Every file in this repository was implemented
against this prompt.

> **Build prompt:**
> Build a beginner-friendly full-stack **Internship & Job Listing Portal** with
> React.js (frontend), Node.js + Express.js (backend) and MongoDB (database, via
> Mongoose). Keep the UI minimal and clean. The app must let any visitor
> **view, search, filter (by domain) and open details** of opportunities, and
> **submit an application** that ends on a **confirmation screen**. An **admin
> area** must support **add / edit / delete opportunity** and **view all
> applications**. Each opportunity stores: title, company, domain, location,
> experience, description and an application link. Deliver everything inside one
> folder with a README, API documentation, database structure and a project
> report. Use REST conventions (`/api/opportunities`, `/api/applications`),
> query params for search/filter (`?search=&domain=`), proper status codes and
> JSON error messages, and connect the React app to the API through the Vite dev
> proxy so no CORS config is needed in development. Seed the DB with realistic
> sample data so the portal is usable immediately. Bonus (optional, keep
> lightweight): a simple admin key header for mutating routes and a resume-link
> field on applications.

## Requirements → implementation checklist

| Requirement (from brief) | Where it is implemented |
|---|---|
| View opportunities | `frontend/src/pages/Home.jsx` + `GET /api/opportunities` |
| Search opportunities | Search box on Home + `?search=` in `opportunityController.getOpportunities` |
| Filter by domain | Domain dropdown on Home + `?domain=` (+ `GET /api/opportunities/domains`) |
| View opportunity details | `OpportunityDetails.jsx` + `GET /api/opportunities/:id` |
| Submit application | `Apply.jsx` + `POST /api/applications` |
| Application confirmation | `Confirmation.jsx` + `GET /api/applications/:id` |
| Admin: add opportunity | `OpportunityForm.jsx` (new) + `POST /api/opportunities` |
| Admin: edit opportunity | `OpportunityForm.jsx` (edit) + `PUT /api/opportunities/:id` |
| Admin: delete opportunity | `Admin.jsx` + `DELETE /api/opportunities/:id` |
| Admin: view applications | `Applications.jsx` + `GET /api/applications` |
| Opportunity fields (title, company, domain, location, experience, description, application link) | `backend/models/Opportunity.js` |
| MongoDB models + connection | `backend/config/db.js`, `backend/models/*` |
| REST APIs | `backend/routes/*`, `backend/controllers/*` |
| CRUD + search/filter integration | Home page query params ↔ controller filter builder |
| Bonus: admin auth (lightweight) | `backend/middleware/admin.js` (`ADMIN_KEY` env, `x-admin-key` header) |
| Bonus: resume upload (as link) | `resumeLink` field in `Application` model + Apply form |
| README / report / structure | `README.md`, `docs/PROJECT_REPORT.md`, this file |
