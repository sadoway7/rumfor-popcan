# Images

This directory contains image assets for the market tracker application.

## Placeholder Image

`no-image-placeholder.svg` - A generic placeholder image used when no market photo is available.

### Usage

Import the placeholder in your components:

```typescript
import noImagePlaceholder from '../assets/images/no-image-placeholder.svg';

// Use in img tag
<img src={noImagePlaceholder} alt="No image available" />

// Use as background
<div style={{ backgroundImage: `url(${noImagePlaceholder})` }}>
```