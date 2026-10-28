"""Dashboard statistics API backed by PostgreSQL.

Public route (Nuvolaris OpenServerless web action):

    GET /api/my/v1/tasks-stats -> counters for the dashboard cards

Returns the total number of tasks, how many are completed (Done) and how
many are still pending, plus per-status and per-priority breakdowns.
"""

STATUSES = ("To Do", "In Progress", "Done")
PRIORITIES = ("Low", "Medium", "High")


def main(args, ctx=None):
    if not ctx or not hasattr(ctx, "POSTGRESQL"):
        return {"ok": False, "error": "Database not configured", "code": 503}

    conn = ctx.POSTGRESQL
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM tasks")
            total = int(cur.fetchone()[0])

            cur.execute("SELECT COUNT(*) FROM tasks WHERE status = 'Done'")
            completed = int(cur.fetchone()[0])

            cur.execute("SELECT COUNT(*) FROM tasks WHERE status <> 'Done'")
            pending = int(cur.fetchone()[0])

            by_status = {status: 0 for status in STATUSES}
            cur.execute("SELECT status, COUNT(*) FROM tasks GROUP BY status")
            for status, count in cur.fetchall():
                if status in by_status:
                    by_status[status] = int(count)

            by_priority = {priority: 0 for priority in PRIORITIES}
            cur.execute("SELECT priority, COUNT(*) FROM tasks GROUP BY priority")
            for priority, count in cur.fetchall():
                if priority in by_priority:
                    by_priority[priority] = int(count)

        return {
            "ok": True,
            "total": total,
            "completed": completed,
            "pending": pending,
            "byStatus": by_status,
            "byPriority": by_priority,
        }

    except Exception as exc:
        try:
            conn.rollback()
        except Exception:
            pass
        return {"ok": False, "error": f"Internal error: {exc}", "code": 500}