# Publishing Guide - DDL Viewer Extension

This guide will help you publish the DDL Viewer extension to the Visual Studio Code Marketplace.

## Prerequisites

### 1. Create a Publisher Account

1. Go to [Visual Studio Marketplace Publisher Management](https://marketplace.visualstudio.com/manage)
2. Sign in with your Microsoft account
3. Click **"Create publisher"**
4. Fill in the details:
   - **Publisher Name**: Choose a unique ID (lowercase, no spaces)
   - **Display Name**: Your name or company name
   - **Description**: Brief description of who you are

### 2. Get a Personal Access Token (PAT)

1. Go to [Azure DevOps](https://dev.azure.com/)
2. Click on **User Settings** (top right) → **Personal Access Tokens**
3. Click **"New Token"**
4. Configure:
   - **Name**: `vsce-publish-token`
   - **Organization**: All accessible organizations
   - **Expiration**: 90 days (or custom)
   - **Scopes**: Select **"Marketplace" → "Manage"**
5. Click **"Create"**
6. **IMPORTANT**: Copy the token immediately (you won't see it again!)

## Prepare the Extension

### 1. Update package.json

Replace placeholders in `package.json`:

```json
{
  "publisher": "your-publisher-id",  // From step 1
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_USERNAME/DDL_Viewer"
  }
}
```

### 2. Add Screenshots

1. Capture screenshots as described in `media/README.md`
2. Save them in the `media/` folder:
   - `demo.gif`
   - `table-relationships.png`
   - `view-lineage.png`
   - `cte-pipeline.png`

3. Copy the generated icon:
   - Copy the icon from artifacts to `media/icon.png`

### 3. Update README.md

Replace GitHub URLs with your actual repository:

```markdown
https://github.com/YOUR_USERNAME/DDL_Viewer
```

## Build and Package

### 1. Install VSCE (VS Code Extension Manager)

```powershell
npm install -g @vscode/vsce
```

### 2. Build the Extension

```powershell
# Clean build
npm run compile

# Or for production build
npm run package
```

### 3. Package the Extension

```powershell
vsce package
```

This creates a `.vsix` file (e.g., `ddl-viewer-0.0.1.vsix`)

### 4. Test the Package Locally

```powershell
# Install in VS Code
code --install-extension ddl-viewer-0.0.1.vsix
```

Test thoroughly:
- ✅ Extension activates
- ✅ Icon appears in Activity Bar
- ✅ SQL editor works
- ✅ Diagram generation works
- ✅ All features functional

## Publish to Marketplace

### Method 1: Using VSCE CLI (Recommended)

```powershell
# Login with your PAT
vsce login YOUR_PUBLISHER_ID

# Publish
vsce publish
```

### Method 2: Manual Upload

1. Go to [Marketplace Publisher Management](https://marketplace.visualstudio.com/manage)
2. Click your publisher name
3. Click **"New extension"** → **"Visual Studio Code"**
4. Upload the `.vsix` file
5. Fill in any additional details
6. Click **"Upload"**

## Post-Publishing

### 1. Verify the Listing

1. Go to `https://marketplace.visualstudio.com/items?itemName=YOUR_PUBLISHER_ID.ddl-viewer`
2. Check:
   - ✅ Title and description are correct
   - ✅ Screenshots display properly
   - ✅ README renders correctly
   - ✅ Install button works

### 2. Share Your Extension

- Tweet about it
- Post on Reddit (r/vscode, r/programming)
- Share on LinkedIn
- Add to your portfolio

### 3. Monitor Feedback

- Check reviews regularly
- Respond to issues on GitHub
- Update based on user feedback

## Updating the Extension

### 1. Update Version

In `package.json`:

```json
{
  "version": "0.0.2"  // Increment version
}
```

### 2. Update CHANGELOG.md

Document all changes in `CHANGELOG.md`

### 3. Rebuild and Republish

```powershell
npm run package
vsce publish
```

Or publish a specific version:

```powershell
vsce publish patch  # 0.0.1 → 0.0.2
vsce publish minor  # 0.0.1 → 0.1.0
vsce publish major  # 0.0.1 → 1.0.0
```

## Troubleshooting

### Common Issues

**Issue**: `vsce` command not found
```powershell
npm install -g @vscode/vsce
```

**Issue**: "Publisher not found"
- Verify publisher ID in package.json matches your marketplace publisher

**Issue**: "Missing README"
- Ensure README.md exists in root directory

**Issue**: "Icon not found"
- Check `icon` path in package.json
- Ensure `media/icon.png` exists

**Issue**: "Package too large"
- Check `.vscodeignore` is excluding `node_modules`, `src`, etc.
- Run `vsce ls` to see what's being packaged

### Validation

Before publishing, run:

```powershell
vsce ls  # List files that will be packaged
vsce package --no-dependencies  # Package without dependencies
```

## Best Practices

1. **Semantic Versioning**: Follow semver (MAJOR.MINOR.PATCH)
2. **Changelog**: Always update CHANGELOG.md
3. **Testing**: Test on Windows, Mac, and Linux if possible
4. **Screenshots**: Keep them up-to-date with latest features
5. **README**: Keep it concise but comprehensive
6. **Keywords**: Use relevant keywords for discoverability
7. **License**: Include a clear license (MIT recommended)

## Resources

- [VS Code Extension Publishing Docs](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Marketplace Publisher Portal](https://marketplace.visualstudio.com/manage)
- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
- [Extension Manifest Reference](https://code.visualstudio.com/api/references/extension-manifest)

---

**Good luck with your extension! 🚀**

If you encounter any issues, check the [VS Code Extension API docs](https://code.visualstudio.com/api) or ask on [Stack Overflow](https://stackoverflow.com/questions/tagged/vscode-extensions).
