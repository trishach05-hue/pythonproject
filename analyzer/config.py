"""Project-wide settings. Edit here to change subjects, max marks or file paths."""
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
CHART_DIR = BASE_DIR / "charts"
CSV_FILE = DATA_DIR / "students.csv"

SUBJECTS = ["Maths", "Science", "English", "History", "Computer"]
MAX_MARKS = 100                      # maximum marks per subject
BASE_COLUMNS = ["Roll", "Name"] + SUBJECTS + ["ClassesHeld", "ClassesAttended"]
