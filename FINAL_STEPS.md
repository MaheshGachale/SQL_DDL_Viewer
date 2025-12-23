# Final Steps Before Publishing

## ✅ Completed

- [x] README.md updated with actual images
- [x] package.json icon path updated to `media/SQL_DDL_VIEWER.png`
- [x] Screenshots integrated:
  - `media/Overview.png`
  - `media/CTE_Views.png`
  - `media/SQL_DDL_VIEWER.png` (icon)

## 📝 TODO: Update Placeholders

### 1. In README.md

Replace `YOUR_USERNAME` with your GitHub username in these lines:

```markdown
# Line 58
![DDL Viewer Overview](https://raw.githubusercontent.com/YOUR_USERNAME/DDL_Viewer/main/media/Overview.png)

# Line 63
![CTE Pipeline](https://raw.githubusercontent.com/YOUR_USERNAME/DDL_Viewer/main/media/CTE_Views.png)
```

Replace `DEMO_VIDEO_LINK_HERE` with your actual video link:

```markdown
# Line 10
[📺 Watch Demo Video](DEMO_VIDEO_LINK_HERE)
```

### 2. In package.json

Replace these placeholders:

```json
{
  "publisher": "YOUR_PUBLISHER_NAME",  // Your marketplace publisher ID
  "author": {
    "name": "Your Name",              // Your actual name
    "email": "your.email@example.com" // Your email
  },
  "repository": {
    "url": "https://github.com/YOUR_USERNAME/DDL_Viewer"  // Your GitHub username
  },
  "bugs": {
    "url": "https://github.com/YOUR_USERNAME/DDL_Viewer/issues"  // Your GitHub username
  },
  "homepage": "https://github.com/YOUR_USERNAME/DDL_Viewer#readme"  // Your GitHub username
}
```

## 🎥 Demo Video (Optional)

If you want to add a demo video:

1. **Record a quick demo** (1-2 minutes):
   - Open VS Code
   - Click DDL Viewer icon
   - Paste SQL DDL
   - Show the generated diagram
   - Interact with it (zoom, pan)
   - Show CTE visualization

2. **Upload to**:
   - YouTube (unlisted or public)
   - Google Drive (make sure link is public)
   - Loom
   - Any other video hosting

3. **Update README.md**:
   Replace `DEMO_VIDEO_LINK_HERE` with your video URL

## 🚀 Next Steps

1. **Update all placeholders** (see above)
2. **Follow GIT_SETUP.md** to push to GitHub
3. **Verify images** display correctly on GitHub
4. **Follow PUBLISHING.md** to publish to marketplace

## Quick Find & Replace

Use VS Code's Find & Replace (Ctrl+H) to update all at once:

| Find | Replace With |
|------|--------------|
| `YOUR_USERNAME` | `your-github-username` |
| `YOUR_PUBLISHER_NAME` | `your-publisher-id` |
| `Your Name` | `Your Actual Name` |
| `your.email@example.com` | `your@email.com` |
| `DEMO_VIDEO_LINK_HERE` | `https://your-video-link` |

---

**After updating, you're ready to publish! 🎉**
