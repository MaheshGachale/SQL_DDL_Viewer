# Pre-Release Checklist

Use this checklist before publishing your extension to ensure everything is ready.

## 📋 Code & Build

- [ ] All features working correctly
- [ ] No console errors or warnings
- [ ] TypeScript compiles without errors
- [ ] Webpack builds successfully
- [ ] Extension activates properly in debug mode
- [ ] All commands execute correctly

## 📝 Documentation

- [ ] README.md is complete and accurate
- [ ] CHANGELOG.md documents all features
- [ ] LICENSE file is present
- [ ] All placeholder text replaced
- [ ] Links are working (test on GitHub after push)

## 🎨 Assets

- [ ] Icon created and saved as `media/icon.png` (128x128 PNG)
- [ ] Demo GIF captured and saved as `media/demo.gif`
- [ ] Screenshot 1: `media/table-relationships.png`
- [ ] Screenshot 2: `media/view-lineage.png`
- [ ] Screenshot 3: `media/cte-pipeline.png`
- [ ] All images optimized (not too large)

## ⚙️ Configuration

- [ ] `package.json` publisher name updated
- [ ] `package.json` author info updated
- [ ] `package.json` repository URL updated
- [ ] `package.json` keywords are relevant
- [ ] `package.json` version is correct (0.0.1)
- [ ] Icon path in `package.json` is correct

## 🔧 Git & GitHub

- [ ] Git repository initialized
- [ ] GitHub repository created
- [ ] All files committed
- [ ] Pushed to GitHub
- [ ] Images display correctly on GitHub
- [ ] README renders correctly on GitHub

## 🧪 Testing

- [ ] Tested with simple CREATE TABLE
- [ ] Tested with foreign keys
- [ ] Tested with CREATE VIEW
- [ ] Tested with CTEs
- [ ] Tested with complex nested CTEs
- [ ] Tested with calculated columns
- [ ] Tested diagram interactions (zoom, pan)
- [ ] Tested on clean VS Code install

## 📦 Packaging

- [ ] `@vscode/vsce` installed globally
- [ ] `.vscodeignore` configured correctly
- [ ] Run `vsce ls` to verify package contents
- [ ] Run `vsce package` successfully
- [ ] `.vsix` file created
- [ ] Tested `.vsix` installation locally

## 🚀 Publishing

- [ ] Publisher account created on marketplace
- [ ] Personal Access Token (PAT) obtained
- [ ] Logged in with `vsce login`
- [ ] Ready to run `vsce publish`

## ✅ Final Checks

- [ ] Extension name is unique (search marketplace)
- [ ] All features documented in README
- [ ] No sensitive data in code (API keys, passwords)
- [ ] No TODO comments left in production code
- [ ] Version number follows semver
- [ ] All dependencies are necessary
- [ ] License is appropriate (MIT recommended)

## 📊 Quality Metrics

- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Bundle size is reasonable (< 10MB)
- [ ] Extension loads in < 1 second
- [ ] Diagrams render in < 2 seconds

## 🎯 Post-Publishing

- [ ] Verify marketplace listing
- [ ] Test installation from marketplace
- [ ] Share on social media
- [ ] Monitor for issues/feedback
- [ ] Plan next version features

---

## Quick Test Commands

```powershell
# Build
npm run compile

# Package
vsce package

# List package contents
vsce ls

# Install locally
code --install-extension ddl-viewer-0.0.1.vsix

# Publish
vsce publish
```

## If Something Goes Wrong

### Build Fails
```powershell
# Clean and rebuild
Remove-Item -Recurse -Force dist, node_modules
npm install
npm run compile
```

### Package Too Large
```powershell
# Check what's included
vsce ls

# Update .vscodeignore
# Add large files/folders to exclude
```

### Images Not Showing
- Verify image paths in README.md
- Check images are pushed to GitHub
- Use raw.githubusercontent.com URLs
- Ensure images are in `media/` folder

---

**Ready to publish? Follow PUBLISHING.md for detailed steps!**
