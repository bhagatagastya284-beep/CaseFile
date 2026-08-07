# Casefile API Reference (MVP)

Base URL: `http://localhost:5000/api`

All protected routes require `Authorization: Bearer <token>`.

## Auth
| Method | Route | Description |
|---|---|---|
| POST | /auth/register | Create account `{ name, email, password }` |
| POST | /auth/login | Login `{ email, password }` |
| POST | /auth/logout | Logout (protected) |
| GET | /auth/profile | Get current user (protected) |
| PUT | /auth/profile | Update name (protected) |

## Projects (Research)
| Method | Route | Description |
|---|---|---|
| POST | /projects | Create project `{ title, description }` |
| GET | /projects | List current user's projects |
| GET | /projects/:id | Get project + plan + sources + evidence + report + documents |
| PUT | /projects/:id | Update title/description |
| DELETE | /projects/:id | Delete project and related data |
| GET | /projects/stats/dashboard | Dashboard stats |

## Files
| Method | Route | Description |
|---|---|---|
| POST | /files/upload | Upload PDF/DOCX/TXT (`multipart/form-data`, fields: `projectId`, `file`) |
| GET | /files?projectId= | List uploaded documents |
| DELETE | /files/:id | Delete a document |

## AI Pipeline
| Method | Route | Description |
|---|---|---|
| POST | /ai/:id/run | Start the autonomous research pipeline (plan → search → read → extract → analyze → cite → report) |
| GET | /ai/:id/citations | Get generated citations for a project |
| GET | /ai/:id/export?format=md\|pdf | Export the report |

The pipeline runs asynchronously; poll `GET /projects/:id` to track `status`,
`stage`, and `progress` as the project advances through
`planning → searching → reading → analyzing → writing → completed`.
