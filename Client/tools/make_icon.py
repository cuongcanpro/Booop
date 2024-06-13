import os
import sys

try:
    from PIL import Image
except ImportError:
    print("Install Pillow Module...")
    try:
        import pip
        pip.main(["install", "Pillow"])
        from PIL import Image
        print("Pillow Install Success!")
    except Exception as e:
        print("Install Pillow Error :", str(e))
        sys.exit(1)

try:
    original_image = Image.open("Icon.png")
except Exception as e:
    print("Error opening the original image:", str(e))
    sys.exit(1)

android_dir = "Android"
os.makedirs(android_dir, exist_ok=True)
android_sizes = [36, 48, 72, 96, 144, 192]
for size in android_sizes:
    resized_image = original_image.resize((size, size))
    new_filename = f"{size}.png"
    new_file_path = os.path.join(android_dir, new_filename)
    resized_image.save(new_file_path)
    print(f"Created {new_filename} for Android")

ios_dir = "iOS"
os.makedirs(ios_dir, exist_ok=True)
ios_sizes = [20, 29, 30, 40, 41, 42, 50, 57, 58, 59, 60, 72, 76, 80, 81, 87, 100, 114, 120, 121, 144, 152, 167, 180, 1024]
for size in ios_sizes:
    resized_image = original_image.resize((size, size))
    new_filename = f"{size}.png"
    new_file_path = os.path.join(ios_dir, new_filename)
    resized_image.save(new_file_path)
    print(f"Created {new_filename} for iOS")

print("Success !!")
