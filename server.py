"""Lightweight HTTP and REST API server for the Student Performance & Attendance Web App."""
import json
import os
import sys
import webbrowser
from http import HTTPStatus
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import parse_qs, urlparse

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(PROJECT_ROOT))

import pandas as pd
from analyzer.calculations import analyze, calculate_grade
from analyzer.config import BASE_COLUMNS, CSV_FILE, MAX_MARKS, SUBJECTS
from analyzer.storage import SAMPLE_ROWS, load_records, save_records

WEB_DIR = PROJECT_ROOT / "web"


def get_analyzed_data():
    df = load_records()
    if df.empty:
        return {
            "students": [],
            "subjects": SUBJECTS,
            "maxMarks": MAX_MARKS,
            "summary": {
                "totalStudents": 0,
                "classAverage": 0,
                "averageAttendance": 0,
                "overallTopper": None,
                "gradeDistribution": {},
            },
            "subjectStats": {},
        }

    analyzed = analyze(df)
    students_list = analyzed.to_dict(orient="records")

    # Subject stats
    subject_stats = {}
    for sub in SUBJECTS:
        top_idx = analyzed[sub].idxmax()
        top_row = analyzed.loc[top_idx]
        subject_stats[sub] = {
            "mean": round(float(analyzed[sub].mean()), 2),
            "min": round(float(analyzed[sub].min()), 2),
            "max": round(float(analyzed[sub].max()), 2),
            "std": round(float(analyzed[sub].std(ddof=0)), 2) if len(analyzed) > 1 else 0.0,
            "topper": str(top_row["Name"]),
            "topperScore": float(top_row[sub]),
        }

    top_overall_idx = analyzed["Total"].idxmax()
    overall_top_row = analyzed.loc[top_overall_idx]

    summary = {
        "totalStudents": int(len(analyzed)),
        "classAverage": round(float(analyzed["Percentage"].mean()), 2),
        "averageAttendance": round(float(analyzed["Attendance%"].mean()), 2),
        "overallTopper": {
            "name": str(overall_top_row["Name"]),
            "total": float(overall_top_row["Total"]),
            "percentage": float(overall_top_row["Percentage"]),
            "grade": str(overall_top_row["Grade"]),
        },
        "gradeDistribution": analyzed["Grade"].value_counts().to_dict(),
    }

    return {
        "students": students_list,
        "subjects": SUBJECTS,
        "maxMarks": MAX_MARKS,
        "summary": summary,
        "subjectStats": subject_stats,
    }


class AppRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WEB_DIR), **kwargs)

    def log_message(self, format, *args):
        # Concise logging
        sys.stdout.write(f"[Server] {self.command} {self.path} - {args[1] if len(args) > 1 else ''}\n")
        sys.stdout.flush()

    def _send_json(self, data, status=HTTPStatus.OK):
        payload = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(payload)

    def do_OPTIONS(self):
        self.send_response(HTTPStatus.NO_CONTENT)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/students":
            try:
                data = get_analyzed_data()
                self._send_json(data)
            except Exception as e:
                self._send_json({"error": str(e)}, status=HTTPStatus.INTERNAL_SERVER_ERROR)
            return

        if path == "/api/export-csv":
            if CSV_FILE.exists():
                content = CSV_FILE.read_bytes()
            else:
                content = b""
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", "text/csv; charset=utf-8")
            self.send_header("Content-Disposition", 'attachment; filename="students.csv"')
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)
            return

        # Default static file serving from WEB_DIR
        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length) if length > 0 else b""

        if path == "/api/students":
            try:
                payload = json.loads(body.decode("utf-8"))
                roll = int(payload["Roll"])
                name = str(payload["Name"]).strip()
                if not name:
                    return self._send_json({"error": "Name cannot be empty"}, status=HTTPStatus.BAD_REQUEST)

                marks = [float(payload[s]) for s in SUBJECTS]
                held = int(payload["ClassesHeld"])
                attended = int(payload["ClassesAttended"])

                if held <= 0 or attended < 0 or attended > held:
                    return self._send_json({"error": "Invalid attendance numbers"}, status=HTTPStatus.BAD_REQUEST)

                for m in marks:
                    if m < 0 or m > MAX_MARKS:
                        return self._send_json({"error": f"Marks must be between 0 and {MAX_MARKS}"}, status=HTTPStatus.BAD_REQUEST)

                df = load_records()
                if roll in df["Roll"].values:
                    return self._send_json({"error": f"Roll {roll} already exists"}, status=HTTPStatus.CONFLICT)

                new_row = pd.DataFrame([[roll, name] + marks + [held, attended]], columns=BASE_COLUMNS)
                df = pd.concat([df, new_row], ignore_index=True) if not df.empty else new_row
                save_records(df)
                return self._send_json(get_analyzed_data())
            except Exception as e:
                return self._send_json({"error": str(e)}, status=HTTPStatus.BAD_REQUEST)

        if path == "/api/reset-sample":
            try:
                df = pd.DataFrame(SAMPLE_ROWS, columns=BASE_COLUMNS)
                save_records(df)
                return self._send_json(get_analyzed_data())
            except Exception as e:
                return self._send_json({"error": str(e)}, status=HTTPStatus.INTERNAL_SERVER_ERROR)

        if path == "/api/import-csv":
            try:
                csv_text = body.decode("utf-8")
                import io
                df = pd.read_csv(io.StringIO(csv_text))
                missing = [c for c in BASE_COLUMNS if c not in df.columns]
                if missing:
                    return self._send_json({"error": f"Missing columns in CSV: {missing}"}, status=HTTPStatus.BAD_REQUEST)
                save_records(df[BASE_COLUMNS])
                return self._send_json(get_analyzed_data())
            except Exception as e:
                return self._send_json({"error": str(e)}, status=HTTPStatus.BAD_REQUEST)

        self._send_json({"error": "Endpoint not found"}, status=HTTPStatus.NOT_FOUND)

    def do_PUT(self):
        parsed = urlparse(self.path)
        path = parsed.path
        if path.startswith("/api/students/"):
            try:
                target_roll = int(path.split("/")[-1])
                length = int(self.headers.get("Content-Length", 0))
                payload = json.loads(self.rfile.read(length).decode("utf-8"))

                name = str(payload["Name"]).strip()
                marks = [float(payload[s]) for s in SUBJECTS]
                held = int(payload["ClassesHeld"])
                attended = int(payload["ClassesAttended"])

                df = load_records()
                if target_roll not in df["Roll"].values:
                    return self._send_json({"error": f"Roll {target_roll} not found"}, status=HTTPStatus.NOT_FOUND)

                idx = df[df["Roll"] == target_roll].index[0]
                df.at[idx, "Name"] = name
                for s in SUBJECTS:
                    df.at[idx, s] = float(payload[s])
                df.at[idx, "ClassesHeld"] = held
                df.at[idx, "ClassesAttended"] = attended

                save_records(df)
                return self._send_json(get_analyzed_data())
            except Exception as e:
                return self._send_json({"error": str(e)}, status=HTTPStatus.BAD_REQUEST)

        self._send_json({"error": "Endpoint not found"}, status=HTTPStatus.NOT_FOUND)

    def do_DELETE(self):
        parsed = urlparse(self.path)
        path = parsed.path
        if path.startswith("/api/students/"):
            try:
                target_roll = int(path.split("/")[-1])
                df = load_records()
                if target_roll not in df["Roll"].values:
                    return self._send_json({"error": f"Roll {target_roll} not found"}, status=HTTPStatus.NOT_FOUND)

                df = df[df["Roll"] != target_roll]
                save_records(df)
                return self._send_json(get_analyzed_data())
            except Exception as e:
                return self._send_json({"error": str(e)}, status=HTTPStatus.BAD_REQUEST)

        self._send_json({"error": "Endpoint not found"}, status=HTTPStatus.NOT_FOUND)


def run_server(port=8080, open_browser=False):
    for attempt in range(5):
        try:
            server_address = ("", port + attempt)
            httpd = HTTPServer(server_address, AppRequestHandler)
            actual_port = port + attempt
            url = f"http://localhost:{actual_port}"
            print(f"🚀 Web dashboard server active at: {url}")
            print(f"   Directory: {WEB_DIR}")
            print("   Press Ctrl+C to stop.")
            if open_browser:
                webbrowser.open(url)
            httpd.serve_forever()
            break
        except OSError as e:
            if "Address already in use" in str(e):
                continue
            raise


if __name__ == "__main__":
    port_arg = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else 8080
    run_server(port=port_arg, open_browser="--open" in sys.argv)
