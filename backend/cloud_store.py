from datetime import datetime

from .config import settings
from . import store


def cloud_enabled():
    return (
        settings.database_mode == "supabase"
        and bool(settings.supabase_url and settings.supabase_service_key)
    )


def client():
    from supabase import create_client

    return create_client(
        settings.supabase_url,
        settings.supabase_service_key,
    )


def _clean(v):
    if isinstance(v, datetime):
        return v.isoformat()

    if isinstance(v, dict):
        return {
            k: _clean(x)
            for k, x in v.items()
            if k not in {"url", "password_hash"}
        }

    return v


def load_cloud():
    if not cloud_enabled():
        return

    c = client()

    tables = [
        ("users", store.USERS, "user_id"),
        ("skills", store.SKILLS, "skill_id"),
        ("goals", store.GOALS, "goal_id"),
        ("milestones", store.MILESTONES, "milestone_id"),
        ("practice_sessions", store.PRACTICE, "session_id"),
        ("posts", store.POSTS, "post_id"),
        ("comments", store.COMMENTS, "comment_id"),
        ("files", store.FILES, "file_id"),
    ]

    for table, target, key_field in tables:
        try:
            rows = c.table(table).select("*").execute().data or []

            for row in rows:
                key = row.get(key_field)

                if key:
                    target[str(key)] = row

        except Exception as e:
            print(f"Cloud load warning for {table}: {e}")

    store.LIKES.clear()
    store.FOLLOWS.clear()

    try:
        likes = c.table("likes").select("*").execute().data or []

        for row in likes:
            store.LIKES.add(
                (
                    str(row["post_id"]),
                    str(row["user_id"]),
                )
            )

        follows = c.table("follows").select("*").execute().data or []

        for row in follows:
            store.FOLLOWS.add(
                (
                    str(row["follower_id"]),
                    str(row["following_id"]),
                )
            )

    except Exception as e:
        print(f"Cloud social-load warning: {e}")


def _rows_for_user(uid):
    return {
        "users": [
            store.USERS[uid]
        ]
        if uid in store.USERS
        else [],

        "skills": [
            x
            for x in store.SKILLS.values()
            if str(x.get("user_id")) == uid
        ],

        "goals": [
            x
            for x in store.GOALS.values()
            if str(x.get("user_id")) == uid
        ],

        "posts": [
            x
            for x in store.POSTS.values()
            if str(x.get("user_id")) == uid
        ],

        "practice_sessions": [
            x
            for x in store.PRACTICE.values()
            if str(x.get("user_id")) == uid
        ],

        "comments": [
            x
            for x in store.COMMENTS.values()
            if str(x.get("user_id")) == uid
        ],

        "files": [
            x
            for x in store.FILES.values()
            if str(x.get("user_id")) == uid
        ],

        "milestones": [
            x
            for x in store.MILESTONES.values()
            if any(
                str(g.get("goal_id")) == str(x.get("goal_id"))
                and str(g.get("user_id")) == uid
                for g in store.GOALS.values()
            )
        ],
    }


def sync_user(uid):
    if not cloud_enabled():
        return

    c = client()
    rows = _rows_for_user(uid)

    # Upsert application-owned rows.
    # PostgreSQL/Supabase remains the cloud source of truth.
    for table, data in rows.items():

        if not data:
            continue

        payload = []

        for row in data:
            cleaned = {
                k: _clean(v)
                for k, v in row.items()
                if k not in {"url", "password_hash"}
                or table == "users"
            }

            if table == "users":
                cleaned["password_hash"] = row["password_hash"]

            payload.append(cleaned)

        try:
            c.table(table).upsert(payload).execute()

        except Exception as e:
            print(f"Cloud sync warning for {table}: {e}")

    try:
        # Synchronize likes belonging to this user.
        for post_id, user_id in list(store.LIKES):

            if user_id == uid:
                c.table("likes").upsert(
                    {
                        "post_id": post_id,
                        "user_id": user_id,
                    },
                    on_conflict="post_id,user_id",
                ).execute()

        # Synchronize follows created by this user.
        for follower, following in list(store.FOLLOWS):

            if follower == uid:
                c.table("follows").upsert(
                    {
                        "follower_id": follower,
                        "following_id": following,
                    },
                    on_conflict="follower_id,following_id",
                ).execute()

    except Exception as e:
        print(f"Cloud relationship sync warning: {e}")


def sync_delete(uid):
    """
    Delete all cloud data owned by a user.

    Supabase schema uses ON DELETE CASCADE for user-owned
    records, so deleting the user record also removes
    related skills, goals, practice sessions, posts,
    comments, likes, follows, and files.
    """

    if not cloud_enabled():
        return

    c = client()

    try:
        # The database schema defines user_id foreign keys
        # with ON DELETE CASCADE.
        c.table("users").delete().eq("user_id", uid).execute()

    except Exception as e:
        print(f"Cloud delete warning for user {uid}: {e}")