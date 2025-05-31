# Rock // Radicalism // Resistance

A multimedia web experience exploring how rock music soundtracked the Black Power Movement.

## 🎵 Audio Files Needed

To complete the audio experience, add these MP3 files to the `audio/` folder:

1. ✅ **revolution.mp3** - Gil Scott-Heron "The Revolution Will Not Be Televised" (already added)
2. ⏳ **hendrix.mp3** - Jimi Hendrix "Machine Gun" (Band of Gypsys version)
3. ⏳ **death.mp3** - Death "Politicians In My Eyes"
4. ⏳ **sly.mp3** - Sly & The Family Stone "Don't Call Me N****r, Whitey"

## 🚀 Features

- **Scroll-based audio system**: "The Revolution Will Not Be Televised" fades as you scroll
- **Multi-track support**: Click "PLAY IN BACKGROUND" on any artist to switch songs
- **YouTube embeds**: Preview each song directly on the page
- **Spotify playlist**: Modern protest music playlist embedded
- **Responsive design**: Works on all devices

## 📁 Project Structure

```
ASMRwebsite/
├── audio/
│   ├── revolution.mp3 ✓
│   ├── hendrix.mp3 (add this)
│   ├── death.mp3 (add this)
│   └── sly.mp3 (add this)
├── index.html
├── styles.css
├── script.js
└── README.md
```

## 🌐 GitHub Pages

Your site is deployed at: https://filmonam.github.io/ASMRwebsite/

To update:
```bash
git add .
git commit -m "Your message"
git push origin main
```

## 🎨 Customization

### Change Spotify Playlist
Replace the playlist ID in the Spotify embed URL in `index.html`:
```html
src="https://open.spotify.com/embed/playlist/YOUR_PLAYLIST_ID"
```

### Add More Artists
1. Add artist block in HTML
2. Add audio source in `audioSources` object in script.js
3. Add MP3 file to audio folder

## 📝 Credits

- Images from Wikimedia Commons and Unsplash
- YouTube videos linked with attribution
- Educational fair use for historical documentation 