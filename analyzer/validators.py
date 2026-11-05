"""Safe user-input helpers. Invalid input is handled with exceptions."""


class InvalidInputError(Exception):
    """Raised when the user enters data that is not acceptable."""


def read_int(prompt, low=None, high=None):
    """Keep asking until a valid integer within [low, high] is entered."""
    while True:
        try:
            value = int(input(prompt).strip())
            if (low is not None and value < low) or (high is not None and value > high):
                raise InvalidInputError(f"Value must be between {low} and {high}.")
            return value
        except ValueError:
            print("  Invalid input: please enter a whole number.")
        except InvalidInputError as err:
            print(f"  Invalid input: {err}")


def read_float(prompt, low=None, high=None):
    """Keep asking until a valid number within [low, high] is entered."""
    while True:
        try:
            value = float(input(prompt).strip())
            if (low is not None and value < low) or (high is not None and value > high):
                raise InvalidInputError(f"Value must be between {low} and {high}.")
            return value
        except ValueError:
            print("  Invalid input: please enter a number.")
        except InvalidInputError as err:
            print(f"  Invalid input: {err}")


def read_name(prompt):
    """Keep asking until the name has only letters and spaces."""
    while True:
        name = input(prompt).strip()
        try:
            if not name or not name.replace(" ", "").isalpha():
                raise InvalidInputError("Name must contain only letters and spaces.")
            return name.title()
        except InvalidInputError as err:
            print(f"  Invalid input: {err}")
