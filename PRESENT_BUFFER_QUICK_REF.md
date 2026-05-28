# Present Year Buffer - Quick Reference

## 🎯 What Problem Does This Solve?

**Before**: Current year stuck at screen edge → cramped, claustrophobic modern timeline

**After**: Automatic 30-year buffer → spacious, navigable modern timeline

---

## 🚀 Quick Start

### For Users
1. Navigate to modern era (1900+)
2. See "Present" marker and buffer zone automatically
3. Toggle in Tweaks Panel if needed: **"Буфер настоящего"**

### For Developers
```javascript
// Constants (timeline.jsx)
const PRESENT_BUFFER_FIXED = 30;     // years after present
const PRESENT_BUFFER_PERCENT = 0.15; // viewport percentage

// Usage in component
<Timeline enablePresentBuffer={true} />
```

---

## 📦 What's Included

| Feature | Description | Location |
|---------|-------------|----------|
| **Present Marker** | Vertical line + "Present" label | timeline.jsx:627-636 |
| **Buffer Logic** | Auto-padding during pan/zoom | timeline.jsx:296-307 |
| **Minimap Zone** | Shaded buffer area on minimap | timeline.jsx:927-935 |
| **Visual Styles** | CSS for all buffer elements | styles.css:1096-1220 |
| **User Toggle** | Enable/disable in Tweaks | app.jsx:618-623 |

---

## 🎨 Visual Elements

### Present Day Marker
```css
.tl-present-marker       /* Container */
.tl-present-line         /* Vertical gradient line */
.tl-present-label        /* "Present" badge */
```

### Minimap Buffer Zone
```css
.tl-minimap-present-zone /* Shaded region on minimap */
```

---

## ⚙️ Configuration

### Constants (timeline.jsx)
```javascript
const PRESENT_BUFFER_FIXED = 30;     // Change buffer size
const PRESENT_BUFFER_PERCENT = 0.15; // Change percentage
```

### Default Setting (index.html)
```javascript
"presentBuffer": true  // Enable by default
```

### User Control
Tweaks Panel → "Буфер настоящего" toggle

---

## 🎭 Vibe Variations

| Vibe | Present Marker Color | Style |
|------|---------------------|-------|
| **Data** | `#38bdf8` (blue) | Technical |
| **Archive** | `#f4cc6c` (gold) | Vintage |
| **Cosmos** | `#84ffb4` (mint) | Ethereal |

---

## 🔧 Troubleshooting

### Present marker not showing?
- ✅ Check zoom level (must be within ±50 years of present)
- ✅ Verify `enablePresentBuffer` prop is `true`
- ✅ Ensure `viewEnd > CURRENT_YEAR - 50`

### Buffer not working during pan?
- ✅ Check `enablePresentBuffer` in Timeline props
- ✅ Verify buffer logic in `onPointerMove` handler
- ✅ Confirm `CURRENT_YEAR` is correct

### Minimap zone not visible?
- ✅ Check minimap is enabled (`showMinimap: true`)
- ✅ Verify `enablePresentBuffer` prop
- ✅ Inspect CSS for `.tl-minimap-present-zone`

---

## 📊 Key Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Buffer Size | 30 years | Fixed |
| Buffer % | 15% | Of viewport |
| Activation | 1900+ | Modern era only |
| Marker Visibility | ±50 years | Around present |
| Animation | 2s pulse | Subtle glow |
| Performance | <1ms/frame | GPU accelerated |

---

## 🧪 Testing Commands

### Manual Testing
1. **Pan Test**: Drag to 2020s → feel buffer resistance
2. **Zoom Test**: Zoom to 2000s → check buffer enforcement
3. **Marker Test**: Zoom to present → verify marker appears
4. **Minimap Test**: Check shaded zone on minimap
5. **Toggle Test**: Disable buffer → verify all elements hide

### Browser Console
```javascript
// Check current year constant
console.log(window.CURRENT_YEAR)

// Check buffer constants
console.log(window.PRESENT_BUFFER_FIXED)
console.log(window.PRESENT_BUFFER_PERCENT)

// Test buffer logic
const viewEnd = 2030;
const needsBuffer = viewEnd > window.CURRENT_YEAR && 
                    viewEnd < window.CURRENT_YEAR + window.PRESENT_BUFFER_FIXED;
console.log('Needs buffer:', needsBuffer)
```

---

## 📝 Code Locations

### JavaScript
- **timeline.jsx**: Buffer logic, marker rendering
- **app.jsx**: Toggle integration
- **index.html**: Default settings

### CSS
- **styles.css:1096-1220**: Present marker styles
- **styles.css:1458-1485**: Minimap buffer zone styles

### Documentation
- **UX_DESIGN_PRESENT_BUFFER.md**: Full UX spec
- **VISUAL_DESIGN_SPEC.md**: Visual design details
- **PRESENT_BUFFER_QUICK_REF.md**: This file

---

## 🎓 Best Practices

### DO ✅
- Keep buffer enabled for most users
- Use subtle animations (2s pulse)
- Respect user toggle preference
- Test across all three vibes

### DON'T ❌
- Disable buffer by default
- Make animations faster (distracting)
- Ignore mobile experience
- Hard-code year values (use constants)

---

## 🔮 Future Enhancements

| Feature | Priority | Effort |
|---------|----------|--------|
| Adjustable buffer size | Medium | Low |
| Custom color picker | Low | Medium |
| Mobile optimizations | High | Medium |
| Reduced motion support | Medium | Low |
| Localization | High | Low |
| Buffer strength control | Low | Medium |

---

## 💡 Pro Tips

1. **Buffer feels like magic** when done right - users won't notice it, but they'll notice when it's gone
2. **30 years is the sweet spot** - enough for breathing room, not wasteful
3. **Soft constraint on drag** prevents fighting user input
4. **Hard constraint on zoom** ensures optimal views
5. **Vibe-aware styling** makes it feel native to each theme

---

## 🆘 Need Help?

1. Check this quick reference first
2. Review UX_DESIGN_PRESENT_BUFFER.md for details
3. Inspect VISUAL_DESIGN_SPEC.md for visual specs
4. Search code for `PRESENT_BUFFER` to find all related code
5. Check browser console for errors

---

**Last Updated**: 2026-05-28  
**Version**: 1.0.0  
**Status**: ✅ Implemented
