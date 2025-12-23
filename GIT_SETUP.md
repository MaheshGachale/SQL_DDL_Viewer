# Git Repository Setup Guide

Quick guide to initialize and push your DDL Viewer extension to GitHub.

## Step 1: Initialize Git Repository

```powershell
# Navigate to your project directory
cd "C:\Users\Mahesh Gachale\OneDrive\Desktop\Extension\DDL_Viewer"

# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: DDL Viewer extension v0.0.1"
```

## Step 2: Create GitHub Repository

1. Go to [GitHub](https://github.com/)
2. Click the **"+"** icon (top right) → **"New repository"**
3. Fill in details:
   - **Repository name**: `DDL_Viewer`
   - **Description**: `Transform SQL DDL into beautiful interactive diagrams. VS Code extension for visualizing database schemas.`
   - **Visibility**: Public (recommended for marketplace)
   - **Initialize**: Leave unchecked (we already have files)
4. Click **"Create repository"**

## Step 3: Connect and Push

```powershell
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/DDL_Viewer.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 4: Add Screenshots

After pushing the initial code:

1. **Capture screenshots** (see `media/README.md` for guide)
2. **Save to `media/` folder**:
   - `demo.gif`
   - `table-relationships.png`
   - `view-lineage.png`
   - `cte-pipeline.png`
   - `icon.png`

3. **Commit and push**:

```powershell
git add media/
git commit -m "Add screenshots and demo GIF"
git push
```

## Step 5: Verify Images

1. Go to your GitHub repository
2. Navigate to `media/` folder
3. Click on each image to verify it displays correctly
4. Copy the raw URLs for use in README.md

Example URL format:
```
https://raw.githubusercontent.com/YOUR_USERNAME/DDL_Viewer/main/media/demo.gif
```

## Step 6: Update README with Actual URLs

1. Open `README.md`
2. Replace placeholder URLs:

```markdown
# Before
![DDL Viewer Demo](https://raw.githubusercontent.com/YOUR_USERNAME/DDL_Viewer/main/images/demo.gif)

# After (with your actual username)
![DDL Viewer Demo](https://raw.githubusercontent.com/maheshgachale/DDL_Viewer/main/media/demo.gif)
```

3. Commit and push:

```powershell
git add README.md
git commit -m "Update README with actual image URLs"
git push
```

## Common Git Commands

```powershell
# Check status
git status

# View changes
git diff

# Add specific files
git add path/to/file

# Commit with message
git commit -m "Your message here"

# Push changes
git push

# Pull latest changes
git pull

# View commit history
git log --oneline

# Create a new branch
git checkout -b feature-name

# Switch branches
git checkout main
```

## .gitignore Already Configured

The `.gitignore` file is already set up to exclude:
- `node_modules/`
- `dist/`
- `*.vsix`
- `.env` files
- IDE settings (except essential .vscode files)

## Best Practices

1. **Commit Often**: Make small, focused commits
2. **Clear Messages**: Write descriptive commit messages
3. **Branch for Features**: Use branches for new features
4. **Pull Before Push**: Always pull latest changes before pushing
5. **Review Changes**: Use `git diff` before committing

## Troubleshooting

**Issue**: "Permission denied"
```powershell
# Use HTTPS instead of SSH
git remote set-url origin https://github.com/YOUR_USERNAME/DDL_Viewer.git
```

**Issue**: "Large files"
```powershell
# Check what's being committed
git status

# Remove large files from staging
git reset path/to/large/file
```

**Issue**: "Merge conflicts"
```powershell
# Pull with rebase
git pull --rebase origin main

# Or reset to remote
git fetch origin
git reset --hard origin/main
```

---

**Next**: After pushing to GitHub, follow `PUBLISHING.md` to publish to VS Code Marketplace!
