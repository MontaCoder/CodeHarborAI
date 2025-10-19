import { Code2, Github, Heart, Linkedin, Mail, Twitter } from 'lucide-react';
import type React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img
                src="/codeharborai_logo.svg"
                alt="CodeHarborAI Logo"
                className="h-10 w-10"
              />
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                CodeHarborAI
              </h3>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed max-w-md mb-4">
              Transform your codebase into AI-ready context. Securely process
              files locally, optimize for any AI model, and streamline your
              development workflow.
            </p>
            <div className="flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>by developer for developers</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-white mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="#features"
                  className="text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center group"
                >
                  <Code2 className="h-3.5 w-3.5 mr-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#documentation"
                  className="text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center group"
                >
                  <Code2 className="h-3.5 w-3.5 mr-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/MontaCoder"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center group"
                >
                  <Code2 className="h-3.5 w-3.5 mr-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  GitHub Repository
                </a>
              </li>
              <li>
                <a
                  href="#changelog"
                  className="text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center group"
                >
                  <Code2 className="h-3.5 w-3.5 mr-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Changelog
                </a>
              </li>
            </ul>
          </div>

          {/* Connect Section */}
          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-white mb-4">
              Connect
            </h4>
            <div className="flex flex-col space-y-3">
              <a
                href="https://github.com/MontaCoder"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
              >
                <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 transition-colors">
                  <Github className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">GitHub</span>
              </a>
              <a
                href=""
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
              >
                <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 transition-colors">
                  <Twitter className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">Twitter</span>
              </a>
              <a
                href="https://github.com/MontaCoder"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
              >
                <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 transition-colors">
                  <Linkedin className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">LinkedIn</span>
              </a>
              <a
                href="mailto:github.com/MontaCoder"
                className="inline-flex items-center space-x-2 text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
              >
                <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">Email</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              <p>
                &copy; {new Date().getFullYear()} Montassar Hajri. All rights
                reserved.
              </p>
            </div>
            <div className="flex items-center space-x-6 text-xs text-neutral-500 dark:text-neutral-400">
              <a
                href="#privacy"
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                Privacy Policy
              </a>
              <span className="text-neutral-300 dark:text-neutral-700">•</span>
              <a
                href="#terms"
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                Terms of Service
              </a>
              <span className="text-neutral-300 dark:text-neutral-700">•</span>
              <a
                href="#opensource"
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                Open Source
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
