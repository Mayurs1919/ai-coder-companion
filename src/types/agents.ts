export type AgentId = 
  | 'code-writer'
  | 'refactor'
  | 'debug'
  | 'test-gen'
  | 'test-runner'
  | 'reviewer'
  | 'docs'
  | 'architecture'
  | 'api'
  | 'microservices';

export type AgentStatus = 'idle' | 'processing' | 'success' | 'error';

export interface Agent {
  id: AgentId;
  name: string;
  description: string;
  icon: string;
  color: string;
  status: AgentStatus;
  lastActivity?: string;
}

export interface AgentMessage {
  id: string;
  agentId: AgentId;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  codeBlocks?: CodeBlock[];
}

export interface CodeBlock {
  language: string;
  code: string;
  filename?: string;
}

export interface ConsoleLog {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: Date;
  agentId?: AgentId;
}

export const AGENTS: Agent[] = [
  {
    id: 'code-writer',
    name: 'Code Writer',
    description: 'Generates new code, modules, classes, APIs, and components',
    icon: 'Code2',
    color: 'agent-code-writer',
    status: 'idle',
  },
  {
    id: 'refactor',
    name: 'Code Refactor',
    description: 'Improves existing code without changing functionality',
    icon: 'Wand2',
    color: 'agent-refactor',
    status: 'idle',
  },
  {
    id: 'debug',
    name: 'Bug Fix',
    description: 'Understands errors and generates fixes',
    icon: 'Bug',
    color: 'agent-debug',
    status: 'idle',
  },
  {
    id: 'test-gen',
    name: 'Test Generator',
    description: 'Creates automated unit tests for existing code',
    icon: 'FlaskConical',
    color: 'agent-test-gen',
    status: 'idle',
  },
  {
    id: 'test-runner',
    name: 'Test Runner',
    description: 'Executes tests and reports detailed results',
    icon: 'Play',
    color: 'agent-test-runner',
    status: 'idle',
  },
  {
    id: 'reviewer',
    name: 'PR Reviewer',
    description: 'Reviews code like a senior engineer',
    icon: 'GitPullRequest',
    color: 'agent-reviewer',
    status: 'idle',
  },
  {
    id: 'docs',
    name: 'Documentation',
    description: 'Automatically creates technical documentation',
    icon: 'FileText',
    color: 'agent-docs',
    status: 'idle',
  },
  {
    id: 'architecture',
    name: 'Architecture',
    description: 'Designs system architecture before coding',
    icon: 'Network',
    color: 'agent-architecture',
    status: 'idle',
  },
  {
    id: 'api',
    name: 'API Structure',
    description: 'Defines and organizes API endpoints',
    icon: 'Webhook',
    color: 'agent-api',
    status: 'idle',
  },
  {
    id: 'microservices',
    name: 'Microservices',
    description: 'Designs microservices architecture for scalability',
    icon: 'Boxes',
    color: 'agent-microservices',
    status: 'idle',
  },
];
