import bcrypt

def hash_password():
    # Get password input from the user
    password = input("Enter the password to hash: ")

    # Generate a salt
    salt = bcrypt.gensalt()

    # Hash the password
    hashed_password = bcrypt.hashpw(password.encode(), salt)

    print("Hashed Password:", hashed_password.decode())

if __name__ == "__main__":
    hash_password()
