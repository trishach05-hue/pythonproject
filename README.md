# Student Performance & Attendance Analyzer

A Python project to store and analyse student marks and attendance, with grade
calculation, low-attendance detection, Pandas statistics and Matplotlib charts.

## Features
- **Modern Interactive Web App (Browser)**:
  - Real-time KPI summary cards (Total students, Pass rate, Class average, Attendance rate, Overall topper)
  - Interactive Chart.js analytics (Student rankings, Subject mastery, Attendance vs. Marks, Grade breakdown, Score curve)
  - Real-time attendance threshold slider simulator (instant alert updates)
  - Search, multi-column sorting, and grade/attendance filtering
  - Printable/downloadable official Academic Progress Report Card
  - Add/Edit student modal with live calculated projection (Total, %, Grade, Attendance)
  - Direct synchronization with `data/students.csv` plus CSV import/export
- **Command-Line Interface (CLI)**:
  - Enter student details and marks for 5 subjects
  - Total, average, percentage and grade calculation
  - Low-attendance detection (custom threshold)
  - Sort students by total marks
  - Pandas analysis (subject stats, toppers, grade distribution)
  - Matplotlib bar chart, line graph, histogram (+ attendance chart)
  - Invalid input handled with exceptions

## Project structure
```
student_performance_analyzer/
├── main.py                 # entry point (CLI menu + Web App launcher)
├── server.py               # HTTP static server + REST API for Web App
├── requirements.txt
├── README.md
├── web/                    # Browser Web Application
│   ├── index.html          # Semantic responsive dashboard UI
│   ├── styles.css          # Glassmorphic dark/light design system
│   ├── app.js              # Reactive app controller & Chart.js logic
│   └── chart.umd.min.js    # Offline-ready Chart.js bundle
├── analyzer/
│   ├── config.py           # subjects, max marks, file paths
│   ├── validators.py       # safe input + InvalidInputError
│   ├── calculations.py     # grade, total, average, percentage
│   ├── storage.py          # CSV read/save + sample data
│   ├── features.py         # add, report, low attendance, sort, statistics
│   └── charts.py           # bar, line, histogram, attendance charts
├── data/students.csv       # student records
├── charts/                 # generated PNG charts
└── tests/test_calculations.py
```

## How to run the Web App
You can run the web dashboard in any of the following ways:

### Method 1: Run the dedicated server
```bash
python3 server.py --open
```
This automatically starts the server and opens `http://localhost:8080` in your browser.

### Method 2: Launch from CLI Menu
```bash
python3 main.py
```
Select option `0` ("Launch Web Dashboard").

### Method 3: Standalone offline mode
Simply open [index.html](file:///Users/shibammitra/Downloads/student_performance_analyzer/web/index.html) in your browser:
```bash
open web/index.html
```

## How to run CLI & Tests
```bash
python3 main.py
python3 -m unittest discover tests
```

## Customising
Edit `analyzer/config.py` to change subjects or maximum marks per subject.

