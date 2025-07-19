"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  User, 
  Code, 
  Mail, 
  Github, 
  Linkedin, 
  ExternalLink, 
  ChevronRight,
  Download,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  Menu,
  X,
  Home,
  Briefcase,
  MessageSquare
} from 'lucide-react';

// Types
interface Project {
  id: string;
  name: string;
  description: string;
  html_url: string;
  language: string;
  stargazers_count: number;
  topics: string[];
  updated_at: string;
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

// Terminal Command Component
const TerminalCommand: React.FC<{ 
  command: string; 
  output?: React.ReactNode; 
  delay?: number;
  className?: string;
}> = ({ command, output, delay = 0, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!isVisible) return null;

  return (
    <div className={`mb-4 animate-fade-in ${className}`}>
      <div className="flex items-center text-green-400 mb-2">
        <span className="text-blue-400 font-semibold">kushagra</span>
        <span className="text-gray-400">@</span>
        <span className="text-purple-400 font-semibold">portfolio</span>
        <span className="text-yellow-400 ml-1">~</span>
        <span className="text-green-400 ml-1 font-bold">$</span>
        <span className="ml-2 text-gray-300">{command}</span>
      </div>
      {output && <div className="ml-4 text-gray-300">{output}</div>}
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-green-400 text-sm font-medium mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-3 text-gray-300 focus:border-green-400/50 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all duration-300"
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-green-400 text-sm font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-3 text-gray-300 focus:border-green-400/50 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all duration-300"
            placeholder="your.email@example.com"
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="message" className="block text-green-400 text-sm font-medium mb-2">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={5}
          className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-3 text-gray-300 focus:border-green-400/50 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all duration-300 resize-none"
          placeholder="Your message..."
        />
      </div>

      {status.message && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
          status.type === 'success' 
            ? 'bg-green-400/10 text-green-400 border border-green-400/20' 
            : status.type === 'error'
            ? 'bg-red-400/10 text-red-400 border border-red-400/20'
            : 'bg-blue-400/10 text-blue-400 border border-blue-400/20'
        }`}>
          {status.type === 'success' && <CheckCircle className="w-4 h-4" />}
          {status.type === 'error' && <AlertCircle className="w-4 h-4" />}
          {status.type === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
          {status.message}
        </div>
      )}

      <button
        type="submit"
        disabled={status.type === 'loading'}
        className="w-full sm:w-auto bg-green-400/10 border border-green-400/30 text-green-400 px-6 py-3 rounded-lg hover:bg-green-400/20 hover:border-green-400/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
      >
        {status.type === 'loading' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        {status.type === 'loading' ? 'Sending...' : 'Send Message'}
      </button>
    </form>
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const aboutRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  // Fetch GitHub projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
        const headers: HeadersInit = {
          'Accept': 'application/vnd.github.v3+json',
        };
        
        if (token) {
          headers['Authorization'] = `token ${token}`;
        }

        const response = await fetch('https://api.github.com/users/kushagra-sh/repos?sort=updated&per_page=6', {
          headers
        });
        
        if (response.ok) {
          const data = await response.json();
          setProjects(data.filter((repo: any) => !repo.fork && repo.name !== 'kushagra-sh'));
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const scrollToSection = (section: string) => {
    const refs = {
      about: aboutRef,
      projects: projectsRef,
      contact: contactRef
    };
    
    refs[section as keyof typeof refs]?.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <div className="min-h-screen bg-black text-green-400 relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900/20 via-black to-gray-900/20 pointer-events-none" />
      <div className="matrix-rain" />
      
      {/* Mobile Navigation */}
      <MobileNav 
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        onNavigate={scrollToSection}
      />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-lg border-b border-gray-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Terminal className="w-6 h-6 text-green-400" />
              <span className="font-semibold text-lg hidden sm:inline">kushagra@portfolio</span>
              <span className="font-semibold text-lg sm:hidden">kushagra</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <button
                onClick={() => scrollToSection('about')}
                className="text-gray-300 hover:text-green-400 transition-colors"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection('projects')}
                className="text-gray-300 hover:text-green-400 transition-colors"
              >
                Projects
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="text-gray-300 hover:text-green-400 transition-colors"
              >
                Contact
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden text-gray-300 hover:text-green-400 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-6xl mx-auto">
            <div className="terminal-window bg-gray-900/80 backdrop-blur-lg border border-gray-700/50 rounded-lg shadow-2xl terminal-glow">
              {/* Terminal Header */}
              <div className="terminal-chrome flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="terminal-chrome-button close"></div>
                  <div className="terminal-chrome-button minimize"></div>
                  <div className="terminal-chrome-button maximize"></div>
                </div>
                <div className="text-gray-400 text-sm font-medium hidden sm:block">
                  kushagra@portfolio: ~
                </div>
                <div className="w-16"></div>
              </div>

              {/* Terminal Content */}
              <div className="p-4 sm:p-6 lg:p-8 space-y-6 custom-scrollbar max-h-[80vh] overflow-y-auto">
                <TerminalCommand
                  command="whoami"
                  output={
                    <div className="space-y-2">
                      <div className="text-green-400 font-semibold text-xl sm:text-2xl">Kushagra Sharma</div>
                      <div className="text-gray-400">Backend & DevOps Developer</div>
                    </div>
                  }
                  delay={500}
                />

                <TerminalCommand
                  command="cat about.txt"
                  output={
                    <div className="space-y-3 text-gray-300 leading-relaxed">
                      <p>
                        Passionate backend developer with expertise in building scalable systems 
                        and robust APIs. I specialize in cloud infrastructure, microservices 
                        architecture, and DevOps practices.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div>
                          <div className="text-green-400 font-semibold mb-2">Backend</div>
                          <div className="text-sm space-y-1">
                            <div>• Node.js, Python, Go</div>
                            <div>• Express, FastAPI, Gin</div>
                            <div>• PostgreSQL, MongoDB, Redis</div>
                          </div>
                        </div>
                        <div>
                          <div className="text-green-400 font-semibold mb-2">DevOps</div>
                          <div className="text-sm space-y-1">
                            <div>• Docker, Kubernetes</div>
                            <div>• AWS, GCP, Azure</div>
                            <div>• CI/CD, Terraform</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                  delay={1500}
                />

                <TerminalCommand
                  command="ls -la social/"
                  output={
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-4">
                        <a
                          href="https://github.com/kushagra-sh"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Github className="w-4 h-4" />
                          <span className="text-sm sm:text-base">github.com/kushagra-sh</span>
                        </a>
                        <a
                          href="https://linkedin.com/in/kushagra-sharma-dev"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Linkedin className="w-4 h-4" />
                          <span className="text-sm sm:text-base">linkedin.com/in/kushagra-sharma-dev</span>
                        </a>
                      </div>
                      <a
                        href="/resume.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors mt-3"
                      >
                        <Download className="w-4 h-4" />
                        <span className="text-sm sm:text-base">Download Resume</span>
                      </a>
                    </div>
                  }
                  delay={2500}
                />

                <TerminalCommand
                  command="echo 'Ready to collaborate on your next project!'"
                  output={
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={() => scrollToSection('projects')}
                        className="flex items-center gap-2 bg-green-400/10 border border-green-400/30 text-green-400 px-4 py-2 rounded-lg hover:bg-green-400/20 hover:border-green-400/50 transition-all duration-300"
                      >
                        <Code className="w-4 h-4" />
                        View Projects
                      </button>
                      <button
                        onClick={() => scrollToSection('contact')}
                        className="flex items-center gap-2 bg-blue-400/10 border border-blue-400/30 text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-400/20 hover:border-blue-400/50 transition-all duration-300"
                      >
                        <Mail className="w-4 h-4" />
                        Get In Touch
                      </button>
                    </div>
                  }
                  delay={3500}
                />
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section ref={aboutRef} className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="terminal-window bg-gray-900/80 backdrop-blur-lg border border-gray-700/50 rounded-lg terminal-glow">
              <div className="terminal-chrome flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="terminal-chrome-button close"></div>
                  <div className="terminal-chrome-button minimize"></div>
                  <div className="terminal-chrome-button maximize"></div>
                </div>
                <div className="text-gray-400 text-sm font-medium">about.sh</div>
                <div className="w-16"></div>
              </div>

              <div className="p-4 sm:p-6 lg:p-8">
                <TerminalCommand
                  command="./about.sh --detailed"
                  output={
                    <div className="space-y-6 text-gray-300">
                      <div>
                        <h3 className="text-green-400 font-semibold text-lg mb-3">Professional Journey</h3>
                        <p className="leading-relaxed">
                          With over 3 years of experience in backend development and DevOps, I've helped 
                          startups and enterprises build scalable, reliable systems. My passion lies in 
                          creating efficient architectures that can handle millions of requests while 
                          maintaining high availability and performance.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-blue-400 font-semibold mb-3">Core Expertise</h4>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                              <ChevronRight className="w-3 h-3 text-green-400" />
                              Microservices Architecture
                            </li>
                            <li className="flex items-center gap-2">
                              <ChevronRight className="w-3 h-3 text-green-400" />
                              API Design & Development
                            </li>
                            <li className="flex items-center gap-2">
                              <ChevronRight className="w-3 h-3 text-green-400" />
                              Cloud Infrastructure (AWS, GCP)
                            </li>
                            <li className="flex items-center gap-2">
                              <ChevronRight className="w-3 h-3 text-green-400" />
                              Container Orchestration
                            </li>
                            <li className="flex items-center gap-2">
                              <ChevronRight className="w-3 h-3 text-green-400" />
                              Database Optimization
                            </li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-purple-400 font-semibold mb-3">Recent Focus</h4>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                              <ChevronRight className="w-3 h-3 text-green-400" />
                              Kubernetes & Service Mesh
                            </li>
                            <li className="flex items-center gap-2">
                              <ChevronRight className="w-3 h-3 text-green-400" />
                              Infrastructure as Code
                            </li>
                            <li className="flex items-center gap-2">
                              <ChevronRight className="w-3 h-3 text-green-400" />
                              Observability & Monitoring
                            </li>
                            <li className="flex items-center gap-2">
                              <ChevronRight className="w-3 h-3 text-green-400" />
                              Event-Driven Architecture
                            </li>
                            <li className="flex items-center gap-2">
                              <ChevronRight className="w-3 h-3 text-green-400" />
                              Security Best Practices
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  }
                />
              </div>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section ref={projectsRef} className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="terminal-window bg-gray-900/80 backdrop-blur-lg border border-gray-700/50 rounded-lg terminal-glow">
              <div className="terminal-chrome flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="terminal-chrome-button close"></div>
                  <div className="terminal-chrome-button minimize"></div>
                  <div className="terminal-chrome-button maximize"></div>
                </div>
                <div className="text-gray-400 text-sm font-medium">projects.sh</div>
                <div className="w-16"></div>
              </div>

              <div className="p-4 sm:p-6 lg:p-8">
                <TerminalCommand
                  command="git log --oneline --graph"
                  output={
                    <div className="space-y-6">
                      <div className="text-green-400 font-semibold text-lg mb-4">Recent Projects</div>
                      
                      {loading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="w-8 h-8 animate-spin text-green-400" />
                          <span className="ml-3 text-gray-400">Loading projects...</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                          {projects.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                          ))}
                        </div>
                      )}

                      <div className="text-center pt-6">
                        <a
                          href="https://github.com/kushagra-sh"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors font-medium"
                        >
                          <Github className="w-4 h-4" />
                          View All Projects on GitHub
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  }
                />
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section ref={contactRef} className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="terminal-window bg-gray-900/80 backdrop-blur-lg border border-gray-700/50 rounded-lg terminal-glow">
              <div className="terminal-chrome flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="terminal-chrome-button close"></div>
                  <div className="terminal-chrome-button minimize"></div>
                  <div className="terminal-chrome-button maximize"></div>
                </div>
                <div className="text-gray-400 text-sm font-medium">contact.sh</div>
                <div className="w-16"></div>
              </div>

              <div className="p-4 sm:p-6 lg:p-8">
                <TerminalCommand
                  command="./contact.sh --init"
                  output={
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-green-400 font-semibold text-lg mb-3">Get In Touch</h3>
                        <p className="text-gray-400 leading-relaxed">
                          Interested in collaborating or have a project in mind? I'm always open to 
                          discussing new opportunities and interesting challenges. Let's build something amazing together!
                        </p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-blue-400 font-semibold mb-4">Quick Connect</h4>
                          <div className="space-y-3">
                            <a
                              href="mailto:kush090605@gmail.com"
                              className="flex items-center gap-3 text-gray-300 hover:text-green-400 transition-colors"
                            >
                              <Mail className="w-4 h-4" />
                              kush090605@gmail.com
                            </a>
                            <a
                              href="https://linkedin.com/in/kushagra-sharma-dev"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 text-gray-300 hover:text-green-400 transition-colors"
                            >
                              <Linkedin className="w-4 h-4" />
                              LinkedIn Profile
                            </a>
                            <a
                              href="https://github.com/kushagra-sh"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 text-gray-300 hover:text-green-400 transition-colors"
                            >
                              <Github className="w-4 h-4" />
                              GitHub Profile
                            </a>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-purple-400 font-semibold mb-4">Send Message</h4>
                          <ContactForm />
                        </div>
                      </div>
                    </div>
                  }
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-gray-400 text-sm text-center sm:text-left">
              © 2025 Kushagra Sharma. Built with Next.js & Tailwind CSS.
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/kushagra-sh"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-green-400 transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com/in/kushagra-sharma-dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-green-400 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="mailto:kush090605@gmail.com"
                className="text-gray-400 hover:text-green-400 transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}