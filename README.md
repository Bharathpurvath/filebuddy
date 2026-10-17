# FileBuddy

A responsive browser-based file manager built with React. Upload, preview, search, download, and manage files through a clean interface.

## Live Demo

[Open FileBuddy](https://lambent-chaja-765d34.netlify.app/)

## Features

- Drag-and-drop file uploads
- Preview supported image files
- Download files
- Remove files
- Search files by name
- Persistent local storage with IndexedDB
- Responsive layout for desktop and mobile
- Dark themed interface

## Tech Stack

- React
- JavaScript
- Vite
- CSS
- IndexedDB
- HTML

## Getting Started

### Prerequisites

Install [Node.js](https://nodejs.org/).

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Bharathpurvath/filebuddy.git
   ```

2. Move into the project directory:

   ```bash
   cd filebuddy
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL shown in your terminal.

## Production Build

Run the following command to create a production build:

```bash
npm run build
```

The generated files will be in the `dist` directory.

## Storage and Privacy

Files are stored locally in the browser using IndexedDB. They are not automatically uploaded to a cloud server or synchronized across devices. Clearing browser site data may remove locally stored files.

## Author

**Bharath B**

[GitHub Profile](https://github.com/Bharathpurvath)
