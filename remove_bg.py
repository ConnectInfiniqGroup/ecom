from PIL import Image
import os

def remove_background(image_path, output_path):
    img = Image.open(image_path)
    img = img.convert("RGBA")
    datas = img.getdata()
    
    new_data = []
    bg_color = datas[0]
    
    threshold = 20
    for item in datas:
        if abs(item[0] - bg_color[0]) < threshold and \
           abs(item[1] - bg_color[1]) < threshold and \
           abs(item[2] - bg_color[2]) < threshold:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(output_path, "PNG")

assets_logo = "src/Assets/Images/logo.png"
public_logo = "public/logo.png"

try:
    remove_background(assets_logo, assets_logo)
    print("Processed assets logo")
except Exception as e:
    print("Error on assets logo:", e)

try:
    remove_background(public_logo, public_logo)
    print("Processed public logo")
except Exception as e:
    print("Error on public logo:", e)
