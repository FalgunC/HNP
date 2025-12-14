# Hotel Images Directory

Place hotel room images in this directory.

## Image Naming Convention

- `ordinary-basic.jpg` - Ordinary / Basic Room
- `budget-economy.jpg` - Budget / Economy Room  
- `standard.jpg` - Standard Room

## Image Requirements

- Format: JPG or PNG
- Recommended size: 1200x800 pixels
- Max file size: 2MB per image
- Optimize images for web before uploading

## How to Add Images

1. Take photos of each room type
2. Rename them according to the naming convention above
3. Upload them to this directory (`backend/public/images/`)
4. The images will be accessible at: `https://hnp.onrender.com/images/filename.jpg`

## Alternative: Use External URLs

You can also use external image URLs by updating the room data in the database. The images array in the Room model accepts full URLs.

