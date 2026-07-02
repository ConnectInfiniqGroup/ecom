from PIL import Image

def crop_transparent(image_path, output_path):
    img = Image.open(image_path).convert("RGBA")
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        # Add a small 15px padding so it doesn't touch the absolute edges
        padding = 15
        width, height = img.size
        new_img = Image.new("RGBA", (width + padding*2, height + padding*2), (255, 255, 255, 0))
        new_img.paste(img, (padding, padding))
        new_img.save(output_path, "PNG")
        print("Cropped", image_path)
    else:
        print("No bounding box found.")

try:
    crop_transparent("src/Assets/Images/logo.png", "src/Assets/Images/logo.png")
    crop_transparent("public/logo.png", "public/logo.png")
except Exception as e:
    print(e)
