"use client";

import { useState, useEffect, useRef } from 'react';
import { Terminal, Folder, File, User, Mail, Github, Linkedin, ExternalLink, ChevronRight, Code, Database, Globe, Zap, Coffee, Star, GitBranch, Play, Pause, Volume2, VolumeX } from 'lucide-react';

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

const CommandLine = ({ 
  command, 
  output, 
  delay = 0,
  user = "Kushagrash",
  host = "portfolio",
  path = "~"
}: { 
  command: string; 
  output?: React.ReactNode; 
  delay?: number;
  user?: string;
  host?: string;
  path?: string;
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

const SkillBadge = ({ skill, level }: { skill: string; level: number }) => (
  <div className="group relative">
    <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 hover:border-green-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-400/10">
      <div className="text-gray-300 text-sm font-medium mb-1">{skill}</div>
      <div className="w-full bg-gray-700 rounded-full h-1">
        <div 
          className="bg-gradient-to-r from-green-400 to-blue-400 h-1 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${level}%` }}
        ></div>
      </div>
    </div>
  </div>
);

const ProjectCard = ({ project, index }: { project: any; index: number }) => (
  <div 
    className="group bg-gray-800/30 border border-gray-700/50 rounded-xl p-6 hover:border-green-400/50 transition-all duration-500 hover:shadow-xl hover:shadow-green-400/10 hover:bg-gray-800/50"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <Folder className="w-5 h-5 text-blue-400" />
        <h3 className="text-cyan-400 font-bold text-lg group-hover:text-green-400 transition-colors">
          {project.name}
        </h3>
      </div>
      <div className="flex items-center space-x-2">
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
          project.status === 'public' 
            ? 'bg-green-900/50 text-green-400 border border-green-400/30' 
            : project.status === 'private'
            ? 'bg-red-900/50 text-red-400 border border-red-400/30'
            : project.status === 'fork'
            ? 'bg-blue-900/50 text-blue-400 border border-blue-400/30'
            : 'bg-yellow-900/50 text-yellow-400 border border-yellow-400/30'
        }`}>
          {project.status}
        </span>
        {project.url && (
          <a href={project.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-green-400 transition-colors cursor-pointer" />
          </a>
        )}
      </div>
    </div>
    
    <p className="text-gray-300 text-sm mb-4 leading-relaxed">{project.description}</p>
    
    <div className="flex flex-wrap gap-2 mb-4">
      {project.tech.map((tech: string, techIndex: number) => (
        <span 
          key={techIndex} 
          className="text-xs bg-gray-700/50 text-gray-400 px-2 py-1 rounded border border-gray-600/30 hover:border-green-400/50 hover:text-green-400 transition-all duration-300"
        >
          {tech}
        </span>
      ))}
    </div>

    <div className="flex items-center justify-between text-xs text-gray-500">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <Star className="w-3 h-3" />
          <span>{project.stars || '0'}</span>
        </div>
        <div className="flex items-center space-x-1">
          <GitBranch className="w-3 h-3" />
          <span>{project.forks || '0'}</span>
        </div>
        {project.commitCount !== undefined && (
          <div className="flex items-center space-x-1">
            <Code className="w-3 h-3" />
            <span>{project.commitCount} commits</span>
          </div>
        )}
      </div>
      <span>Updated {project.updated || '2 days ago'}</span>
    </div>
  </div>
);

export default function Home() {
  const [currentSection, setCurrentSection] = useState('welcome');
  const [isPlaying, setIsPlaying] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const [gitCommits, setGitCommits] = useState<any[]>([]);
  const [realProjects, setRealProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);

  // Fetch real GitHub data with localStorage caching
  useEffect(() => {
    const fetchGitHubData = async () => {
      const cacheKey = 'github_commits_data';
      const cacheExpiry = 15 * 60 * 1000; // 15 minutes cache
      
      try {
        // Check localStorage first
        const cachedData = localStorage.getItem(cacheKey);
        const cacheTimestamp = localStorage.getItem(cacheKey + '_timestamp');
        
        if (cachedData && cacheTimestamp) {
          const isExpired = Date.now() - parseInt(cacheTimestamp) > cacheExpiry;
          if (!isExpired) {
            setGitCommits(JSON.parse(cachedData));
            setLoading(false);
            return;
          }
        }

        const username = 'KushagraSharma924';
        const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5`);
        const repos = await reposResponse.json();
        
        const commitsData: any[] = [];
        for (const repo of repos.slice(0, 3)) {

          try {
            const commitsResponse = await fetch(`https://api.github.com/repos/${username}/${repo.name}/commits?per_page=2`);
            const commits = await commitsResponse.json();
            
            if (Array.isArray(commits)) {
              commits.forEach(commit => {
                commitsData.push({
                  sha: commit.sha.substring(0, 7),
                  message: commit.commit.message.split('\n')[0],
                  date: new Date(commit.commit.author.date),
                  repo: repo.name,
                  author: commit.commit.author.name
                });
              });
            }
          } catch (error) {
            // Silent error handling for individual repos
          }
        }
        
        // Sort commits by date (newest first)
        commitsData.sort((a, b) => b.date - a.date);
        const finalCommits = commitsData.slice(0, 5);
        
        // Cache the results
        localStorage.setItem(cacheKey, JSON.stringify(finalCommits));
        localStorage.setItem(cacheKey + '_timestamp', Date.now().toString());
        
        setGitCommits(finalCommits);
        setLoading(false);
      } catch (error) {
        // Fallback to mock data
        const fallbackCommits = [
          { sha: '2f8a9c3', message: 'feat: Enhanced terminal UI with advanced animations', repo: 'portfolio', author: 'Kushagra Sharma' },
          { sha: '1a7b2d4', message: 'feat: Added smooth scroll navigation and parallax effects', repo: 'portfolio', author: 'Kushagra Sharma' },
          { sha: '9e5f1c8', message: 'feat: Implemented typewriter animations and terminal windows', repo: 'portfolio', author: 'Kushagra Sharma' },
          { sha: '4d3a7b2', message: 'feat: Created responsive portfolio layout', repo: 'portfolio', author: 'Kushagra Sharma' },
          { sha: '8c1f5e9', message: 'initial: Portfolio foundation with Next.js and Tailwind', repo: 'portfolio', author: 'Kushagra Sharma' }
        ];
        setGitCommits(fallbackCommits);
        setLoading(false);
      }
    };

    fetchGitHubData();
  }, []);

  // Fetch real GitHub projects with localStorage caching
  useEffect(() => {
    const fetchGitHubProjects = async () => {
      const cacheKey = 'github_projects_data';
      const cacheExpiry = 30 * 60 * 1000; // 30 minutes cache for projects
      
      try {
        // Check localStorage first
        const cachedData = localStorage.getItem(cacheKey);
        const cacheTimestamp = localStorage.getItem(cacheKey + '_timestamp');
        
        if (cachedData && cacheTimestamp) {
          const isExpired = Date.now() - parseInt(cacheTimestamp) > cacheExpiry;
          if (!isExpired) {
            setRealProjects(JSON.parse(cachedData));
            setProjectsLoading(false);
            return;
          }
        }

        const username = 'KushagraSharma924';
        
        // GitHub token for accessing private repos from environment
        const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
        
        const headers: Record<string, string> = {
          'Accept': 'application/vnd.github.v3+json',
        };

        // Add authorization if token is available
        if (token) {
          headers['Authorization'] = `token ${token}`;
        }
        
        // Use authenticated endpoint to get all repos including private ones
        const reposResponse = await fetch(`https://api.github.com/user/repos?sort=updated&per_page=100&affiliation=owner`, {
          headers
        });
        const repos = await reposResponse.json();
        
        if (!reposResponse.ok) {
          setProjectsLoading(false);
          return;
        }
        
        if (!Array.isArray(repos)) {
          setProjectsLoading(false);
          return;
        }

        const projectsData: any[] = [];
        
        // Process repos in batches to avoid rate limiting
        for (let i = 0; i < Math.min(repos.length, 30); i++) {
          const repo = repos[i];
          
          // Improved filtering for starred/curated repositories
          const repoNameLower = repo.name.toLowerCase();
          const repoDescLower = (repo.description || '').toLowerCase();
          
          const isLikelyStarred = 
            repoNameLower.includes('awesome-') || 
            repoNameLower.includes('curated') ||
            repoNameLower.includes('list-') ||
            repoNameLower.includes('resources') ||
            repoDescLower.includes('curated') ||
            repoDescLower.includes('collection of') ||
            repoDescLower.includes('awesome list') ||
            repoDescLower.includes('list of') ||
            // Skip empty repos that are likely just starred/bookmarked
            (repo.size === 0 && !repo.private && repo.fork);
          
          if (isLikelyStarred) {
            continue;
          }
          
          try {
            // Get commit count using multiple methods for accuracy
            let commitCount = 0;
            
            try {
              // Method 1: Try to get commit count from contributors API (most accurate)
              const contributorsResponse = await fetch(`https://api.github.com/repos/${username}/${repo.name}/contributors?per_page=100`, {
                headers
              });
              if (contributorsResponse.ok) {
                const contributors = await contributorsResponse.json();
                if (Array.isArray(contributors)) {
                  commitCount = contributors.reduce((total: number, contributor: any) => {
                    return total + (contributor.contributions || 0);
                  }, 0);
                }
              }
            } catch (error) {
              // Silent error handling
            }

            // Method 2: If contributors API fails, try commits API with pagination
            if (commitCount === 0) {
              try {
                const commitsResponse = await fetch(`https://api.github.com/repos/${username}/${repo.name}/commits?per_page=1`, {
                  headers
                });
                if (commitsResponse.ok) {
                  const linkHeader = commitsResponse.headers.get('Link');
                  if (linkHeader) {
                    const lastPageMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
                    if (lastPageMatch) {
                      commitCount = parseInt(lastPageMatch[1]);
                    }
                  } else {
                    // If no pagination, fetch all commits to count
                    const allCommitsResponse = await fetch(`https://api.github.com/repos/${username}/${repo.name}/commits`, {
                      headers
                    });
                    if (allCommitsResponse.ok) {
                      const commits = await allCommitsResponse.json();
                      commitCount = Array.isArray(commits) ? commits.length : 1;
                    }
                  }
                }
              } catch (error) {
                commitCount = 1; // Default to 1 if we can't get count
              }
            }

            // Get languages
            let techStack: string[] = [];
            try {
              const languagesResponse = await fetch(`https://api.github.com/repos/${username}/${repo.name}/languages`, {
                headers
              });
              if (languagesResponse.ok) {
                const languages = await languagesResponse.json();
                techStack = Object.keys(languages).slice(0, 4);
              }
            } catch (error) {
              // Silent error handling
            }

            // Use repo.language as fallback
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
                language: repo.language || 'Code',
                size: repo.size || 0,
                createdAt: new Date(repo.created_at),
                pushedAt: new Date(repo.pushed_at || repo.updated_at)
              });
            }

            // Add small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 150));

          } catch (error) {
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
                language: repo.language || 'Code',
                size: repo.size || 0,
                createdAt: new Date(repo.created_at),
                pushedAt: new Date(repo.pushed_at || repo.updated_at)
              });
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
        
        // Cache the results
        localStorage.setItem(cacheKey, JSON.stringify(finalProjects));
        localStorage.setItem(cacheKey + '_timestamp', Date.now().toString());
        
        setRealProjects(finalProjects);
        setProjectsLoading(false);
      } catch (error) {
        // Fallback: Try without authentication to get public repos
        try {
          const fallbackResponse = await fetch(`https://api.github.com/users/KushagraSharma924/repos?sort=updated&per_page=50&type=owner`);
          const fallbackRepos = await fallbackResponse.json();
          
          if (Array.isArray(fallbackRepos) && fallbackRepos.length > 0) {
            const fallbackProjects = fallbackRepos
              .filter(repo => {
                // Accept all repos that have some activity, including forks
                const repoNameLower = repo.name.toLowerCase();
                const repoDescLower = (repo.description || '').toLowerCase();
                
                const isLikelyStarred = 
                  repoNameLower.includes('awesome-') || 
                  repoNameLower.includes('curated') ||
                  repoNameLower.includes('list-') ||
                  repoDescLower.includes('curated') ||
                  repoDescLower.includes('collection of');
                
                return !isLikelyStarred && repo.size > 0;
              })
              .slice(0, 10)
              .map(repo => ({
                name: repo.name,
                description: repo.description || 'No description available',
                tech: [repo.language || 'Code'],
                status: repo.fork ? 'fork' : 'public',
                stars: repo.stargazers_count || 0,
                forks: repo.forks_count || 0,
                updated: new Date(repo.updated_at).toLocaleDateString(),
                commitCount: 1,
                url: repo.html_url,
                language: repo.language || 'Code',
                size: repo.size || 0,
                createdAt: new Date(repo.created_at),
                pushedAt: new Date(repo.pushed_at || repo.updated_at)
              }));
            
            // Cache fallback results too
            localStorage.setItem(cacheKey, JSON.stringify(fallbackProjects));
            localStorage.setItem(cacheKey + '_timestamp', Date.now().toString());
            
            setRealProjects(fallbackProjects);
          }
        } catch (fallbackError) {
          // Silent error handling
        }
        
        setProjectsLoading(false);
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
                { cmd: 'contact', icon: Mail, desc: 'Get in touch' }
              ].map((item) => (
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
                        <ProjectCard key={index} project={project} index={index} />
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

          <TerminalWindow title="skills.db" className="terminal-window">
            <CommandLine 
              command="SELECT * FROM skills ORDER BY proficiency DESC;" 
              output={
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    {skills.slice(0, 6).map((skill, index) => (
                      <SkillBadge key={index} skill={skill.name} level={skill.level} />
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
            <CommandLine 
              command="vim /tmp/message.txt" 
              output={
                <div className="space-y-4">
                  <div className="text-xs text-gray-500 mb-4">-- INSERT MODE --</div>
                  <form className="space-y-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2 font-mono">:set name=</label>
                      <input
                        type="text"
                        className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-3 text-gray-300 focus:border-green-400/50 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all duration-300"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2 font-mono">:set email=</label>
                      <input
                        type="email"
                        className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-3 text-gray-300 focus:border-green-400/50 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all duration-300"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2 font-mono">:set message=</label>
                      <textarea
                        rows={4}
                        className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-3 text-gray-300 focus:border-green-400/50 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all duration-300 resize-none"
                        placeholder="Your message..."
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-black px-6 py-3 rounded-lg font-bold transition-all duration-300 hover:shadow-lg hover:shadow-green-400/30 group"
                    >
                      <span>:wq (send)</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </form>
                </div>
              }
              delay={0}
            />
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
                <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4" />
                  <span>Terminal aesthetic</span>
                </div>
              </div>
              <TypewriterText 
                text="© 2025 Kushagra Sharma. All rights reserved. Buy me a Coffee" 
                delay={1000}
                speed={30}
                className="text-gray-400 font-mono text-sm"
              />
            </div>
          </TerminalWindow>
        </div>
      </div>
    </div>
  );
}