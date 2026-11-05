"""Reading and saving student records (CSV) plus sample data."""
import pandas as pd

from .config import BASE_COLUMNS, CSV_FILE
from .validators import InvalidInputError

SAMPLE_ROWS = [
    [1, "Aarav Sen",   88, 92, 79, 85, 95, 100, 94],
    [2, "Diya Roy",    72, 65, 80, 70, 68, 100, 82],
    [3, "Kabir Das",   45, 52, 38, 60, 55, 100, 66],
    [4, "Meera Ghosh", 95, 98, 91, 89, 99, 100, 97],
    [5, "Rohan Paul",  58, 49, 62, 55, 47, 100, 71],
    [6, "Sneha Bose",  81, 77, 85, 90, 83, 100, 88],
    [7, "Tanmay Nag",  34, 41, 29, 48, 39, 100, 58],
    [8, "Isha Saha",   67, 74, 70, 62, 78, 100, 79],
]


def empty_frame():
    return pd.DataFrame(columns=BASE_COLUMNS)


def load_records(path=CSV_FILE):
    """Read records from CSV; return an empty DataFrame if file is missing/bad."""
    try:
        df = pd.read_csv(path)
        missing = [c for c in BASE_COLUMNS if c not in df.columns]
        if missing:
            raise InvalidInputError(f"CSV is missing columns: {missing}")
        return df[BASE_COLUMNS]
    except (FileNotFoundError, pd.errors.EmptyDataError):
        return empty_frame()
    except (InvalidInputError, pd.errors.ParserError) as err:
        print(f"  Could not read '{path}': {err}")
        return empty_frame()


def save_records(df, path=CSV_FILE):
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        df[BASE_COLUMNS].to_csv(path, index=False)
    except OSError as err:
        print(f"  Could not save file: {err}")


def load_sample_data(df, path=CSV_FILE):
    """Add the sample students (skipping roll numbers that already exist)."""
    new = pd.DataFrame(SAMPLE_ROWS, columns=BASE_COLUMNS)
    df = pd.concat([df, new[~new["Roll"].isin(df["Roll"])]], ignore_index=True)
    save_records(df, path)
    print("  Sample data loaded.")
    return df
