"""Matplotlib charts: bar, line, histogram (+ attendance chart)."""
import matplotlib.pyplot as plt

from .calculations import analyze
from .config import CHART_DIR, MAX_MARKS, SUBJECTS
from .validators import read_int


def _finish(fig, filename):
    CHART_DIR.mkdir(parents=True, exist_ok=True)
    path = CHART_DIR / filename
    fig.tight_layout()
    fig.savefig(path, dpi=120)
    print(f"  Chart saved to {path}")
    plt.show()
    plt.close(fig)


def bar_chart(df):
    """Total marks of each student."""
    data = analyze(df)
    fig, ax = plt.subplots(figsize=(9, 5))
    bars = ax.bar(data["Name"], data["Total"], color="steelblue")
    ax.bar_label(bars, fmt="%g")
    ax.set_title("Total Marks of Each Student")
    ax.set_xlabel("Student")
    ax.set_ylabel(f"Total marks (out of {MAX_MARKS * len(SUBJECTS)})")
    plt.setp(ax.get_xticklabels(), rotation=30, ha="right")
    _finish(fig, "bar_total_marks.png")


def line_graph(df):
    """Subject-wise marks of every student."""
    data = analyze(df)
    fig, ax = plt.subplots(figsize=(9, 5))
    for _, row in data.iterrows():
        ax.plot(SUBJECTS, row[SUBJECTS].astype(float), marker="o", label=row["Name"])
    ax.set_title("Subject-wise Performance")
    ax.set_xlabel("Subject")
    ax.set_ylabel("Marks")
    ax.set_ylim(0, MAX_MARKS)
    ax.grid(alpha=0.3)
    ax.legend(fontsize=8, ncol=2)
    _finish(fig, "line_subject_marks.png")


def histogram(df):
    """Distribution of percentages."""
    data = analyze(df)
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.hist(data["Percentage"], bins=range(0, 101, 10), color="seagreen", edgecolor="black")
    ax.set_title("Distribution of Student Percentages")
    ax.set_xlabel("Percentage")
    ax.set_ylabel("Number of students")
    ax.set_xticks(range(0, 101, 10))
    _finish(fig, "histogram_percentage.png")


def attendance_chart(df, threshold=75):
    """Attendance bars; students below the threshold are red."""
    data = analyze(df)
    colors = ["tomato" if a < threshold else "mediumseagreen" for a in data["Attendance%"]]
    fig, ax = plt.subplots(figsize=(9, 5))
    ax.bar(data["Name"], data["Attendance%"], color=colors)
    ax.axhline(threshold, color="black", linestyle="--", label=f"Threshold ({threshold}%)")
    ax.set_title("Attendance Percentage")
    ax.set_ylabel("Attendance %")
    ax.set_ylim(0, 100)
    ax.legend()
    plt.setp(ax.get_xticklabels(), rotation=30, ha="right")
    _finish(fig, "bar_attendance.png")


def charts_menu(df):
    if df.empty:
        print("\n  No records available.")
        return
    print("\n1. Bar chart (total marks)\n2. Line graph (subject-wise marks)"
          "\n3. Histogram (percentages)\n4. Attendance chart\n5. Back")
    choice = read_int("Choose: ", 1, 5)
    actions = {1: bar_chart, 2: line_graph, 3: histogram, 4: attendance_chart}
    if choice in actions:
        actions[choice](df)
