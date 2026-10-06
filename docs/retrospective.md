# Retrospective

## Workflows

### Optimistic Concurrency

- Start Orb Web
- Open two frontend instances (tabs)
- Create a user (if one doesn't already exist)
- Direct both frontend instances to edit the same user with new data (dont save yet)
- With both instances of the frontend editing the same user, save changes on one
  of the instances.
- Attempt to save changes on the second frontend instance
- Observe that a notice appears that prompts the administrator to reload the changes in-place
(Overwrite not implemented at this time)

### Generating 500,000 users

- Start Orb Web
- Click the top right user icon settings
- Click `Tools` in the dropdown
- In the tools page, within the `Generate` Card, enter `500000` for the count
- Click Generate
- Wait for the generation to complete

### Export
- In the tools page, within the `Export` Card, click the `Export` button
- Save `Users.csv` to your machine

### Reset
- In the tools page, within the `Reset` Card, click the `Delete all users` button
- Confirm the prompt on the dialog that comes up, click the `Delete all users` button
- Observe that no user exists in the system

### Import
- In the tools page, within the `Import` Card, click the `Import` button
- Upload a Users.csv file from an earlier export
- Wait for the import to complete (loading bar not implemented here)
- Observe that the users are now in the user management screen once more

## Implementation and UX decisions

The following is implemented:

- Responsive Navigation Bar
- Pagination
- Sort, Search and Filtering Users by
- User Creation
- User Editing
- ETag handling and 412 Precondition Failure
- Bulk User Generation
- Import/Export CSV
- Routing
- UI Layout Skeleton
- Snackbar notifications

Edits use ETags to catch changes made by someone else. If a record has changed,
the form shows the conflict and lets the administrator reload it. This can be
confirmed with two tabs of the frontend.

Added clear loading, error, and success messages, along with tools to
generate, import, export, and reset users. I also built a FastAPI service with
SQLite instead of the in-memory store described in the brief. Password reset
is purely cosmetic, an endpoint that returns the same string.

I separated API code from the components. The shared client handles requests and
errors, while the user API converts backend data into frontend types. This
solution is similar to what I have implemented in my last role, however I am not
leveraging some of the more complex libraries that make the solution much cleaner.

DX decision: kept `/users` for the user collection, updated endpoints that
explicitly worked with one user to be singular (`/user` and `/user/{id}` for
creating or working with one user) The plural path means a group, the singular
path means one resource.

Added `created_At`, `updated_at` and an optional `last_login` as ISO time properties.
They are intentionally not able to be edited by the administrator and serve as another
source of sort testing.

## Trade-offs I made

Building a backend and extra admin quality-of-life tools made for a more impressive
demo, but left less time for UI polish and testing. Risky decision considering that
this Take-Home Exercise is for a UI Designer / Frontend Developer role.

## What I would improve with more time

- Offer to overwrite on a 412 instead of only providing reset option
- Polish the UI beyond small tweaks to MUI components
  - update the Status property to render a Green/Yellow/Red Chip
  - improve pagination with jumpable pages instead of
  - improve the snackbar UI
- Add playwright tests
- Closer adhere to Accessibility best practices and guidelines.
  - Had taken a stab at Automated Accessibility Testing but ran out of time
- Implement a password-reset ux workflow, very likely extending the user schema with
  a `password` or `isReset` property
- With more time, I would start the pivot to using Angular.If I would have realized
  I was going to take the time to learn all of these new technologies I would have just
  went with Angular from the start.

## AI use

My primary uses of AI are as a search engine and proofreader. In this project, I
searched for guidance on unfamiliar technologies and cross referenced answers with
documentation.
As adding a backend was out of scope for this assignment, I utilized AI to quickly
recreate a familiar small scale server Ive used for exactly this kind of UI development.
