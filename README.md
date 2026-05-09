# ARW → DNG Converter

Convert Sony ARW files to DNG (or 16-bit TIFF) locally — no upload, no quality loss.
Output DNG files open in iPhone's native Photos app with full RAW editing (white balance, exposure recovery, etc.).

## Setup

### Option A — Adobe DNG Converter (best, true DNG output)

1. Download **Adobe DNG Converter** for free: https://helpx.adobe.com/camera-raw/using/adobe-dng-converter.html
2. Install it to `/Applications`
3. Run the app:

```bash
cd arw-converter
npm install
npm run dev
```

4. Open http://localhost:3000

### Option B — dcraw (fallback, outputs 16-bit TIFF)

```bash
brew install dcraw
npm install
npm run dev
```

## Usage

1. Open http://localhost:3000
2. Drag & drop ARW files onto the drop zone (or click to browse)
3. Click **Convert** (or **Convert & Download ZIP** for multiple files)
4. Download the converted DNG/TIFF files
5. AirDrop to iPhone → open in Photos → tap Edit to access RAW controls

## Notes

- Files are processed entirely on your Mac — nothing leaves your machine
- DNG output preserves all original RAW sensor data
- TIFF output (dcraw fallback) is 16-bit linear, lossless, but demosaiced
- ARW files are typically 20–50 MB; conversion takes a few seconds per file
