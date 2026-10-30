import { AlertCircle, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import type React from 'react';
import { useCallback, useState } from 'react';
import { type GitHubRepoInfo, GitHubService } from '../services/githubService';
import type { GitHubFileEntry } from '../types/files';
import { isTextFileName } from '../utils/fileFilters';
import { GitHubIcon } from './icons/BrandIcons';
import Button from './ui/Button';

interface GitHubLoaderProps {
  onRepositoryLoaded: (
    files: GitHubFileEntry[],
    repoInfo: GitHubRepoInfo,
  ) => void;
  onError: (error: string) => void;
  isLoading: boolean;
}

const NOTES = [
  'Public repositories only',
  'Text files are loaded: code, config, documentation',
  'Repository metadata is cached for 1 hour',
];

const GitHubLoader: React.FC<GitHubLoaderProps> = ({
  onRepositoryLoaded,
  onError,
  isLoading,
}) => {
  const [githubUrl, setGithubUrl] = useState<string>('');
  const [branch, setBranch] = useState<string>('');
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
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

      const repoCheck = await GitHubService.getRepositoryInfo(
        parsed.owner,
        parsed.repo,
      );

      if (!repoCheck.exists) {
        setValidationStatus('invalid');
        setRepoInfo(null);
        return;
      }

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
    if (!repoInfo?.branch.trim() || isLoading || isFetching) return;

    try {
      onError('');
      setIsFetching(true);
      setLoadingProgress({ current: 0, total: 0 });

      const githubFiles = await GitHubService.fetchRepositoryContents(
        repoInfo.owner,
        repoInfo.repo,
        repoInfo.branch,
      );

      const textFiles = githubFiles.filter(
        (file) => file.type === 'file' && isTextFileName(file.name),
      );

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
        50,
      );

      setLoadingProgress({ current: 0, total: 0 });
      onRepositoryLoaded(fileDetails, repoInfo);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load repository';
      onError(errorMessage);
      setLoadingProgress({ current: 0, total: 0 });
    } finally {
      setIsFetching(false);
    }
  }, [repoInfo, isLoading, isFetching, onRepositoryLoaded, onError]);

  const isBusy = isLoading || isFetching;

  const getValidationIcon = () => {
    switch (validationStatus) {
      case 'validating':
        return (
          <Loader2
            aria-hidden="true"
            className="h-4 w-4 animate-spin text-sky-500"
          />
        );
      case 'valid':
        return (
          <CheckCircle2
            aria-hidden="true"
            className="h-4 w-4 text-emerald-500"
          />
        );
      case 'invalid':
        return (
          <AlertCircle aria-hidden="true" className="h-4 w-4 text-red-500" />
        );
      default:
        return null;
    }
  };

  const validationMessage =
    validationStatus === 'valid' && repoInfo
      ? `Connected to ${repoInfo.owner}/${repoInfo.repo} (${repoInfo.branch})`
      : validationStatus === 'invalid'
        ? 'Invalid repository URL or repository not found'
        : '';

  const inputClasses =
    'w-full rounded-lg border border-neutral-300 bg-white py-2 pl-9 pr-9 text-sm text-neutral-900 shadow-sm outline-none transition-colors placeholder:text-neutral-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-100 dark:placeholder:text-neutral-400';

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_9rem]">
        <div>
          <label
            htmlFor="github-url"
            className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300"
          >
            Repository URL
          </label>
          <div className="relative">
            <GitHubIcon
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500 dark:text-neutral-400"
            />
            <input
              id="github-url"
              type="url"
              placeholder="https://github.com/owner/repo"
              value={githubUrl}
              onChange={handleUrlChange}
              className={inputClasses}
              disabled={isBusy || isValidating}
              aria-invalid={validationStatus === 'invalid'}
              aria-describedby={
                validationMessage ? 'github-validation-message' : undefined
              }
            />
            {validationStatus !== 'idle' && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {getValidationIcon()}
              </div>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="branch"
            className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300"
          >
            Branch
          </label>
          <input
            id="branch"
            type="text"
            placeholder="main"
            value={branch}
            onChange={handleBranchChange}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 font-mono text-sm text-neutral-900 shadow-sm outline-none transition-colors placeholder:font-sans placeholder:text-neutral-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-100 dark:placeholder:text-neutral-400"
            disabled={isBusy || isValidating}
          />
        </div>
      </div>

      {validationMessage && (
        <p
          id="github-validation-message"
          className={`flex items-center gap-1.5 text-xs ${
            validationStatus === 'valid'
              ? 'text-emerald-700 dark:text-emerald-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {validationStatus === 'valid' ? (
            <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
          ) : (
            <AlertCircle aria-hidden="true" className="h-3.5 w-3.5" />
          )}
          {validationMessage}
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          onClick={validateRepository}
          disabled={!githubUrl.trim() || isBusy || isValidating}
          variant="secondary"
          className="px-4 py-2 text-xs"
        >
          {isValidating ? (
            <>
              <Loader2
                aria-hidden="true"
                className="h-3.5 w-3.5 animate-spin"
              />
              Validating…
            </>
          ) : (
            'Validate repository'
          )}
        </Button>

        <Button
          onClick={handleLoadRepository}
          disabled={validationStatus !== 'valid' || isBusy || !repoInfo}
          variant="primary"
          className="flex-1 px-4 py-2 text-xs"
          aria-busy={isFetching}
        >
          {isFetching ? (
            <>
              <Loader2
                aria-hidden="true"
                className="h-3.5 w-3.5 animate-spin"
              />
              Loading repository…
            </>
          ) : (
            'Load repository'
          )}
        </Button>
      </div>

      {isFetching && loadingProgress.total > 0 && (
        <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/60 p-3 dark:border-neutral-800 dark:bg-neutral-900/40">
          <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-300">
            <span>Processing files…</span>
            <span className="font-medium tabular-nums">
              {loadingProgress.current} / {loadingProgress.total}
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300 ease-out"
              style={{
                width: `${(loadingProgress.current / loadingProgress.total) * 100}%`,
              }}
            />
          </div>
          {loadingProgress.file && (
            <p className="mt-1.5 truncate font-mono text-[10px] text-neutral-500 dark:text-neutral-400">
              {loadingProgress.file}
            </p>
          )}
        </div>
      )}

      <ul className="space-y-1 text-[11px] text-neutral-500 dark:text-neutral-400">
        {NOTES.map((note) => (
          <li key={note} className="flex items-start gap-1.5">
            <ShieldCheck
              aria-hidden="true"
              className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-500/80"
            />
            {note}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GitHubLoader;
