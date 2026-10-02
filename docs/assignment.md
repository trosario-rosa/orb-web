# Take-Home Exercise: Admin User Management UI

## Overview

Build a UI for an application administrator that includes a top navigation bar and a user management
screen reachable from it. The requirements below describe what the admin needs. Your job is to turn
them into a clean, working, well-built interface.

Your submission should include:

- Source code
- A README explaining your implementation and UX decisions, the trade-offs you made, and what
  you would improve with more time
- **Optional:** any wireframes, mockups, or sketches you made along the way. Any tool is fine,
  including paper. Design files are not required.

**How we evaluate submissions:**

- **Implementation:** how well you build the interface and API layer, including code quality,
  correctness, accessibility, and how you handle the scale and concurrency requirements.
- **UX from the requirements:** how well your interface serves the admin, including layout,
  workflows, and loading, empty, and error states.
- **Going beyond:** improvements you suggest or add based on your own experience. This is a
  bonus, not an expectation.

You may use AI as a reference, but please describe how you used it in your README. The code you
submit should be your own work; do not use AI to generate the project.

## Requirements

### Navigation

- Include a top navigation bar.
- At minimum, one entry must navigate to the user management screen.
- Other entries in the nav can be non-functional placeholders.

### User Management Screen

- Display a list of users.
- Support creating a new user.
- Support viewing and editing an existing user's details.
- Feel free to add any other features you think are useful.

### Usability

- Follow WCAG 2.2 accessibility guidelines (Level AA).
- Include quality-of-life features that make the admin's work easier.

### Scale

The application is expected to reach 500,000 users within a few months of launch. Design the list view
with that in mind — assume it is not safe to load or render all users at once.

## Data & API

No backend is provided. Implement a client-side API layer against the contract below, backed by an
in-memory data store so that creates and edits are reflected on screen. Write this layer as you would
against a real HTTP API — request/response shapes, headers, and error handling all apply — even
though the "server" is stubbed locally rather than running somewhere.

#### User Object

| Field      | Type   | Notes                             |
| ---------- | ------ | --------------------------------- |
| id         | string | unique identifier                 |
| first_name | string |                                   |
| last_name  | string |                                   |
| role       | string | e.g. Admin / Member / Viewer      |
| status     | string | e.g. active / invited / suspended |

Feel free to add fields if useful; the above is the minimum.

#### Endpoints

| Method & path                          | Description                         | Notes                                 |
| -------------------------------------- | ----------------------------------- | ------------------------------------- |
| `GET /users `                          | List users                          | Paginated — see below                 |
| `GET /users/<user_id>`                 | Get a single user's details         | Returns an ETag — see below           |
| `POST /users`                          | Create a new user                   | Returns the created user and its ETag |
| `PUT /users/<user_id>`                 | Update an existing user             | Requires If-Match — see below         |
| `POST /users/<user_id>/password-reset` | Trigger a password reset for a user | No If-Match required                  |

#### Pagination — GET /users

Query parameters:

- skip (integer, default 0) — number of records to skip.
- limit (integer, default 25, max 100) — number of records to return.

Response shape:

```
{
    "items": [ /* User[] */ ],
    "total": 500000
}
```

#### ETags / Optimistic Concurrency

- `GET /users/<user_id>` returns an ETag response header representing the current version of that user record.
- `PUT /users/<user_id>` must include an If-Match request header set to the ETag value the client last read for that user.
  - If it matches the server's current value, the update succeeds and a new ETag is returned.
  - If it does not match — the record changed since it was last read — the server responds 412 Precondition Failed.
    The UI should handle this (e.g., surface the conflict and let the admin choose to reload or overwrite) rather than
    silently failing or blindly overwriting.
- `POST /users` (create) has nothing to match against yet, so no If-Match is needed; the response includes the new
  record's initial ETag.
- `POST /users/<user_id>/password-reset` is treated as an action rather than a full record update, so it does not
  require If-Match.
