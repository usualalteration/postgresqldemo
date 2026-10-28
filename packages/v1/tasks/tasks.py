"""Task Manager CRUD API backed by PostgreSQL.

Public routes (Nuvolaris OpenServerless web action):

    GET    /api/my/v1/tasks           -> list tasks (optional ?status= and ?q=)
    GET    /api/my/v1/tasks/<id>      -> fetch a single task
    POST   /api/my/v1/tasks           -> create a task
    PUT    /api/my/v1/tasks/<id>      -> update a task (partial allowed)
    DELETE /api/my/v1/tasks/<id>      -> delete a task

Every statement is parameterized (``%s`` placeholders) so user input is
never interpolated into SQL. App-level errors are returned as simple JSON
payloads ``{"ok": false, "error": "...", "code": <int>}``.
"""

import json
import re


class ApiError(Exception):
    """Application-level error carrying a suggested HTTP status code."""

    def __init__(self, message, code=400):
        super().__init__(message)
        self.message = message
        self.code = code


STATUSES = ("To Do", "In Progress", "Done")
PRIORITIES = ("Low", "Medium", "High")
TASK_COLUMNS = "id, title, description, status, priority, created_at, updated_at"
IGNORED_KEYS = {
    "body",
    "POSTGRES_URL",
    "__ow_method",
    "__ow_headers",
    "__ow_path",
    "__ow_body",
    "__ow_query",
    "method",
}


def request_data(args):
    """Merge JSON body fields with top-level (query/form) fields."""
    data = dict(args) if isinstance(args, dict) else {}
    body = data.get("body")
    if isinstance(body, str):
        try:
            body = json.loads(body)
        except Exception:
            body = {}
    merged = dict(body) if isinstance(body, dict) else {}
    merged.update({k: v for k, v in data.items() if k not in IGNORED_KEYS})
    return merged


def request_method(args):
    return (args.get("__ow_method") or args.get("method") or "GET").upper()


def request_route_id(args, data, resource_name="tasks"):
    """Resolve the item id from the JSON body or the ``__ow_path`` suffix."""
    for key in ("id", "task_id"):
        value = data.get(key)
        if value not in (None, ""):
            return str(value)

    raw_path = str(args.get("__ow_path") or args.get("path") or "").strip("/")
    if not raw_path:
        return ""

    parts = [part for part in raw_path.split("/") if part]
    if not parts:
        return ""

    if resource_name in parts:
        index = parts.index(resource_name)
        if index + 1 < len(parts):
            return parts[index + 1]

    return parts[-1]


def to_task_id(value):
    text = str(value).strip()
    if not re.fullmatch(r"\d+", text):
        raise ApiError("Invalid task id", 400)
    return int(text)


def clean_text(value, field, max_len, required=True, default=""):
    if value is None:
        if required:
            raise ApiError(f"{field} is required", 400)
        return default
    text = str(value).strip()
    if required and not text:
        raise ApiError(f"{field} is required", 400)
    if len(text) > max_len:
        raise ApiError(f"{field} must be at most {max_len} characters", 400)
    return text


def clean_enum(value, allowed, field, default=None):
    if value is None or not str(value).strip():
        if default is None:
            raise ApiError(f"{field} is required", 400)
        return default
    text = str(value).strip()
    if text not in allowed:
        raise ApiError(f"{field} must be one of: {', '.join(allowed)}", 400)
    return text


def escape_like(text):
    """Escape LIKE wildcards so user search text is matched literally."""
    return text.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def row_to_task(row):
    created = row[5]
    updated = row[6]
    return {
        "id": row[0],
        "title": row[1],
        "description": row[2] or "",
        "status": row[3],
        "priority": row[4],
        "createdAt": created.isoformat() if created else None,
        "updatedAt": updated.isoformat() if updated else None,
    }


def fetch_task_row(cur, task_id):
    cur.execute(f"SELECT {TASK_COLUMNS} FROM tasks WHERE id = %s", (task_id,))
    row = cur.fetchone()
    if row is None:
        raise ApiError("Task not found", 404)
    return row


def handle_list(conn, data):
    clauses = []
    params = []

    status = data.get("status")
    if status is not None and str(status).strip() and str(status).strip() != "All":
        status = clean_enum(status, STATUSES, "status")
        clauses.append("status = %s")
        params.append(status)

    search = data.get("q")
    if search is not None and str(search).strip():
        pattern = f"%{escape_like(str(search).strip())}%"
        clauses.append("title ILIKE %s ESCAPE '\\'")
        params.append(pattern)

    where = f" WHERE {' AND '.join(clauses)}" if clauses else ""
    sql = f"SELECT {TASK_COLUMNS} FROM tasks{where} ORDER BY created_at DESC, id DESC"

    with conn.cursor() as cur:
        cur.execute(sql, params)
        rows = cur.fetchall()

    return {
        "ok": True,
        "count": len(rows),
        "tasks": [row_to_task(row) for row in rows],
    }


def handle_get_one(conn, task_id):
    with conn.cursor() as cur:
        row = fetch_task_row(cur, task_id)
    return {"ok": True, "task": row_to_task(row)}


def handle_create(conn, data):
    title = clean_text(data.get("title"), "title", 200, required=True)
    description = clean_text(
        data.get("description"), "description", 5000, required=False, default=""
    )
    status = clean_enum(data.get("status"), STATUSES, "status", default="To Do")
    priority = clean_enum(
        data.get("priority"), PRIORITIES, "priority", default="Medium"
    )

    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO tasks (title, description, status, priority)
            VALUES (%s, %s, %s, %s)
            RETURNING id, title, description, status, priority, created_at, updated_at
            """,
            (title, description, status, priority),
        )
        row = cur.fetchone()
    conn.commit()
    return {"ok": True, "task": row_to_task(row)}


def handle_update(conn, task_id, data):
    with conn.cursor() as cur:
        current = row_to_task(fetch_task_row(cur, task_id))

        title = current["title"]
        if data.get("title") is not None:
            title = clean_text(data.get("title"), "title", 200, required=True)

        description = current["description"]
        if data.get("description") is not None:
            description = clean_text(
                data.get("description"), "description", 5000,
                required=False, default="",
            )

        status = current["status"]
        if data.get("status") is not None and str(data.get("status")).strip():
            status = clean_enum(data.get("status"), STATUSES, "status")

        priority = current["priority"]
        if data.get("priority") is not None and str(data.get("priority")).strip():
            priority = clean_enum(data.get("priority"), PRIORITIES, "priority")

        cur.execute(
            """
            UPDATE tasks
            SET title = %s, description = %s, status = %s, priority = %s,
                updated_at = NOW()
            WHERE id = %s
            RETURNING id, title, description, status, priority, created_at, updated_at
            """,
            (title, description, status, priority, task_id),
        )
        row = cur.fetchone()
    conn.commit()
    return {"ok": True, "task": row_to_task(row)}


def handle_delete(conn, task_id):
    with conn.cursor() as cur:
        cur.execute("DELETE FROM tasks WHERE id = %s RETURNING id", (task_id,))
        row = cur.fetchone()
        if row is None:
            raise ApiError("Task not found", 404)
    conn.commit()
    return {"ok": True, "deleted": True, "id": task_id}


def main(args, ctx=None):
    if not ctx or not hasattr(ctx, "POSTGRESQL"):
        return {"ok": False, "error": "Database not configured", "code": 503}

    conn = ctx.POSTGRESQL
    method = request_method(args)
    data = request_data(args)
    route_id = request_route_id(args, data)

    try:
        if method == "GET":
            if route_id:
                return handle_get_one(conn, to_task_id(route_id))
            return handle_list(conn, data)

        if method == "POST":
            return handle_create(conn, data)

        if method in ("PUT", "PATCH"):
            if not route_id:
                raise ApiError("Task id is required", 400)
            return handle_update(conn, to_task_id(route_id), data)

        if method == "DELETE":
            if not route_id:
                raise ApiError("Task id is required", 400)
            return handle_delete(conn, to_task_id(route_id))

        raise ApiError(f"Method {method} is not allowed", 405)

    except ApiError as exc:
        try:
            conn.rollback()
        except Exception:
            pass
        return {"ok": False, "error": exc.message, "code": exc.code}

    except Exception as exc:
        try:
            conn.rollback()
        except Exception:
            pass
        return {"ok": False, "error": f"Internal error: {exc}", "code": 500}