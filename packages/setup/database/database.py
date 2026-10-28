"""Idempotent database setup for the Task Manager demo.

Creates the ``tasks`` table plus a durable seed-marker table, and seeds
six realistic sample tasks exactly once. Re-running this action is safe:
schema statements use ``IF NOT EXISTS`` and the seed step is guarded by a
durable marker row, so no duplicates are ever created.
"""

SEED_KEY = "tasks-sample-data-v1"

SAMPLE_TASKS = [
    (
        "Design PostgreSQL schema",
        "Define the tasks table with typed columns, constraints, an "
        "auto-generated primary key and timestamp columns.",
        "Done",
        "High",
    ),
    (
        "Implement task CRUD actions",
        "Python OpenServerless actions for listing, creating, updating and "
        "deleting tasks with parameterized SQL queries.",
        "In Progress",
        "High",
    ),
    (
        "Build the dashboard UI",
        "React dashboard with summary cards, search, status filters and a "
        "modal editor for creating and updating tasks.",
        "In Progress",
        "Medium",
    ),
    (
        "Write endpoint tests",
        "Validate the full create, list, update and delete matrix over HTTP "
        "with curl, including item routes with the id in the URL.",
        "To Do",
        "Medium",
    ),
    (
        "Set up CI pipeline",
        "Automate typecheck, build and deployment checks so every change is "
        "verified before it ships.",
        "To Do",
        "Low",
    ),
    (
        "Polish accessibility",
        "Audit labels, focus rings, keyboard navigation and color contrast "
        "across the whole interface.",
        "To Do",
        "Low",
    ),
]


def main(args, ctx=None):
    if not ctx or not hasattr(ctx, "POSTGRESQL"):
        return {"ok": False, "error": "Database not configured"}

    conn = ctx.POSTGRESQL
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
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
                )
                """
            )
            cur.execute(
                "CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks (status)"
            )
            cur.execute(
                "CREATE INDEX IF NOT EXISTS idx_tasks_created_at "
                "ON tasks (created_at DESC)"
            )
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS app_seed_meta (
                    key VARCHAR(100) PRIMARY KEY,
                    seeded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
                """
            )

            cur.execute(
                "SELECT 1 FROM app_seed_meta WHERE key = %s", (SEED_KEY,)
            )
            already_seeded = cur.fetchone() is not None
            seeded_now = False
            if not already_seeded:
                for title, description, status, priority in SAMPLE_TASKS:
                    cur.execute(
                        """
                        INSERT INTO tasks (title, description, status, priority)
                        VALUES (%s, %s, %s, %s)
                        """,
                        (title, description, status, priority),
                    )
                cur.execute(
                    "INSERT INTO app_seed_meta (key) VALUES (%s)", (SEED_KEY,)
                )
                seeded_now = True

            cur.execute("SELECT COUNT(*) FROM tasks")
            task_count = int(cur.fetchone()[0])
        conn.commit()
        return {
            "ok": True,
            "seeded": seeded_now,
            "taskCount": task_count,
        }
    except Exception as exc:
        try:
            conn.rollback()
        except Exception:
            pass
        return {"ok": False, "error": f"Setup failed: {exc}"}