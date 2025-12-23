# Images Folder Structure

This folder contains all images used in the README.md and marketplace listing.

## ✅ Current Images

### 1. Extension Icon
- **File**: `SQL_DDL_VIEWER.png`
- **Size**: 128x128 pixels (or larger)
- **Format**: PNG
- **Description**: Extension icon shown in VS Code marketplace and Activity Bar
- **Status**: ✅ Added

### 2. Overview Screenshot
- **File**: `Overview.png`
- **Description**: Complete DDL Viewer interface showing SQL editor and diagram
- **Status**: ✅ Added

### 3. CTE Views Screenshot
- **File**: `CTE_Views.png`
- **Description**: Complex CTE pipeline visualization with color-coded lineage
- **Status**: ✅ Added

## 📝 Optional: Demo Video

If you want to add a demo video:
- Upload to Google Drive or YouTube
- Update `DEMO_VIDEO_LINK_HERE` in README.md with the actual link

#### table-relationships.png
- **Recommended Size**: 1200x800 pixels
- **Description**: Shows basic table relationships with foreign keys
- **Example SQL**: Simple 2-3 table schema with FK relationships

#### view-lineage.png
- **Recommended Size**: 1200x800 pixels  
- **Description**: Demonstrates column-level lineage in a view
- **Should Show**:
  - Green lines for direct mappings
  - Orange dashed lines for calculations
  - Column handles visible

#### cte-pipeline.png
- **Recommended Size**: 1200x800 pixels
- **Description**: Complex CTE pipeline visualization
- **Should Show**:
  - Multiple CTE nodes (purple dashed borders)
  - Color-coded flow (blue → purple → green)
  - Final view node

## How to Capture Screenshots

1. **Open DDL Viewer** in VS Code
2. **Use a clean theme** (Dark+ recommended for consistency)
3. **Zoom to fit** the entire diagram in view
4. **Use Windows Snipping Tool** or similar:
   - Press `Win + Shift + S`
   - Select area
   - Save as PNG

5. **For GIF recording**:
   - Use **ScreenToGif** (free tool)
   - Record at 15-20 FPS
   - Keep file size under 5MB

## Tips for Great Screenshots

- ✅ Use realistic, meaningful SQL examples
- ✅ Show the full interface (SQL editor + diagram)
- ✅ Ensure text is readable (don't zoom out too much)
- ✅ Use consistent VS Code theme across all images
- ✅ Highlight key features with arrows/annotations if needed
- ✅ Keep backgrounds clean (close unnecessary VS Code panels)

## After Adding Images

1. Copy all images to this `media/` folder
2. Update README.md image URLs:
   ```markdown
   ![Description](https://raw.githubusercontent.com/YOUR_USERNAME/DDL_Viewer/main/media/image-name.png)
   ```
3. Commit and push to GitHub
4. Verify images display correctly on GitHub
5. Package extension with images included
