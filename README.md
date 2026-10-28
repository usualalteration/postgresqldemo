# Prompt for Trustant

```
# Build a PostgreSQL Task Manager

Create a complete, working **Task Manager** application to demonstrate PostgreSQL integration with React and Nuvolaris OpenServerless.

Build and configure everything automatically, using the available tools. Do not ask for confirmation between steps.

**Application features**

- Create, view, edit and delete tasks.
- Each task has a title, description, status (To Do, In Progress, Done), priority (Low, Medium, High), and creation date.
- Filter tasks by status and search by title.
- Show dashboard counters for total tasks, completed tasks and pending tasks.
- Populate the database with 6 realistic sample tasks.

**PostgreSQL database**

- Use the available PostgreSQL integration to connect to the database.
- Create a `tasks` table with appropriate column types, constraints, an auto-generated primary key and timestamps.
- Implement all CRUD operations using parameterized SQL queries.
- Use PostgreSQL for all persistent data. Do not use mock data, localStorage or an in-memory database.
- Ensure the database schema and sample data are initialized safely without creating duplicates.

**OpenServerless backend**

- Implement the backend using Python actions on Nuvolaris OpenServerless.
- Use the available OpenServerless tools to create the actions and connect them to PostgreSQL, including `action_add_postgresql`.
- Provide endpoints for listing, creating, updating and deleting tasks, plus retrieving dashboard statistics.
- Return JSON responses with appropriate HTTP status codes and error handling.
- Validate inputs and prevent SQL injection.
- Verify the actions by invoking them with test data.

**React frontend and UI style**

Build a polished, responsive React application using Tailwind CSS.

Combine the following visual styles:

- **Modern SaaS dashboard:** clean layout, sidebar navigation, summary cards and generous spacing.
- **Minimalist design:** light neutral background, white cards, subtle shadows and rounded corners.
- **Indigo and violet accents:** primary buttons, active navigation and selected elements.
- **Kanban-inspired task management:** attractive task cards with colored priority and status badges.
- **Professional typography:** clear hierarchy, readable labels and consistent spacing.

The main screen should include a header, three statistic cards, a searchable task list, status filters and an Add Task button. Use a modal or drawer for creating and editing tasks.

Include loading states, empty states, error feedback and success notifications.

**Integration and verification**

- Connect the React frontend to the real OpenServerless API.
- Ensure all changes are immediately reflected in the interface.
- Demonstrate that tasks remain stored in PostgreSQL after refreshing the page.
- Make the application fully functional, not just a visual prototype.
- Run the available frontend and backend validation tools, fix any detected issues, and report the final result.

Keep the implementation simple and focused on demonstrating **React → OpenServerless Python actions → PostgreSQL**.
```

# What database is generated

## PostgreSQL Task Manager Database

The Task Manager application uses PostgreSQL to store tasks and track database initialization.

The database contains two tables: `tasks` and `app_seed_meta`.

### Tasks Table

The `tasks` table stores all tasks managed by the application.

| Column | Type | Description |
|---|---|---|
| id | BIGSERIAL | Auto-generated primary key |
| title | VARCHAR(200) | Task title, required |
| description | TEXT | Task description, defaults to empty string |
| status | VARCHAR(20) | To Do, In Progress, or Done |
| priority | VARCHAR(10) | Low, Medium, or High |
| created_at | TIMESTAMPTZ | Task creation timestamp |
| updated_at | TIMESTAMPTZ | Last modification timestamp |

### SQL Schema

```sql
CREATE TABLE IF NOT EXISTS tasks (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'To Do'
        CHECK (status IN ('To Do', 'In Progress', 'Done')),
    priority VARCHAR(10) NOT NULL DEFAULT 'Medium'
        CHECK (priority IN ('Low', 'Medium', 'High')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_status
    ON tasks (status);

CREATE INDEX IF NOT EXISTS idx_tasks_created_at
    ON tasks (created_at DESC);
```

### Seed Metadata Table

The `app_seed_meta` table tracks database initialization to prevent duplicate sample data.

| Column | Type | Description |
|---|---|---|
| key | VARCHAR(100) | Unique seed identifier, primary key |
| seeded_at | TIMESTAMPTZ | Timestamp of initialization |

### SQL Schema

```sql
CREATE TABLE IF NOT EXISTS app_seed_meta (
    key VARCHAR(100) PRIMARY KEY,
    seeded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Initial Sample Data

The application creates six sample tasks during the first database initialization.

| Title | Status | Priority |
|---|---|---|
| Design PostgreSQL schema | Done | High |
| Implement task CRUD actions | In Progress | High |
| Build the dashboard UI | In Progress | Medium |
| Write endpoint tests | To Do | Medium |
| Set up CI pipeline | To Do | Low |
| Polish accessibility | To Do | Low |

Each task also includes a description explaining its purpose.

### Database Initialization

The initialization function:

1. Creates the `tasks` table if it does not exist.
2. Creates indexes on `status` and `created_at`.
3. Creates the `app_seed_meta` table if necessary.
4. Checks whether the marker `tasks-sample-data-v1` exists.
5. Inserts the six sample tasks only if the marker is absent.
6. Saves the marker to prevent duplicate initialization.
7. Commits the transaction and returns the total number of tasks.

The operation is idempotent when executed sequentially and can be repeated without duplicating sample tasks.

### PostgreSQL Integration

The database is accessed through Python actions running on Nuvolaris OpenServerless.

The PostgreSQL connection is provided through `ctx.POSTGRESQL`, configured using the `action_add_postgresql` tool.

All database operations use parameterized SQL queries to prevent SQL injection.

The React frontend communicates with OpenServerless actions, which execute SQL statements against PostgreSQL.

**Architecture:** React → OpenServerless Python Actions → PostgreSQL

### Important Notes

- PostgreSQL is the persistent storage layer.
- Tasks remain available after refreshing the React application.
- The `status` and `priority` fields enforce allowed values through SQL constraints.
- Timestamps are stored with timezone information.
- `updated_at` is initialized automatically but must be explicitly updated by CRUD actions using `NOW()`.
- The seed marker prevents repeated initialization in sequential executions; concurrent initializations require additional synchronization.

