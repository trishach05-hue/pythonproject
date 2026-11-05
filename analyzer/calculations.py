"""Grade, total, average, percentage and attendance calculations."""
import pandas as pd

from .config import SUBJECTS, MAX_MARKS

NUMERIC_COLS = SUBJECTS + ["ClassesHeld", "ClassesAttended"]


def calculate_grade(percentage):
    """Grade calculation using if-elif-else."""
    if percentage >= 90:
        return "A+"
    elif percentage >= 80:
        return "A"
    elif percentage >= 70:
        return "B"
    elif percentage >= 60:
        return "C"
    elif percentage >= 50:
        return "D"
    elif percentage >= 40:
        return "E"
    else:
        return "F"


def analyze(df):
    """Return a copy of df with Total, Average, Percentage, Grade, Attendance%."""
    result = df.copy()
    result[NUMERIC_COLS] = result[NUMERIC_COLS].apply(pd.to_numeric)
    result["Total"] = result[SUBJECTS].sum(axis=1)
    result["Average"] = result[SUBJECTS].mean(axis=1).round(2)
    result["Percentage"] = (result["Total"] / (MAX_MARKS * len(SUBJECTS)) * 100).round(2)
    result["Grade"] = result["Percentage"].apply(calculate_grade)
    result["Attendance%"] = (result["ClassesAttended"] / result["ClassesHeld"] * 100).round(2)
    return result
