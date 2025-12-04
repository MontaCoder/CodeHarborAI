import { AlertCircle, CheckCircle, Github, Loader2 } from 'lucide-react';
import type React from 'react';
import { useCallback, useState } from 'react';
import { type GitHubRepoInfo, GitHubService } from '../services/githubService';
import type { GitHubFileEntry } from '../types/files';
import { isTextFileName } from '../utils/fileFilters';
import Button from './ui/Button';

interface GitHubLoaderProps {
  onRepositoryLoaded: (files: GitHubFileEntry[], repoInfo: GitHubRepoInfo) => void;
  onError: (error: string) => void;
  isLoading: boolean;
}

const GitHubLoader: React.FC<GitHubLoaderProps> = ({
  onRepositoryLoaded,
  onError,
  isLoading,
}) => {
  const [githubUrl, setGithubUrl] = useState<string>('');
  const [branch, setBranch] = useState<string>('');
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<
    'idle' | 'validating' | 'valid' | 'invalid'
  >('idle');
  const [repoInfo, setRepoInfo] = useState<GitHubRepoInfo | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<{
    current: number;
    total: number;
    file?: string;
  }>({ current: 0, total: 0 });

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
      const repoCheck = await GitHubService.getRepositoryInfo(
        parsed.owner,
        parsed.repo,
      );

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

  const handleUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setGithubUrl(e.target.value);
      setValidationStatus('idle');
      setRepoInfo(null);
    },
    [],
  );

  const handleBranchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setBranch(e.target.value);
      if (repoInfo) {
        setRepoInfo({ ...repoInfo, branch: e.target.value });
      }
    },
    [repoInfo],
  );

  const handleLoadRepository = useCallback(async () => {
    if (!repoInfo || isLoading) return;

    try {
      onError(''); // Clear any previous errors
      setLoadingProgress({ current: 0, total: 0 });

      // Fetch all repository files using optimized Tree API
      const githubFiles = await GitHubService.fetchRepositoryContents(
        repoInfo.owner,
        repoInfo.repo,
        repoInfo.branch,
      );

      // Filter to text files only
      const textFiles = githubFiles.filter(
        (file) => file.type === 'file' && isTextFileName(file.name),
      );

      // Use batch processing with progress tracking
      const fileDetails = await GitHubService.batchProcessFiles(
        textFiles,
        async (file) => {
          const { size, lines } = await GitHubService.getFileSizeAndLines(file);
          return {
            file,
            path: file.path,
            size,
            lines,
          };
        },
        (current, total, currentFile) => {
          setLoadingProgress({ current, total, file: currentFile });
        },
        15, // Process 15 files concurrently
      );

      setLoadingProgress({ current: 0, total: 0 });
      onRepositoryLoaded(fileDetails, repoInfo);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load repository';
      onError(errorMessage);
      setLoadingProgress({ current: 0, total: 0 });
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
        return repoInfo
          ? `Repository: ${repoInfo.owner}/${repoInfo.repo} (${repoInfo.branch})`
          : '';
      case 'invalid':
        return 'Invalid repository URL or repository not found';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Github className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
        <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
          Load from GitHub
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="github-url"
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
          >
            GitHub Repository URL
          </label>
          <div className="relative">
            <input
              id="github-url"
              type="url"
              placeholder="https://github.com/owner/repo"
              value={githubUrl}
              onChange={handleUrlChange}
              className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              disabled={isLoading || isValidating}
            />
            {validationStatus !== 'idle' && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {getValidationIcon()}
              </div>
            )}
          </div>
          {getValidationMessage() && (
            <p
              className={`mt-1 text-sm ${validationStatus === 'valid' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
            >
              {getValidationMessage()}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="branch"
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
          >
            Branch (optional)
          </label>
          <input
            id="branch"
            type="text"
            placeholder="main, develop, etc."
            value={branch}
            onChange={handleBranchChange}
            className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            disabled={isLoading || isValidating}
          />
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
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

      {isLoading && loadingProgress.total > 0 && (
        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-neutral-700 dark:text-neutral-300">
              <span>Processing files...</span>
              <span className="font-medium">
                {loadingProgress.current} / {loadingProgress.total}
              </span>
            </div>
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 transition-all duration-300 ease-out"
                style={{
                  width: `${(loadingProgress.current / loadingProgress.total) * 100}%`,
                }}
              />
            </div>
            {loadingProgress.file && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                {loadingProgress.file}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="text-xs text-neutral-500 dark:text-neutral-400 space-y-1">
        <p>- Supports public GitHub repositories</p>
        <p>- Only text files are loaded (code, config, documentation)</p>
        <p>- Results are cached for 1 hour for faster reloading</p>
      </div>
    </div>
  );
};

export default GitHubLoader;

