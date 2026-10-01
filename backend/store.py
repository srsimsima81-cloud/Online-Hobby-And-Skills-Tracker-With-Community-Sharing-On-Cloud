from .security import hash_password

USERS = {}
SKILLS = {}
GOALS = {}
MILESTONES = {}
PRACTICE = {}
POSTS = {}
COMMENTS = {}
LIKES = set()
FOLLOWS = set()
FILES = {}


def seed():
    """
    Kept for backend compatibility.
    No demo data is automatically created.
    """
    return


def reset():
    USERS.clear()
    SKILLS.clear()
    GOALS.clear()
    MILESTONES.clear()
    PRACTICE.clear()
    POSTS.clear()
    COMMENTS.clear()
    FILES.clear()
    LIKES.clear()
    FOLLOWS.clear()