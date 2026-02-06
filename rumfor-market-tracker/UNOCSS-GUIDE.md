# 🎨 UnoCSS Plugins Guide

## ✅ Plugins Installed

### Core (Already Had)
- **presetUno()** - Default preset with Tailwind-like utilities
- **presetAttributify()** - Attributify mode (use props instead of classes)
- **presetIcons()** - Icons from Iconify

### NEW - Added Today
1. **@unocss/preset-icons** 🖼️ - Already had it configured!
2. **@unocss/preset-typography** 📝 - Beautiful prose/content styling
3. **@unocss/preset-web-fonts** 🔤 - Google Fonts support

---

## 🎯 How to Use

### Icons (200,000+ icons!)
```html
<!-- Just use any icon name! -->
<div class="i-mdi-home"></div>
<div class="i-ph-rocket-launch"></div>
<div class="i-lucide-settings"></div>
<div class="i-emojione-v1-grinning-face-with-smiling-eyes"></div>
```

```css
/* Or in CSS */
.btn::before {
  content: "i-mdi-arrow-right";
  margin-right: 8px;
}
```

**Find icons**: https://icones.js.org/

---

### Typography (Beautiful content)
```html
<article class="prose prose-lg dark:prose-invert">
  <h1>My Article Title</h1>
  <p>This text will be beautifully formatted!</p>
  <code>Inline code</code>
  <pre><code>Code blocks</code></pre>
  <blockquote>A nice quote</blockquote>
  <ul>
    <li>Item 1</li>
    <li>Item 2</li>
  </ul>
</article>
```

**Options**:
```typescript
presetTypography({
  selectorName: 'prose', // class name prefix
  invertColors: true, // for dark mode
})
```

---

### Web Fonts (Google Fonts)
```html
<!-- Uses Inter font -->
<p class="font-sans">Hello World</p>

<!-- Uses JetBrains Mono -->
<code class="font-mono">const x = 1</code>
```

Fonts available:
- **sans**: Inter (400, 500, 600, 700)
- **mono**: JetBrains Mono (400, 500)

---

## 📚 Documentation

- **UnoCSS**: https://unocss.dev/
- **Icons**: https://unocss.dev/presets/icons
- **Typography**: https://unocss.dev/presets/typography
- **Web Fonts**: https://unocss.dev/presets/web-fonts
- **Find Icons**: https://icones.js.org/

---

## 🎨 Examples

### Button with Icon
```html
<button class="i-ph-shopping-cart mr-2"></button>
Add to Cart
```

### Loading Spinner
```html
<div class="i-svg-spinners-90-ring-with-bg"></div>
```

### Social Icons
```html
<div class="i-mdi-github"></div>
<div class="i-mdi-twitter"></div>
<div class="i-mdi-linkedin"></div>
<div class="i-mdi-discord"></div>
```

### Emojis as Icons
```html
<div class="i-twemoji-grinning-face-with-smiling-eyes text-4xl"></div>
```

---

## 🚀 Pro Tips

1. **Combine with Tailwind**:
   ```html
   <div class="i-mdi-home text-red-500 hover:text-red-600 transition-colors"></div>
   ```

2. **Size control**:
   ```html
   <div class="i-mdi-home text-xs"></div>
   <div class="i-mdi-home text-xl"></div>
   <div class="i-mdi-home text-4xl"></div>
   ```

3. **Color control**:
   ```html
   <div class="i-mdi-home text-blue-500"></div>
   <div class="i-mdi-home text-[#ff0000]"></div>
   ```

---

## 🎯 What's Available

| Feature | Amount |
|---------|--------|
| **Total Icons** | 200,000+ |
| **Icon Sets** | 100+ collections |
| **Fonts** | Google Fonts |
| **Typography** | Prose utilities |

---

## 🔗 Quick Links

- **🎨 Icons**: https://icones.js.org/
- **📖 Docs**: https://unocss.dev/
- **💬 Discord**: https://discord.gg/2prH52sKUr
