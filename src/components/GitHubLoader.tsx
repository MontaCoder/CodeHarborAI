import React, { useState, useCallback } from 'react';
import { Github, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { GitHubService, GitHubFile, GitHubRepoInfo } from '../services/githubService';
import Button from './ui/Button';

interface GitHubLoaderProps {
  onRepositoryLoaded: (
    files: Array<{file: GitHubFile, path: string, size: number, lines: number}>,
    repoInfo: GitHubRepoInfo
  ) => void;
  onError: (error: string) => void;
  isLoading: boolean;
}

const GitHubLoader: React.FC<GitHubLoaderProps> = ({
  onRepositoryLoaded,
  onError,
  isLoading
}) => {
  const [githubUrl, setGithubUrl] = useState<string>('');
  const [branch, setBranch] = useState<string>('');
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [repoInfo, setRepoInfo] = useState<GitHubRepoInfo | null>(null);

  const validateRepository = useCallback(async () => {
    if (!githubUrl.trim()) {
      setValidationStatus('invalid');
      return;
    }

    setIsValidating(true);
    setValidationStatus('validating');

    try {
      const parsed = GitHubService.parseGitHubUrl(githubUrl.trim());
      if (!parsed) {
        setValidationStatus('invalid');
        setRepoInfo(null);
        return;
      }

      // Check if repository exists and get default branch
      const repoCheck = await GitHubService.getRepositoryInfo(parsed.owner, parsed.repo);

      if (!repoCheck.exists) {
        setValidationStatus('invalid');
        setRepoInfo(null);
        return;
      }

      // Use provided branch or default branch
      const finalBranch = branch.trim() || repoCheck.defaultBranch;
      const finalRepoInfo = { ...parsed, branch: finalBranch };

      setRepoInfo(finalRepoInfo);
      setBranch(finalBranch);
      setValidationStatus('valid');
    } catch (error) {
      console.error('Error validating repository:', error);
      setValidationStatus('invalid');
      setRepoInfo(null);
    } finally {
      setIsValidating(false);
    }
  }, [githubUrl, branch]);

  const handleUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setGithubUrl(e.target.value);
    setValidationStatus('idle');
    setRepoInfo(null);
  }, []);

  const handleBranchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setBranch(e.target.value);
    if (repoInfo) {
      setRepoInfo({ ...repoInfo, branch: e.target.value });
    }
  }, [repoInfo]);

  const handleLoadRepository = useCallback(async () => {
    if (!repoInfo || isLoading) return;

    try {
      onError(''); // Clear any previous errors

      // Fetch all repository files
      const githubFiles = await GitHubService.fetchRepositoryContents(
        repoInfo.owner,
        repoInfo.repo,
        repoInfo.branch
      );

      // Filter to text files only and get size/line info
      const textExtensions = [
        '.txt', '.md', '.csv', '.js', '.css', '.html',
        '.json', '.xml', '.yaml', '.yml', '.ini', '.log',
        '.sh', '.bash', '.py', '.java', '.cpp', '.c', '.h',
        '.config', '.env', '.gitignore', '.sql', '.ts',
        '.tsx', '.schema', '.mjs', '.cjs', '.jsx', '.rs',
        '.go', '.php', '.rb', '.toml', '.prisma', '.bat', '.ps1',
        '.svelte', '.lock'
      ];

      const exactMatches = ['Makefile', 'Dockerfile'];

      const textFiles = githubFiles.filter(file =>
        file.type === 'file' && (
          exactMatches.includes(file.name) ||
          textExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
        )
      );

      // Get file details for each text file
      const fileDetails = await Promise.all(
        textFiles.map(async (file) => {
          const { size, lines } = await GitHubService.getFileSizeAndLines(file);
          return {
            file,
            path: file.path,
            size,
            lines
          };
        })
      );

      onRepositoryLoaded(fileDetails, repoInfo);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load repository';
      onError(errorMessage);
    }
  }, [repoInfo, isLoading, onRepositoryLoaded, onError]);

  const getValidationIcon = () => {
    switch (validationStatus) {
      case 'validating':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'invalid':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getValidationMessage = () => {
    switch (validationStatus) {
      case 'valid':
        return repoInfo ? `Repository: ${repoInfo.owner}/${repoInfo.repo} (${repoInfo.branch})` : '';
      case 'invalid':
        return 'Invalid repository URL or repository not found';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Github className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
          Load from GitHub
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="github-url" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            GitHub Repository URL
          </label>
          <div className="relative">
            <input
              id="github-url"
              type="url"
              placeholder="https://github.com/owner/repo"
              value={githubUrl}
              onChange={handleUrlChange}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              disabled={isLoading || isValidating}
            />
            {validationStatus !== 'idle' && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {getValidationIcon()}
              </div>
            )}
          </div>
          {getValidationMessage() && (
            <p className={`mt-1 text-sm ${validationStatus === 'valid' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {getValidationMessage()}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="branch" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Branch (optional)
          </label>
          <input
            id="branch"
            type="text"
            placeholder="main, develop, etc."
            value={branch}
            onChange={handleBranchChange}
            className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            disabled={isLoading || isValidating}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Leave empty to use the default branch
          </p>
        </div>

        <div className="flex space-x-3">
          <Button
            onClick={validateRepository}
            disabled={!githubUrl.trim() || isLoading || isValidating}
            secondary
            className="flex-1 sm:flex-none"
          >
            {isValidating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Validating...
              </>
            ) : (
              'Validate Repository'
            )}
          </Button>

          <Button
            onClick={handleLoadRepository}
            disabled={validationStatus !== 'valid' || isLoading || !repoInfo}
            primary
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading Repository...
              </>
            ) : (
              'Load Repository'
            )}
          </Button>
        </div>
      </div>

      <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
        <p>• Supports public GitHub repositories</p>
        <p>• Only text files are loaded (code, config, documentation)</p>
        <p>• Large repositories may take time to load</p>
      </div>
    </div>
  );
};

export default GitHubLoader;
