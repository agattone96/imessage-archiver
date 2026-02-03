from PIL import Image, ImageDraw
import os

def process_icon(input_path, output_path):
    # Open and ensure RGBA
    img = Image.open(input_path).convert("RGBA")
    w, h = img.size
    
    # Standard macOS icon is 1024x1024
    # The squircle content should be roughly 824px wide within that 1024px frame
    TARGET_CANVAS = 1024
    TARGET_CONTENT = 824
    
    # 1. Remove black background
    # We'll treat very dark pixels as transparent
    datas = img.getdata()
    new_data = []
    for item in datas:
        # If the pixel is very dark (r,g,b < 20), make it transparent
        if item[0] < 20 and item[1] < 20 and item[2] < 20:
            new_data.append((0, 0, 0, 0))
        else:
            new_data.append(item)
    img.putdata(new_data)
    
    # 2. Crop to the content
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    
    # 3. Resize content to fit target size (824x824)
    # Maintain aspect ratio
    cw, ch = img.size
    aspect = cw / ch
    if aspect > 1:
        nw = TARGET_CONTENT
        nh = int(TARGET_CONTENT / aspect)
    else:
        nh = TARGET_CONTENT
        nw = int(TARGET_CONTENT * aspect)
    
    img = img.resize((nw, nh), Image.Resampling.LANCZOS)
    
    # 4. Create 1024x1024 transparent canvas
    final_img = Image.new("RGBA", (TARGET_CANVAS, TARGET_CANVAS), (0, 0, 0, 0))
    
    # 5. Paste content into center
    offset = ((TARGET_CANVAS - nw) // 2, (TARGET_CANVAS - nh) // 2)
    final_img.paste(img, offset, img)
    
    # Save as PNG
    final_img.save(output_path, "PNG")
    print(f"Optimized macOS icon saved to {output_path}")

if __name__ == "__main__":
    # Ensure we use the latest uploaded icon
    # Note: The cp command in the previous step already moved it to app_icon.png
    if os.path.exists("app_icon.png"):
        process_icon("app_icon.png", "app_icon.png")
