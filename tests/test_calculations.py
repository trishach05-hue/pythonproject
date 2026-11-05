"""Run from the project folder:  python -m unittest discover tests"""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pandas as pd
from analyzer.calculations import analyze, calculate_grade
from analyzer.config import BASE_COLUMNS


class TestCalculations(unittest.TestCase):
    def test_grade_boundaries(self):
        cases = {95: "A+", 90: "A+", 85: "A", 75: "B", 65: "C", 55: "D", 45: "E", 39.9: "F"}
        for pct, grade in cases.items():
            self.assertEqual(calculate_grade(pct), grade)

    def test_analyze(self):
        df = pd.DataFrame([[1, "Test", 80, 90, 70, 60, 100, 50, 40]], columns=BASE_COLUMNS)
        r = analyze(df).iloc[0]
        self.assertEqual(r["Total"], 400)
        self.assertEqual(r["Average"], 80)
        self.assertEqual(r["Percentage"], 80)
        self.assertEqual(r["Grade"], "A")
        self.assertEqual(r["Attendance%"], 80)


if __name__ == "__main__":
    unittest.main()
