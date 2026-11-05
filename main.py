"""Student Performance & Attendance Analyzer - run this file: python main.py"""
from analyzer.charts import charts_menu
from analyzer.config import CSV_FILE
from analyzer.features import (add_student, low_attendance, show_report,
                               sorted_by_marks, statistics)
from analyzer.storage import load_records, load_sample_data
from analyzer.validators import read_int

MENU = """
=========== STUDENT PERFORMANCE & ATTENDANCE ANALYZER ===========
 0. Launch Web Dashboard  5. Sort students by marks
 1. Add student           6. Statistics (Pandas)
 2. View all records      7. Charts (bar / line / histogram)
 3. Low-attendance list   8. Load sample data
 4. Reload from CSV       9. Exit
=================================================================="""


def launch_web_app():
    import threading
    import webbrowser
    import urllib.request
    from server import run_server

    url = "http://localhost:8080"
    is_running = False
    try:
        with urllib.request.urlopen(f"{url}/api/students", timeout=1):
            is_running = True
    except Exception:
        is_running = False

    if is_running:
        print(f"  Web dashboard is already running at {url}. Opening browser...")
        webbrowser.open(url)
    else:
        print(f"  Starting web server on {url} and opening browser...")
        server_thread = threading.Thread(target=run_server, kwargs={"port": 8080, "open_browser": True}, daemon=True)
        server_thread.start()
        print("  Web server running in background. You can keep using this menu or use the browser.")


def main():
    df = load_records()
    print(f"Loaded {len(df)} record(s) from '{CSV_FILE.name}'.")
    while True:
        print(MENU)
        try:
            choice = read_int("Enter choice: ", 0, 9)
            if choice == 0:
                launch_web_app()
            elif choice == 1:
                df = add_student(df)
            elif choice == 2:
                show_report(df)
            elif choice == 3:
                low_attendance(df)
            elif choice == 4:
                df = load_records()
                print(f"  Reloaded {len(df)} record(s).")
            elif choice == 5:
                sorted_by_marks(df)
            elif choice == 6:
                statistics(df)
            elif choice == 7:
                charts_menu(df)
            elif choice == 8:
                df = load_sample_data(df)
            else:
                print("Goodbye!")
                break
        except (KeyboardInterrupt, EOFError):
            print("\nExiting.")
            break
        except Exception as err:          # last-resort safety net
            print(f"  Unexpected error: {err}")


if __name__ == "__main__":
    main()
