"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Folder, File, User, Mail, Github, Linkedin, ExternalLink, ChevronRight, Code, Database, Globe, Zap, Coffee, Star, GitBranch, Play, Pause, Volume2, VolumeX, X, Home, Briefcase, MessageSquare } from 'lucide-react';

// Type definitions
interface Project {
  name: string;
  description: string;
  tech: string[];
  status: string;
  stars: number;
  forks: number;
  updated: string;
  commitCount: number;
  url: string;
  language: string;
  size: number;
  createdAt: Date;
  pushedAt: Date;
  html_url: string;
  stargazers_count: number;
  topics?: string[];
}

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

interface FormStatus {
  type: 'idle' | 'loading' | 'success' | 'error';
  message: string;
}

// Cache configuration
const CACHE_CONFIG = {
  COMMITS_EXPIRY: 15 * 60 * 1000, // 15 minutes
  PROJECTS_EXPIRY: 30 * 60 * 1000, // 30 minutes
  MAX_CONCURRENT_REQUESTS: 5, // Limit concurrent API calls
  REQUEST_DELAY: 100, // Reduced delay between requests
};

// Utility function for parallel processing with concurrency limit
const processInBatches = async <T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = CACHE_CONFIG.MAX_CONCURRENT_REQUESTS
): Promise<R[]> => {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(item => processor(item))
    );
    
    batchResults.forEach(result => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      }
    });
    
    // Small delay between batches to avoid rate limiting
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, CACHE_CONFIG.REQUEST_DELAY));
    }
  }
  
  return results;
};

// Optimized GitHub API client with retry logic
class GitHubAPIClient {
  private baseURL = 'https://api.github.com';
  private headers: Record<string, string>;

  constructor(token?: string) {
    this.headers = {
      'Accept': 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };

    if (token) {
      this.headers['Authorization'] = `token ${token}`;
    }
  }

  async fetchWithRetry(url: string, retries = 2): Promise<any> {
    for (let i = 0; i <= retries; i++) {
      try {
        const response = await fetch(url, { 
          headers: this.headers,
          cache: 'force-cache', // Use browser cache when possible
        });
        
        if (response.status === 403) {
          // Rate limit hit, wait and retry
          if (i < retries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            continue;
          }
        }
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        if (i === retries) throw error;
        await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
      }
    }
  }

  async getRepos(username: string, includePrivate = false): Promise<any[]> {
    const endpoint = includePrivate 
      ? `${this.baseURL}/user/repos?sort=updated&per_page=100&affiliation=owner`
      : `${this.baseURL}/users/${username}/repos?sort=updated&per_page=100&type=owner`;
    
    return this.fetchWithRetry(endpoint);
  }

  async getRepoDetails(username: string, repoName: string): Promise<{
    commitCount: number;
    languages: string[];
  }> {
    // Fetch commit count and languages in parallel
    const [commitCountResult, languagesResult] = await Promise.allSettled([
      this.getCommitCount(username, repoName),
      this.getLanguages(username, repoName)
    ]);

    return {
      commitCount: commitCountResult.status === 'fulfilled' ? commitCountResult.value : 1,
      languages: languagesResult.status === 'fulfilled' ? languagesResult.value : []
    };
  }

  private async getCommitCount(username: string, repoName: string): Promise<number> {
    try {
      // Try contributors API first (most efficient)
      const contributors = await this.fetchWithRetry(
        `${this.baseURL}/repos/${username}/${repoName}/contributors?per_page=100`
      );
      
      if (Array.isArray(contributors)) {
        return contributors.reduce((total, contributor) => 
          total + (contributor.contributions || 0), 0
        );
      }
    } catch (error) {
      console.error(`Error fetching commit count for ${repoName}:`, error);
    }
    
    return 0; // Return 0 if unable to fetch
  }

  private async getLanguages(username: string, repoName: string): Promise<string[]> {
    try {
      const languages = await this.fetchWithRetry(
        `${this.baseURL}/repos/${username}/${repoName}/languages`
      );
      return Object.keys(languages).slice(0, 4);
    } catch (error) {
      return [];
    }
  }
}

const TerminalWindow = ({ 
  children, 
  title = "kushagrash@portfolio", 
  className = "",
  glowEffect = false 
}: { 
  children: React.ReactNode; 
  title?: string; 
  className?: string;
  glowEffect?: boolean;
}) => (
  <div className={`bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden ${glowEffect ? 'terminal-glow' : ''} ${className}`}>
    <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-800/90 to-gray-700/90 border-b border-gray-600/50">
      <div className="flex items-center space-x-3">
        <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg hover:bg-red-400 transition-colors cursor-pointer"></div>
        <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-lg hover:bg-yellow-400 transition-colors cursor-pointer"></div>
        <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg hover:bg-green-400 transition-colors cursor-pointer"></div>
      </div>
      <div className="text-gray-300 text-sm font-mono flex items-center space-x-2">
        <Terminal className="w-4 h-4" />
        <span>{title}</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer">
          <Volume2 className="w-full h-full" />
        </div>
      </div>
    </div>
    <div className="p-6 font-mono text-sm relative">
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5 pointer-events-none"></div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  </div>
);

const TypewriterText = ({ 
  text, 
  delay = 0, 
  speed = 50, 
  className = "",
  onComplete 
}: { 
  text: string; 
  delay?: number; 
  speed?: number; 
  className?: string;
  onComplete?: () => void;
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentIndex < text.length) {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      } else if (onComplete) {
        onComplete();
      }
    }, currentIndex === 0 ? delay : speed);

    return () => clearTimeout(timer);
  }, [currentIndex, text, delay, speed, onComplete]);

  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorTimer);
  }, []);

  return (
    <span className={className}>
      {displayText}
      {currentIndex <= text.length && (
        <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-150`}>
          <span className="bg-green-400 text-green-400 inline-block w-2 h-5 ml-0.5 relative top-0.5 rounded-sm">█</span>
        </span>
      )}
    </span>
  );
};

const CommandLine: React.FC<{ 
  command: string; 
  output?: React.ReactNode; 
  delay?: number;
  className?: string;
  user?: string;
  host?: string;
  path?: string;
}> = ({ 
  command, 
  output, 
  delay = 0, 
  className = "",
  user = "Kushagrash",
  host = "portfolio",
  path = "~"
}) => {
  const [showCommand, setShowCommand] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setShowCommand(true), delay);
    const timer2 = setTimeout(() => setShowOutput(true), delay + command.length * 50 + 800);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [delay, command.length]);

  return (
    <div className="mb-6 group">
      <div className="flex items-center text-green-400 mb-1">
        <span className="text-blue-400 font-semibold">{user}</span>
        <span className="text-gray-500 mx-1">@</span>
        <span className="text-purple-400 font-semibold">{host}</span>
        <span className="text-gray-500 mx-2">:</span>
        <span className="text-yellow-400 font-semibold">{path}</span>
        <span className="text-green-400 mx-2 font-bold">$</span>
        {showCommand && (
          <TypewriterText 
            text={command} 
            speed={30} 
            className="text-white"
          />
        )}
      </div>
      {showOutput && output && (
        <div className="text-gray-300 ml-4 pl-4 border-l-2 border-gray-700 animate-fade-in">
          {output}
        </div>
      )}
    </div>
  );
};

const StatusIndicator = ({ status, label }: { status: 'online' | 'busy' | 'away'; label: string }) => {
  const colors = {
    online: 'bg-green-400 shadow-green-400/50',
    busy: 'bg-yellow-400 shadow-yellow-400/50',
    away: 'bg-red-400 shadow-red-400/50'
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${colors[status]} shadow-lg animate-pulse`}></div>
      <span className="text-sm text-gray-400">{label}</span>
    </div>
  );
};

const SkillDownload = ({ skill, level, delay = 0 }: { skill: string; level: number; delay?: number }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Helper functions
  const getPackageSize = () => {
    const sizes = ['12.3 kB', '4.7 MB', '892 kB', '2.1 MB', '567 kB'];
    return sizes[Math.floor(Math.random() * sizes.length)];
  };

  const getDownloadSpeed = () => {
    const speeds = ['1.2 MB/s', '847 kB/s', '2.3 MB/s', '1.8 MB/s'];
    return speeds[Math.floor(Math.random() * speeds.length)];
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDownloading(true);
      
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.random() * 15 + 5; // Random progress increment
        if (currentProgress >= level) {
          currentProgress = level;
          setIsComplete(true);
          clearInterval(interval);
          setTimeout(() => setShowDetails(true), 300);
        }
        setProgress(currentProgress);
      }, 120);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!isVisible) return null;

  return (
    <div className="group font-mono text-xs bg-gray-900/80 border border-gray-700/50 rounded-md p-2 hover:border-green-400/50 transition-all duration-300">
      {!isDownloading ? (
        <div className="text-gray-500">
          <span className="text-yellow-400">⚡</span> {skill.toLowerCase().replace(/[^a-z0-9]/g, '-')}...
        </div>
      ) : (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-cyan-400 truncate">
              📦 {skill.toLowerCase().replace(/[^a-z0-9]/g, '-')}@latest
            </span>
            {isComplete && <span className="text-green-400 text-xs">✓</span>}
          </div>
          
          <div className="flex items-center space-x-2 text-gray-400 text-xs">
            <span className="text-blue-400">FETCH</span>
            <span>{getPackageSize()}</span>
            {isDownloading && !isComplete && (
              <span className="text-green-400">{getDownloadSpeed()}</span>
            )}
          </div>

          <div className="w-full bg-gray-800 rounded-sm h-1 overflow-hidden">
            <div 
              className={`h-full transition-all duration-200 ease-out ${
                isComplete 
                  ? 'bg-green-400' 
                  : 'bg-gradient-to-r from-blue-400 to-cyan-400'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between text-gray-500 text-xs">
            <span>{Math.round(progress)}%</span>
            <span>
              {isComplete ? (
                <span className="text-green-400">DONE</span>
              ) : (
                <span className="text-yellow-400">DOWNLOADING</span>
              )}
            </span>
          </div>

          {showDetails && (
            <div className="text-gray-500 text-xs mt-1 animate-fade-in">
              <div className="text-green-400">✓ {skill} installed</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Project Card Component
const ProjectCard: React.FC<{ project: Project }> = ({ project }) => (
  <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4 sm:p-6 hover:border-green-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-400/10 group">
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
      <h3 className="text-green-400 font-semibold text-lg group-hover:text-green-300 transition-colors">
        {project.name}
      </h3>
      <div className="flex items-center gap-2 text-xs">
        <span className="text-yellow-400">⭐ {project.stargazers_count}</span>
        {project.language && (
          <span className="text-blue-400 bg-blue-400/10 px-2 py-1 rounded">
            {project.language}
          </span>
        )}
      </div>
    </div>
    
    <p className="text-gray-400 text-sm mb-4 leading-relaxed">
      {project.description || 'No description available'}
    </p>
    
    {project.topics && project.topics.length > 0 && (
      <div className="flex flex-wrap gap-1 mb-4">
        {project.topics.slice(0, 4).map((topic) => (
          <span 
            key={topic} 
            className="text-xs bg-gray-700/50 text-gray-300 px-2 py-1 rounded border border-gray-600/30"
          >
            {topic}
          </span>
        ))}
        {project.topics.length > 4 && (
          <span className="text-xs text-gray-500">+{project.topics.length - 4} more</span>
        )}
      </div>
    )}
    
    <a
      href={project.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center text-green-400 hover:text-green-300 transition-colors text-sm font-medium"
    >
      View Project <ExternalLink className="ml-1 w-3 h-3" />
    </a>
  </div>
);

// Contact Form Component
const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState<FormStatus>({ type: 'idle', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: 'loading', message: 'Sending message...' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: data.message });
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to send message' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CommandLine 
      command="vim /tmp/message.txt" 
      output={
        <div className="space-y-4">
          <div className="text-xs text-gray-500 mb-4">-- INSERT MODE --</div>
          
          {status.type === 'success' && (
            <div className="bg-green-900/50 border border-green-400/30 rounded-lg p-3 mb-4">
              <div className="text-green-400 text-sm font-mono">
                ✓ Message sent successfully! I'll get back to you soon.
              </div>
            </div>
          )}

          {status.type === 'error' && (
            <div className="bg-red-900/50 border border-red-400/30 rounded-lg p-3 mb-4">
              <div className="text-red-400 text-sm font-mono">
                ✗ Failed to send message. Please try again or email directly.
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2 font-mono">:set name=</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-3 text-gray-300 focus:border-green-400/50 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all duration-300"
                placeholder="Your name"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2 font-mono">:set email=</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-3 text-gray-300 focus:border-green-400/50 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all duration-300"
                placeholder="your@email.com"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2 font-mono">:set message=</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-3 text-gray-300 focus:border-green-400/50 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all duration-300 resize-none"
                placeholder="Your message..."
                disabled={isSubmitting}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !formData.name || !formData.email || !formData.message}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-bold transition-all duration-300 group ${
                isSubmitting || !formData.name || !formData.email || !formData.message
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-black hover:shadow-lg hover:shadow-green-400/30'
              }`}
            >
              <span>
                {isSubmitting ? ':w (sending...)' : ':wq (send)'}
              </span>
              {!isSubmitting && (
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              )}
            </button>
          </form>
        </div>
      }
      delay={0}
    />
  );
};

// Mobile Navigation Component
const MobileNav: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void;
  onNavigate: (section: string) => void;
}> = ({ isOpen, onClose, onNavigate }) => {
  const handleNavigate = (section: string) => {
    onNavigate(section);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-64 bg-gray-900/95 backdrop-blur-lg border-l border-gray-700/50 p-6">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-green-400 font-semibold">Navigation</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-green-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="space-y-4">
          <button
            onClick={() => handleNavigate('about')}
            className="flex items-center gap-3 text-gray-300 hover:text-green-400 transition-colors w-full text-left"
          >
            <Home className="w-4 h-4" />
            About
          </button>
          <button
            onClick={() => handleNavigate('projects')}
            className="flex items-center gap-3 text-gray-300 hover:text-green-400 transition-colors w-full text-left"
          >
            <Briefcase className="w-4 h-4" />
            Projects
          </button>
          <button
            onClick={() => handleNavigate('contact')}
            className="flex items-center gap-3 text-gray-300 hover:text-green-400 transition-colors w-full text-left"
          >
            <MessageSquare className="w-4 h-4" />
            Contact
          </button>
        </nav>
        
        <div className="mt-8 pt-8 border-t border-gray-700/50">
          <div className="flex gap-4">
            <a
              href="https://github.com/kushagra-sh"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-green-400 transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://linkedin.com/in/kushagra-sharma-dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-green-400 transition-colors"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="mailto:kush090605@gmail.com"
              className="text-gray-400 hover:text-green-400 transition-colors"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Portfolio Component
export default function Portfolio() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [realProjects, setRealProjects] = useState<Project[]>([]);
  const [gitCommits, setGitCommits] = useState<any[]>([]);
  const [terminalRef] = useState(useRef<HTMLDivElement>(null));
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const aboutRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  // Fetch GitHub projects
  useEffect(() => {
    const fetchGitHubProjects = async () => {
      const username = 'KushagraSharma924';
      const cacheKey = `github_projects_${username}`;
      
      try {
        console.log('[GitHub Fetch] Starting fetch for user:', username);
        // Check cache first
        const cachedData = localStorage.getItem(cacheKey);
        const cacheTimestamp = localStorage.getItem(cacheKey + '_timestamp');
        
        if (cachedData && cacheTimestamp) {
          const isExpired = Date.now() - parseInt(cacheTimestamp) > CACHE_CONFIG.PROJECTS_EXPIRY;
          if (!isExpired) {
            const parsedData = JSON.parse(cachedData);
            console.log('[GitHub Fetch] Using cached project data:', parsedData);
            setRealProjects(parsedData);
            setProjectsLoading(false);
            return;
          }
        }

        const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
        const headers: HeadersInit = {
          'Accept': 'application/vnd.github.v3+json',
        };
        
        if (token) {
          headers['Authorization'] = `token ${token}`;
        }

        console.log('[GitHub Fetch] Fetching repositories from GitHub API...');
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=30`, {
          headers
        });
        const repos = await response.json();
        console.log('[GitHub Fetch] Repositories received:', repos);
        
        if (!response.ok) {
          console.error('[GitHub Fetch] Error response from repo fetch:', response.status, repos);
          setProjectsLoading(false);
          return;
        }
        
        if (!Array.isArray(repos)) {
          console.error('[GitHub Fetch] Repos is not an array:', repos);
          setProjectsLoading(false);
          return;
        }

        const projectsData: any[] = [];
        
        // Process repos in batches to avoid rate limiting
        for (let i = 0; i < Math.min(repos.length, 30); i++) {
          const repo = repos[i];
          console.log(`[GitHub Fetch] Processing repo: ${repo.name}`);
          
          // Improved filtering for starred/curated repositories
          const repoNameLower = repo.name.toLowerCase();
          const repoDescLower = (repo.description || '').toLowerCase();
          
          const isLikelyStarred = 
            repoNameLower.includes('awesome-') || 
            repoNameLower.includes('curated') ||
            repoNameLower.includes('list-') ||
            repoDescLower.includes('curated') ||
            repoDescLower.includes('collection of') ||
            repoDescLower.includes('awesome list') ||
            repoDescLower.includes('list of') ||
            // Skip empty repos that are likely just starred/bookmarked
            (repo.size === 0 && !repo.private && repo.fork);
          
          if (isLikelyStarred) {
            console.log(`[GitHub Fetch] Skipping likely starred/curated repo: ${repo.name}`);
            continue;
          }
          
          try {
            // Get commit count using multiple methods for accuracy
            let commitCount = 0;
            
            try {
              // Method 1: Try to get commit count from contributors API (most accurate)
              console.log(`[GitHub Fetch] Fetching contributors for repo: ${repo.name}`);
              const contributorsResponse = await fetch(`https://api.github.com/repos/${username}/${repo.name}/contributors?per_page=100`, {
                headers
              });
              if (contributorsResponse.ok) {
                const contributors = await contributorsResponse.json();
                console.log(`[GitHub Fetch] Contributors for ${repo.name}:`, contributors);
                if (Array.isArray(contributors)) {
                  commitCount = contributors.reduce((total: number, contributor: any) => {
                    return total + (contributor.contributions || 0);
                  }, 0);
                }
              } else {
                console.error(`[GitHub Fetch] Error fetching contributors for ${repo.name}:`, contributorsResponse.status);
              }
            } catch (error) {
              console.error(`[GitHub Fetch] Exception fetching contributors for ${repo.name}:`, error);
            }

            // Method 2: If contributors API fails, try commits API with pagination
            if (commitCount === 0) {
              try {
                console.log(`[GitHub Fetch] Fetching commits (pagination) for repo: ${repo.name}`);
                const commitsResponse = await fetch(`https://api.github.com/repos/${username}/${repo.name}/commits?per_page=1`, {
                  headers
                });
                if (commitsResponse.ok) {
                  const linkHeader = commitsResponse.headers.get('Link');
                  if (linkHeader) {
                    const lastPageMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
                    if (lastPageMatch) {
                      commitCount = parseInt(lastPageMatch[1]);
                      console.log(`[GitHub Fetch] Commit count from pagination for ${repo.name}:`, commitCount);
                    }
                  } else {
                    // If no pagination, fetch all commits to count
                    console.log(`[GitHub Fetch] Fetching all commits for repo: ${repo.name}`);
                    const allCommitsResponse = await fetch(`https://api.github.com/repos/${username}/${repo.name}/commits`, {
                      headers
                    });
                    if (allCommitsResponse.ok) {
                      const commits = await allCommitsResponse.json();
                      commitCount = Array.isArray(commits) ? commits.length : 1;
                      console.log(`[GitHub Fetch] Commit count from all commits for ${repo.name}:`, commitCount);
                    }
                  }
                } else {
                  console.error(`[GitHub Fetch] Error fetching commits for ${repo.name}:`, commitsResponse.status);
                }
              } catch (error) {
                console.error(`[GitHub Fetch] Exception fetching commits for ${repo.name}:`, error);
                commitCount = 1; // Default to 1 if we can't get count
              }
            }

            // Get languages
            let techStack: string[] = [];
            try {
              console.log(`[GitHub Fetch] Fetching languages for repo: ${repo.name}`);
              const languagesResponse = await fetch(`https://api.github.com/repos/${username}/${repo.name}/languages`, {
                headers
              });
              if (languagesResponse.ok) {
                const languages = await languagesResponse.json();
                techStack = Object.keys(languages).slice(0, 4);
                console.log(`[GitHub Fetch] Languages for ${repo.name}:`, techStack);
              } else {
                console.error(`[GitHub Fetch] Error fetching languages for ${repo.name}:`, languagesResponse.status);
              }
            } catch (error) {
              console.error(`[GitHub Fetch] Exception fetching languages for ${repo.name}:`, error);
            }

            // If no languages detected from API, use repo.language
            if (techStack.length === 0 && repo.language) {
              techStack = [repo.language];
            }
            if (techStack.length === 0) {
              techStack = ['Code'];
            }

            // Include repositories with commits or if they're private (private repos might be in development)
            if (commitCount > 0 || repo.private) {
              projectsData.push({
                name: repo.name,
                description: repo.description || 'No description available',
                tech: techStack,
                status: repo.private ? 'private' : (repo.fork ? 'fork' : 'public'),
                stars: repo.stargazers_count || 0,
                forks: repo.forks_count || 0,
                updated: new Date(repo.updated_at).toLocaleDateString(),
                commitCount: commitCount,
                url: repo.html_url,
                html_url: repo.html_url,
                stargazers_count: repo.stargazers_count || 0,
                language: repo.language || 'Code',
                size: repo.size || 0,
                createdAt: new Date(repo.created_at),
                pushedAt: new Date(repo.pushed_at || repo.updated_at),
                topics: repo.topics || []
              });
              console.log(`[GitHub Fetch] Added project: ${repo.name}, commits: ${commitCount}, tech:`, techStack);
            }

            // Add small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 150));

          } catch (error) {
            console.error(`[GitHub Fetch] Exception processing repo ${repo.name}:`, error);
            // Add basic info for any repo that's not likely starred (including forks you've worked on)
            if (!isLikelyStarred) {
              projectsData.push({
                name: repo.name,
                description: repo.description || 'No description available',
                tech: [repo.language || 'Code'],
                status: repo.private ? 'private' : (repo.fork ? 'fork' : 'public'),
                stars: repo.stargazers_count || 0,
                forks: repo.forks_count || 0,
                updated: new Date(repo.updated_at).toLocaleDateString(),
                commitCount: repo.private ? 1 : (repo.size > 0 ? 1 : 0), // Assume private repos have commits
                url: repo.html_url,
                html_url: repo.html_url,
                stargazers_count: repo.stargazers_count || 0,
                language: repo.language || 'Code',
                size: repo.size || 0,
                createdAt: new Date(repo.created_at),
                pushedAt: new Date(repo.pushed_at || repo.updated_at),
                topics: repo.topics || []
              });
              console.log(`[GitHub Fetch] Fallback added project: ${repo.name}`);
            }
          }
        }
        
        // Sort by last updated date (most recent first), then by commit count as secondary
        projectsData.sort((a, b) => {
          // Primary sort: by last updated/pushed date (most recent first)
          const dateA = a.pushedAt.getTime();
          const dateB = b.pushedAt.getTime();
          if (dateB !== dateA) {
            return dateB - dateA;
          }
          // Secondary sort: by commit count if dates are the same
          return b.commitCount - a.commitCount;
        });

        const finalProjects = projectsData.slice(0, 15); // Show top 15 projects
        console.log('[GitHub Fetch] Final sorted projects:', finalProjects);
        
        // Cache the results
        localStorage.setItem(cacheKey, JSON.stringify(finalProjects));
        localStorage.setItem(cacheKey + '_timestamp', Date.now().toString());
        
        setRealProjects(finalProjects);
        setProjectsLoading(false);
        
        // Fetch recent commits from multiple repos
        const commitPromises = finalProjects.slice(0, 5).map(async (project) => {
          try {
            console.log(`[GitHub Fetch] Fetching recent commits for repo: ${project.name}`);
            const commitsResponse = await fetch(`https://api.github.com/repos/${username}/${project.name}/commits?per_page=3`, {
              headers
            });
            if (commitsResponse.ok) {
              const commits = await commitsResponse.json();
              console.log(`[GitHub Fetch] Recent commits for ${project.name}:`, commits);
              return commits.map((commit: any) => ({
                sha: commit.sha.substring(0, 7),
                message: commit.commit.message.split('\n')[0].substring(0, 50),
                repo: project.name
              }));
            } else {
              console.error(`[GitHub Fetch] Error fetching commits for ${project.name}:`, commitsResponse.status);
            }
          } catch (error) {
            console.error(`Error fetching commits for ${project.name}:`, error);
          }
          return [];
        });

        const allCommits = await Promise.all(commitPromises);
        const flatCommits = allCommits.flat().slice(0, 10);
        console.log('[GitHub Fetch] All recent commits:', flatCommits);
        setGitCommits(flatCommits);
        setLoading(false);
        
      } catch (error) {
        console.error('Error fetching GitHub projects:', error);
        
        setProjectsLoading(false);
        setLoading(false);
      }
    };

    fetchGitHubProjects();
  }, []);

  const skills = [
    { name: "JavaScript/TypeScript", level: 95 },
    { name: "React/Next.js", level: 92 },
    { name: "Node.js", level: 88 },
    { name: "Python", level: 85 },
    { name: "PostgreSQL", level: 82 },
    { name: "Docker/Kubernetes", level: 78 },
    { name: "AWS/Cloud", level: 80 },
    { name: "Machine Learning", level: 75 }
  ];

  const experience = [
    {
      role: "SDE Intern",
      company: "MediHut Pharma (CureZip)",
      period: "Feb 2025 - Present",
      description: "Leading backend development for pharmacy automation and prescription processing.",
      achievements: ["Built REST APIs for prescription parsing using Google Vision API", "Improved backend-frontend sync, reducing latency by 30%", "Automated pharmacy workflows for digital prescription handling"]
    },
    {
      role: "Research Intern",
      company: "CSIR-National Physical Laboratory (NPL)",
      period: "Jun 2025 - Present",
      description: "Exploring memristive systems for educational applications.",
      achievements: ["Studied memristors for interactive STEM learning tools", "Built e-textile circuits for low-cost classroom demonstrations"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-green-400 p-4 md:p-8 relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 animate-gradient-x"></div>
        <div className="matrix-rain"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Enhanced Header */}
        <div className="mb-8">
          <TerminalWindow title="kushagrash@portfolio: ~" glowEffect={true} className="terminal-window">
            <div ref={terminalRef} className="max-h-96 overflow-y-auto custom-scrollbar">
              <CommandLine 
                command="neofetch" 
                output={
                  <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <div className="text-cyan-400 text-2xl font-bold mb-2 flex items-center space-x-2">
                          <User className="w-6 h-6" />
                          <span>Kushagra Sharma</span>
                        </div>
                        <div className="text-gray-300 mb-2"> Backend and DevOps Developer</div>
                        <div className="text-gray-400 text-sm mb-4">📍 Pune, Maharashtra</div>
                        <StatusIndicator status="online" label="Available for opportunities" />
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">OS:</span>
                          <span className="text-green-400">macOS Sequoia</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Shell:</span>
                          <span className="text-green-400">zsh 2.14</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Editor:</span>
                          <span className="text-green-400">VS Code</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Languages:</span>
                          <span className="text-green-400">3+</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Experience:</span>
                          <span className="text-green-400">1.5 years</span>
                        </div>
                      </div>
                    </div>
                  </div>
                }
                delay={0}
              />
              
              <CommandLine 
                command="git log --oneline --graph --decorate" 
                output={
                  <div className="space-y-1 font-mono text-xs">
                    {loading ? (
                      <div className="text-gray-400">Loading recent commits...</div>
                    ) : (
                      gitCommits.map((commit, index) => {
                        const colors = ['text-yellow-400', 'text-green-400', 'text-blue-400', 'text-purple-400', 'text-cyan-400'];
                        const color = colors[index % colors.length];
                        return (
                          <div key={commit.sha} className={color}>
                            * {commit.sha} {index === 0 ? '(HEAD -> main) ' : ''}{commit.message}
                            {commit.repo && <span className="text-gray-500 ml-2">({commit.repo})</span>}
                          </div>
                        );
                      })
                    )}
                  </div>
                }
                delay={2000}
              />

              <CommandLine 
                command="ps aux | grep creativity" 
                output={
                  <div className="space-y-1 text-xs">
                    <div className="text-green-400">kushagrash   1337  0.0  0.1  innovation.js    running</div>
                    <div className="text-blue-400">kushagrash   2048  0.0  0.2  problem-solving  active</div>
                    <div className="text-purple-400">kushagrash    4096  0.0  0.1  code-quality     optimizing</div>
                    <div className="text-yellow-400">kushagrash    8192  0.0  0.3  collaboration    engaged</div>
                  </div>
                }
                delay={4000}
              />
            </div>
          </TerminalWindow>
        </div>

        {/* Enhanced Navigation */}
        <div className="mb-8">
          <TerminalWindow title="navigation.sh" className="terminal-window">
            <div className="flex flex-wrap gap-3">
              {[
                { cmd: 'projects', icon: Folder, desc: 'View my work' },
                { cmd: 'experience', icon: Code, desc: 'Career journey' },
                { cmd: 'skills', icon: Zap, desc: 'Technical expertise' },
                { cmd: 'contact', icon: Mail, desc: 'Get in touch' },
                { cmd: 'resume', icon: File, desc: 'Download CV', href: '/resume.pdf' }
              ].map((item) => (
                item.href ? (
                  <a
                    key={item.cmd}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center space-x-3 px-6 py-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border border-gray-600/50 hover:border-green-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-400/10"
                  >
                    <item.icon className="w-5 h-5 text-green-400 group-hover:text-cyan-400 transition-colors" />
                    <div className="text-left">
                      <div className="text-white font-mono">./{item.cmd}</div>
                      <div className="text-xs text-gray-400 group-hover:text-gray-300">{item.desc}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-green-400 transition-colors" />
                  </a>
                ) : (
                  <button
                    key={item.cmd}
                    className="group flex items-center space-x-3 px-6 py-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border border-gray-600/50 hover:border-green-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-400/10"
                  >
                    <item.icon className="w-5 h-5 text-green-400 group-hover:text-cyan-400 transition-colors" />
                    <div className="text-left">
                      <div className="text-white font-mono">./{item.cmd}</div>
                      <div className="text-xs text-gray-400 group-hover:text-gray-300">{item.desc}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-green-400 transition-colors" />
                  </button>
                )
              ))}
            </div>
          </TerminalWindow>
        </div>

        {/* Enhanced Projects Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <TerminalWindow title="top-repos.json" className="terminal-window">
            <CommandLine 
              command="cat top-repos.json | jq '.mostActive[] | sort_by(.updated) | reverse'" 
              output={
                <div className="space-y-6">
                  {projectsLoading ? (
                    <div className="text-gray-400 text-center py-8">🔍 Analyzing repositories (including private repos)...</div>
                  ) : realProjects.length > 0 ? (
                    <>
                      <div className="text-sm text-green-400 mb-4 font-mono">
                        🏆 Most recently updated repositories (your latest work)
                      </div>
                      {realProjects.slice(0, 2).map((project, index) => (
                        <ProjectCard key={index} project={project} />
                      ))}
                    </>
                  ) : (
                    <div className="text-gray-400 text-center py-8">No repositories found</div>
                  )}
                </div>
              }
              delay={0}
            />
          </TerminalWindow>

          <TerminalWindow title="package-manager.log" className="terminal-window">
            <CommandLine 
              command="npm install @skills/*" 
              output={
                <div className="space-y-2">
                  <div className="text-green-400 text-xs mb-3 font-mono">
                    🚀 Installing skill packages...
                  </div>
                  <div className="space-y-1.5">
                    {skills.slice(0, 4).map((skill, index) => (
                      <SkillDownload 
                        key={index} 
                        skill={skill.name} 
                        level={skill.level} 
                        delay={index * 600}
                      />
                    ))}
                  </div>
                </div>
              }
              delay={0}
            />
          </TerminalWindow>
        </div>



        {/* Enhanced Experience Section */}
        <div className="mb-8">
          <TerminalWindow title="experience.log" className="terminal-window">
            <CommandLine 
              command="tail -f /var/log/career.log" 
              output={
                <div className="space-y-6">
                  {experience.map((exp, index) => (
                    <div key={index} className="border-l-2 border-green-400/50 pl-6 relative">
                      <div className="absolute -left-2 top-0 w-4 h-4 bg-green-400 rounded-full shadow-lg shadow-green-400/50"></div>
                      <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4 hover:border-green-400/50 transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-cyan-400 font-bold text-lg">{exp.role}</h3>
                          <span className="text-xs bg-gray-700/50 text-gray-400 px-2 py-1 rounded">{exp.period}</span>
                        </div>
                        <div className="text-purple-400 font-medium mb-2">{exp.company}</div>
                        <p className="text-gray-300 text-sm mb-3 leading-relaxed">{exp.description}</p>
                        <div className="space-y-1">
                          {exp.achievements.map((achievement, achIndex) => (
                            <div key={achIndex} className="flex items-center space-x-2 text-xs text-gray-400">
                              <ChevronRight className="w-3 h-3 text-green-400" />
                              <span>{achievement}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              }
              delay={0}
            />
          </TerminalWindow>
        </div>

        {/* Enhanced Contact Section */}
        <div className="grid lg:grid-cols-2 gap-8">
          <TerminalWindow title="contact.sh" className="terminal-window">
            <CommandLine 
              command="curl -X GET https://api.kushagrash.dev/contact" 
              output={
                <div className="space-y-6">
                  <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4">
                    <pre className="text-gray-300 text-sm">
{`{
  "status": "200 OK",
  "data": {
    "email": "kush090605@gmail.com",
    "github": "github.com/KushagraSharma924",
    "linkedin": "linkedin.com/in/kushagrashh",
    "location": "Pune,Maharashtra",
    "timezone": "PST (UTC-8)",
    "availability": "open_to_opportunities"
  }
}`}
                    </pre>
                  </div>
                  
                  <div className="flex space-x-4">
                    {[
                      { icon: Mail, label: 'Email', href: 'mailto:kush090605@gmail.com' },
                      { icon: Github, label: 'GitHub', href: 'https://github.com/KushagraSharma924/' },
                      { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/kushagrashh/' }
                    ].map((social, index) => (
                      <a
                        key={index}
                        href={social.href}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border border-gray-600/50 hover:border-green-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-400/10 group"
                      >
                        <social.icon className="w-4 h-4 text-green-400 group-hover:text-cyan-400 transition-colors" />
                        <span className="text-gray-300 text-sm">{social.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              }
              delay={0}
            />
          </TerminalWindow>

          <TerminalWindow title="message.vim" className="terminal-window">
            <ContactForm />
          </TerminalWindow>
        </div>

        {/* Enhanced Footer */}
        <div className="mt-12 text-center">
          <TerminalWindow title="footer.sh" className="terminal-window">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <Coffee className="w-4 h-4" />
                  <span>Powered by caffeine</span>
                </div>
                <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                <div className="flex items-center space-x-2">
                  <Code className="w-4 h-4" />
                  <span>Built with Next.js</span>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-gray-400 font-mono text-sm">© 2025 Kushagra Sharma. All rights reserved.</span>
                <a 
                  href="https://coff.ee/kushagrash" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-yellow-400 hover:text-yellow-300 transition-colors duration-300 font-mono text-sm ml-2"
                >
                  <Coffee className="w-3 h-3" />
                  <span>Buy me a Coffee</span>
                </a>
                <span className="bg-green-400 text-green-400 inline-block w-2 h-4 ml-1 animate-pulse rounded-sm">█</span>
              </div>
            </div>
          </TerminalWindow>
        </div>
      </div>
    </div>
  );
}