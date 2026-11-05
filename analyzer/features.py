"""Menu features: add student, reports, low attendance, sorting, statistics."""
import pandas as pd

from .calculations import analyze
from .config import BASE_COLUMNS, MAX_MARKS, SUBJECTS
from .storage import save_records
from .validators import read_float, read_int, read_name


def add_student(df):
    print("\n--- Enter Student Details ---")
    roll = read_int("Roll number: ", low=1)
    if roll in df["Roll"].values:
        print("  A student with this roll number already exists.")
        return df
    name = read_name("Name: ")
    marks = [read_float(f"Marks in {s} (0-{MAX_MARKS}): ", 0, MAX_MARKS) for s in SUBJECTS]
    held = read_int("Total classes held: ", low=1)
    attended = read_int(f"Classes attended (0-{held}): ", low=0, high=held)

    row = pd.DataFrame([[roll, name] + marks + [held, attended]], columns=BASE_COLUMNS)
    df = pd.concat([df, row], ignore_index=True) if not df.empty else row
    save_records(df)
    print(f"  Saved {name}.")
    return df


def show_report(df):
    if df.empty:
        print("\n  No records to show.")
        return
    cols = ["Roll", "Name"] + SUBJECTS + ["Total", "Average", "Percentage", "Grade", "Attendance%"]
    print("\n=== STUDENT REPORT ===")
    print(analyze(df)[cols].to_string(index=False))


def low_attendance(df):
    if df.empty:
        print("\n  No records available.")
        return
    threshold = read_float("Attendance threshold % (e.g. 75): ", 0, 100)
    data = analyze(df)
    low = data[data["Attendance%"] < threshold]
    if low.empty:
        print(f"\n  All students have attendance of {threshold}% or more.")
    else:
        print(f"\n=== Students below {threshold}% attendance ===")
        print(low[["Roll", "Name", "ClassesHeld", "ClassesAttended", "Attendance%"]].to_string(index=False))


def sorted_by_marks(df):
    if df.empty:
        print("\n  No records available.")
        return
    order = input("Sort order - (d)escending / (a)scending [d]: ").strip().lower()
    ascending = order.startswith("a")
    data = analyze(df).sort_values("Total", ascending=ascending).reset_index(drop=True)
    data.index += 1
    print("\n=== Students sorted by total marks ===")
    print(data[["Roll", "Name", "Total", "Percentage", "Grade"]].to_string())


def statistics(df):
    """Pandas-based analysis."""
    if df.empty:
        print("\n  No records available.")
        return
    data = analyze(df)
    print("\n=== Subject-wise statistics ===")
    print(data[SUBJECTS].agg(["mean", "min", "max", "std"]).round(2).to_string())
    print("\nSubject toppers:")
    for s in SUBJECTS:
        top = data.loc[data[s].idxmax()]
        print(f"  {s:<9}: {top['Name']} ({top[s]:g})")
    print("\nGrade distribution:")
    print(data["Grade"].value_counts().sort_index().to_string())
    print(f"\nClass average percentage : {data['Percentage'].mean():.2f}%")
    print(f"Class average attendance : {data['Attendance%'].mean():.2f}%")
    print(f"Overall topper           : {data.loc[data['Total'].idxmax(), 'Name']}")
