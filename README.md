# InvoiceOCR - AI-Powered Invoice Scanner

A modern, digital-first web application for scanning and extracting data from invoices using AI-powered OCR technology.

## Features

- **Smart Invoice Detection**: Automatically detects invoice boundaries using advanced AI (YOLO + OpenCV)
- **Interactive 4-Corner Cropping**: Manual crop adjustment with draggable corner handles
- **Camera Capture**: Direct camera support for mobile devices
- **Drag & Drop**: Easy invoice upload with drag-and-drop interface
- **Real-time Processing**: Visual feedback during OCR processing
- **Structured Data Display**: Beautiful presentation of extracted invoice data
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend Framework**: React 19 + TypeScript
- **Build Tool**: Vite 8
- **Styling**: TailwindCSS 4
- **Package Manager**: Bun
- **File Upload**: react-dropzone
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Bun (package manager)
- Backend API server running (FastAPI)

### Installation

1. Install dependencies:
   ```bash
   bun install
   ```

2. Create `.env` file (optional):
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` to configure your API URL if different from default.

### Development

Start the development server:

```bash
bun run dev
```

The app will be available at `http://localhost:5173`

### Production Build

Build for production:

```bash
bun run build
```

Preview production build:

```bash
bun run preview
```

## Project Structure

```
web/
├── src/
│   ├── components/
│   │   ├── Navigation.tsx       # Navigation bar with mobile menu
│   │   ├── Footer.tsx           # Footer component
│   │   ├── ImageCropper.tsx     # 4-corner manual cropping tool
│   │   ├── InvoiceUploader.tsx  # Drag-drop and camera upload
│   │   └── InvoiceResult.tsx    # OCR results display
│   ├── services/
│   │   └── api.ts               # API integration service
│   ├── types/
│   │   └── api.ts               # TypeScript type definitions
│   ├── App.tsx                  # Main application component
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles
├── public/
│   ├── favicon.svg              # Site favicon
│   └── icons.svg                # Icon sprites
├── index.html                   # HTML template
├── vite.config.ts               # Vite configuration
├── package.json                 # Dependencies
└── README.md                    # This file
```

## Usage

### 1. Upload Invoice

You have three options to upload:
- **Drag & Drop**: Drag an invoice image directly onto the upload area
- **Camera**: Click "Camera" to capture from your device's camera (mobile)
- **Browse Files**: Click "Browse Files" to select from your file system

### 2. Crop Invoice

After uploading, you'll enter the cropping mode:
- Four draggable corner handles appear on the image
- Dashed lines show the current crop boundary
- Drag handles to adjust the crop area precisely
- Click "Confirm Crop" when satisfied

### 3. Processing

The cropped image is sent to the backend API for processing:
- Invoice detection using YOLO/OpenCV
- OCR text extraction
- Data parsing and structuring

### 4. View Results

Extracted data is displayed in beautiful cards:
- **Merchant Information**: Name, address, phone
- **Invoice Details**: Number, date, time, confidence score
- **Line Items**: Table of items with quantity, price, and totals
- **Payment Summary**: Subtotal, tax, total, and payment method
- **Processing Info**: Detection method, time, image dimensions
- **Raw OCR Text**: Collapsible view of extracted text

## API Integration

The web app communicates with the backend API at the following endpoints:

### Health Check
```
GET /api/health
```

### Process Invoice (Hybrid Pipeline)
```
POST /api/preprocess
Content-Type: multipart/form-data
Body: { file: <image_file> }
```

### Process Invoice (YOLO Pipeline)
```
POST /api/preprocess-yolo
Content-Type: multipart/form-data
Body: { file: <image_file> }
```

## Supported Formats

- JPEG / JPG
- PNG
- WebP
- BMP
- TIFF

**Maximum file size**: 10MB

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000` |

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- **Build Size**: ~320KB (gzipped: ~98KB)
- **CSS Size**: ~22KB (gzipped: ~5KB)
- **Load Time**: < 1s on 3G
- **First Paint**: < 500ms

## Development Conventions

- **TypeScript**: Strict mode enabled
- **Component Style**: Functional components with hooks
- **State Management**: React useState and useCallback
- **Code Organization**: Feature-based folder structure

## Troubleshooting

### API Connection Issues

If you see "Failed to connect to the API server":
1. Ensure the backend server is running on port 8000
2. Check the `VITE_API_URL` in your `.env` file
3. Verify CORS is enabled on the backend

### Camera Not Working

- Ensure your browser has camera permissions
- Use HTTPS in production (required for camera access)
- Try the file upload option instead

### Build Errors

Run the TypeScript checker:
```bash
bunx tsc --noEmit
```

## License

MIT

## Support

For issues or questions, please contact support@invoiceocr.com
