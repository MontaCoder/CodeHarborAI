<div align="center">
  <img src="public/codeharborai_logo.svg" alt="CodeHarborAI Logo" width="120" height="120">
  
  # CodeHarborAI 🚀
  
  **Transform Your Codebase Into Perfect AI Prompts**
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
  [![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-5.0.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
  
  [Features](#-features) • [Getting Started](#-getting-started) • [Usage](#-usage) • [Contributing](#-contributing)
</div>

---

## 🌟 Overview

CodeHarborAI is a modern, privacy-first web application that helps developers transform their codebases into optimized AI prompts. Built with React, TypeScript, and Vite, it allows you to securely select and combine project files directly in your browser to create comprehensive, context-rich prompts for AI coding assistants like ChatGPT, Claude, and more.

### Why CodeHarborAI?

- 🔒 **100% Private** - All processing happens locally in your browser
- ⚡ **Lightning Fast** - Advanced caching and batch processing
- 🎯 **AI-Optimized** - Professional templates and context engineering
- 🎨 **Beautiful UI** - Modern design with dark mode support
- 🚀 **No Installation** - Runs directly in your browser

---

## ✨ Features

### 🔐 Privacy & Security
- **100% Local Processing** - No code is ever sent to external servers
- **Secure File Access** - Uses native File System Access API
- **No Data Collection** - Your code stays private on your machine

### 📁 File Management
- **Local Folder Support** - Browse and select files/folders from your computer
- **GitHub Integration** - Load repositories directly from GitHub (10-100x faster)
- **Smart Filtering** - Exclude files using glob patterns (node_modules, .git, etc.)
- **Batch Processing** - Process up to 15 files concurrently with progress tracking
- **Real-time Statistics** - Track file count, size, and line count

### 🧠 Advanced Context Management
- **Smart Context Optimizer** - AI-powered intelligent context generation with file-aware optimization
- **Adaptive Token Management** - Automatic compression and summarization based on file importance
- **File Intelligence** - Auto-detects file types, roles, and relevance scores
- **Smart Token Tracking** - Real-time token count for GPT-4, Claude, and other models
- **Comment Removal** - Strip comments to reduce context size and token usage
- **File Filtering** - Intelligent filtering with customizable patterns
- **Preset Management** - Save and load your favorite file selections and configurations
- **GitHub Integration** - Import repositories with intelligent caching (1-hour cache)
- **One-Click Copy** - Copy formatted output directly to clipboard

### 🎨 Professional Templates (NEW!)
Pre-optimized prompts for common development tasks:
- 📝 **Code Review** - Comprehensive code analysis
- 📚 **API Documentation** - Generate API docs
- 🏗️ **Architecture Analysis** - System design review
- 🔒 **Security Audit** - Security vulnerability assessment
- ⚡ **Performance Optimization** - Performance bottleneck identification
- 🐛 **Bug Investigation** - Debug and troubleshooting
- 🧪 **Test Generation** - Unit and integration test creation
- 📖 **Documentation** - Technical documentation generation
- ♻️ **Refactoring** - Code improvement suggestions
- 🔄 **Migration** - Framework/library migration planning

### 🎯 Context Engineering
- **Smart Context Optimizer** - AI-powered context intelligence system (NEW!)
  - Automatic file analysis and role detection
  - Adaptive formatting based on file type and importance
  - Progressive summarization for large files
  - Token budget management with priority queuing
  - Cross-file dependency mapping
- **Context7 Integration** - Import external documentation to enrich AI context
- **Intelligent File Prioritization** - ML-based scoring of file relevance and importance
- **Adaptive Compression** - Smart truncation at function/class boundaries
- **Code Signature Extraction** - Auto-extract types, interfaces, and key functions
- **Token Optimization** - Minification and comment stripping to maximize context efficiency

### 🎨 User Experience
- **Dark/Light Mode** - Beautiful UI with automatic theme detection
- **Responsive Design** - Works seamlessly on desktop and tablet devices
- **Real-time Progress** - Visual progress indicators with file counts
- **Smart Sorting** - Prioritize important files automatically
- **Keyboard Shortcuts** - Efficient workflow with keyboard navigation

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 16.14.0 or later
- **npm** or **yarn** package manager
- **Modern Web Browser** (Chrome/Edge 86+, Firefox 89+)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MontaCoder/CodeHarborAI.git
   cd CodeHarborAI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173`

---

## 🛠️ Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

The build artifacts will be stored in the `dist/` directory. You can preview the production build locally:

```bash
npm run preview
# or
yarn preview
```

---

## 📝 Usage

### Quick Start Guide

1. **Choose Your Source**
   - Select "Local Folder" to browse files on your computer
   - Or select "GitHub Repo" to import from a repository

2. **Load Your Files**
   - For Local: Click "Browse Folder" and select your project directory
   - For GitHub: Paste the repository URL (e.g., `https://github.com/username/repo`)

3. **Select a Template (Optional)**
   - Choose from 10 professional templates optimized for specific tasks
   - Each template includes pre-configured context and instructions

4. **Pick Your Files**
   - Use smart sorting to prioritize documentation and key files
   - Apply filters to exclude unnecessary files
   - Select individual files or use "Select All"

5. **Configure Advanced Options (Optional)**
   - **Smart Optimizer**: Enable AI-powered context intelligence
   - **Token Budget**: Set maximum context size for your AI model
   - **Context7 Docs**: Add external documentation for framework references
   - **Remove Comments**: Strip comments to reduce token usage
   - **Minify Code**: Compress code for maximum context efficiency

6. **Generate AI Context**
   - Click "Generate AI Context" button
   - Review the formatted output with file contents

7. **Copy & Use**
   - Click "Copy to Clipboard"
   - Paste into ChatGPT, Claude, or your favorite AI assistant

### Advanced Features

#### Smart Sort & Filtering
- **✨ Smart Sort**: Automatically prioritizes:
  - Documentation files (README, docs/)
  - Configuration files (package.json, tsconfig.json)
  - Entry points (index, main, app)
- **Custom Filters**: Exclude patterns like `*.test.ts`, `*.spec.js`, `dist/`

#### Context7 Documentation
Add external documentation to enrich AI understanding:
- Framework documentation (React, Vue, Angular)
- Library references (Express, FastAPI)
- API specifications (OpenAPI, GraphQL)

#### Smart Context Optimizer (NEW!)
Intelligent, file-aware context optimization that automatically:
- **Analyzes** each file's type, role, and importance
- **Prioritizes** critical files (entry points, configs, docs)
- **Adapts** formatting based on file characteristics
- **Summarizes** large files while preserving key information
- **Optimizes** token usage with progressive enhancement

Configuration options:
- **Token Budget**: Set max context size (10k-200k tokens)
- **Documentation Priority**: Always include docs even if over budget
- **Structure Map**: Generate intelligent project overview
- **Code Signatures**: Extract types, interfaces, and exports
- **Adaptive Compression**: Smart summarization for large codebases

#### Preset Management
- Save your file selections and configurations
- Quickly switch between different project setups
- Export/import presets for team collaboration

#### Smart Context Optimization
- **File Type Detection**: Auto-identify source, config, docs, tests, etc.
- **Role Analysis**: Detect entry points, services, components, utilities
- **Relevance Scoring**: ML-based importance calculation
- **Adaptive Formatting**: Different strategies per file type
- **Token Budget Management**: Intelligent file selection within constraints
- **Progressive Summarization**: Extract key elements from large files
- **Structure Mapping**: Visual project overview with priority indicators

---

## 🎯 Use Cases

### For Individual Developers
- 🔍 Get AI assistance with code reviews
- 📝 Generate documentation from existing code
- 🐛 Debug complex issues with full context
- 🔄 Plan refactoring strategies
- 🧪 Create comprehensive test suites

### For Teams
- 📊 Share preset configurations across team members
- 🏗️ Architectural decision documentation
- 🔒 Security audits and vulnerability assessments
- 📚 Onboarding documentation generation
- 🎓 Code learning and knowledge transfer

---

## 🛡️ Privacy & Security

CodeHarborAI is designed with privacy as the top priority:

- ✅ **No Server Communication** - All processing happens in your browser
- ✅ **No Data Collection** - We don't collect, store, or transmit your code
- ✅ **No Analytics** - No tracking or user behavior monitoring
- ✅ **Open Source** - Full transparency with open-source code
- ✅ **Local Storage Only** - Presets saved to browser's local storage

Your code is **YOUR CODE**. Period.

---

## 🏗️ Tech Stack

- **Frontend Framework**: [React 18](https://reactjs.org/) with TypeScript
- **Build Tool**: [Vite 5](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Hooks (useState, useEffect, useCallback)
- **File System**: [File System Access API](https://web.dev/file-system-access/)
- **GitHub API**: REST API with Git Tree API for performance

---

## 🤝 Contributing

Contributions are welcome! Whether it's bug fixes, new features, or documentation improvements, we'd love your help.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

---

## 📋 Roadmap

- [ ] Support for more AI models and token calculators
- [ ] Browser extension for quick access
- [ ] Team collaboration features
- [ ] Export presets as JSON files
- [ ] Custom template creation
- [ ] Syntax highlighting in preview
- [ ] File diff visualization
- [ ] Integration with popular IDEs

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with love using:
- [React](https://reactjs.org/) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Lucide](https://lucide.dev/) - Icons
- [File System Access API](https://web.dev/file-system-access/) - Local file access

Special thanks to the open-source community for making this possible!

---

## 📞 Support & Contact

- **GitHub**: [@MontaCoder](https://github.com/MontaCoder)
- **Issues**: [Report a bug or request a feature](https://github.com/MontaCoder/CodeHarborAI/issues)
- **Email**: contact@codeharborai.com

---

<div align="center">
  
  **Made with ❤️ by [Montassar Hajri](https://github.com/MontaCoder)**
  
  If you find this project helpful, please consider giving it a ⭐️!
  
</div>
