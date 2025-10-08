# CodeHarborAI 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-4.0.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

## 🌟 Overview

CodeHarborAI is a modern, privacy-focused web application that helps developers transform their codebases into optimized AI prompts. Built with React, TypeScript, and Vite, it allows you to securely select and combine project files directly in your browser to create comprehensive prompts for AI coding assistants.

## ✨ Features

### Core Capabilities
- **Secure & Private**: All processing happens locally in your browser - no code is ever sent to external servers
- **File System Access**: Browse and select files/folders using the File System Access API
- **GitHub Integration**: Load repositories directly from GitHub with blazing-fast performance (10-100x faster)
- **Smart Filtering**: Easily include or exclude files using glob patterns and quick filters
- **Dark/Light Mode**: Beautiful UI with system preference detection
- **Responsive Design**: Works on desktop and tablet devices
- **No Installation Required**: Runs directly in modern web browsers

### 🚀 Performance Features
- **Ultra-Fast GitHub Loading**: Git Tree API + intelligent caching (1-hour cache)
- **Batch Processing**: Process up to 15 files concurrently with progress tracking
- **Smart Caching**: Instant reload for previously loaded repositories
- **Real-time Progress**: Visual progress indicators with file counts

### 🧠 Context Engineering (NEW!)
- **10 Professional Templates**: Pre-optimized prompts for Code Review, API Docs, Architecture, Security, etc.
- **Context7 Integration**: Import external documentation to enrich AI context
- **3 Detail Levels**: Concise, Standard, or Detailed context formatting
- **Smart File Prioritization**: Automatic prioritization of documentation and key files
- **Advanced Options**: File metadata, project structure, comment stripping, minification
- **AI-Optimized Output**: Generate perfect prompts for maximum LLM effectiveness

## 🚀 Getting Started

### Prerequisites

- Node.js 16.14.0 or later
- npm or yarn package manager
- Modern web browser (Chrome/Edge 86+, Firefox 89+)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/codeharborai.git
   cd codeharborai
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## 🛠️ Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

The build artifacts will be stored in the `dist/` directory.

## 📝 Usage

### Quick Start
1. **Choose Source**: Select "Local Folder" or "GitHub Repo"
2. **Load Files**: Browse your project or paste a GitHub URL
3. **Select Template**: Choose from 10 professional templates (optional)
4. **Pick Files**: Use smart sorting and filters to select relevant files
5. **Add Context** (optional):
   - Import Context7 documentation for framework references
   - Set context detail level (Concise/Standard/Detailed)
   - Configure metadata and structure options
6. **Generate Context**: Click "Generate AI Context"
7. **Copy & Use**: Paste into ChatGPT, Claude, or your favorite AI assistant

### Advanced Features
- **Smart Sort**: Toggle "✨ Smart Sort" to prioritize docs and key files
- **Context7 Docs**: Add external documentation for better AI understanding
- **Detail Levels**:
  - Concise: Quick tasks, minimal tokens
  - Standard: Balanced (recommended)
  - Detailed: Maximum context for complex analysis
- **Token Optimization**: Strip comments or minify code to reduce token usage

## 🛡️ Privacy

CodeHarborAI runs entirely in your browser. No code or file contents are ever sent to external servers. Your code stays private and secure on your local machine.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), and [Vite](https://vitejs.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)
- Modern UI components built with accessibility in mind

---

Made with ❤️ by [Montassar Hajri](https://github.com/MontaCoder)
