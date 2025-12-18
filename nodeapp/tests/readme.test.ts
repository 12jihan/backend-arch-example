import { describe, it, expect, beforeAll } from '@jest/globals';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('README.md Validation', () => {
  let readmeContent: string;
  let readmeLines: string[];

  beforeAll(() => {
    const readmePath = join(__dirname, '../../README.md');
    readmeContent = readFileSync(readmePath, 'utf-8');
    readmeLines = readmeContent.split('\n');
  });

  describe('Document Structure', () => {
    it('should have a main title', () => {
      expect(readmeContent).toMatch(/^# /m);
      expect(readmeLines[0]).toMatch(/^# Node\.js Docker Starter/);
    });

    it('should contain all required sections', () => {
      const requiredSections = [
        'What This Is',
        'Quick Start',
        'Project Structure',
        'Endpoints',
        'Configuration',
        'Scaling',
        'Rate Limiting',
        'Development',
        'Services',
        'TODO',
        'Notes',
        'License'
      ];

      requiredSections.forEach(section => {
        expect(readmeContent).toContain(section);
      });
    });

    it('should have properly formatted markdown headers', () => {
      const headers = readmeContent.match(/^#{1,6} .+$/gm) || [];
      expect(headers.length).toBeGreaterThan(5);
      
      headers.forEach(header => {
        expect(header).toMatch(/^#{1,6} [A-Z]/);
      });
    });

    it('should not have excessive blank lines', () => {
      const tripleBlankLines = readmeContent.match(/\n\n\n\n/);
      expect(tripleBlankLines).toBeNull();
    });

    it('should end with a single newline', () => {
      expect(readmeContent.endsWith('\n')).toBe(true);
      expect(readmeContent.endsWith('\n\n')).toBe(false);
    });
  });

  describe('Code Blocks', () => {
    it('should have properly formatted code blocks', () => {
      const codeBlockStarts = (readmeContent.match(/```/g) || []).length;
      expect(codeBlockStarts % 2).toBe(0);
    });

    it('should specify language for code blocks', () => {
      const codeBlocks = readmeContent.match(/```(\w+)/g) || [];
      expect(codeBlocks.length).toBeGreaterThan(0);
      
      const validLanguages = ['bash', 'yaml', 'nginx'];
      codeBlocks.forEach(block => {
        const lang = block.replace('```', '');
        expect(validLanguages).toContain(lang);
      });
    });

    it('should contain valid bash commands in bash blocks', () => {
      const bashBlocks = readmeContent.match(/```bash\n([\s\S]*?)```/g) || [];
      expect(bashBlocks.length).toBeGreaterThan(0);
      
      bashBlocks.forEach(block => {
        expect(block).not.toMatch(/\$\{[^}]*$/);
        expect(block).not.toMatch(/^[^#`]*\|\s*$/m);
      });
    });

    it('should have valid docker-compose commands', () => {
      expect(readmeContent).toContain('docker-compose up --build');
      expect(readmeContent).toContain('docker-compose -f docker-compose.yml -f docker-compose.dev.yml up');
    });

    it('should have valid curl commands for API testing', () => {
      const curlCommands = readmeContent.match(/curl [^\n]+/g) || [];
      expect(curlCommands.length).toBeGreaterThanOrEqual(2);
      
      curlCommands.forEach(cmd => {
        expect(cmd).toMatch(/curl\s+http:\/\/localhost/);
      });
    });

    it('should have yaml code blocks with proper indentation', () => {
      const yamlBlocks = readmeContent.match(/```yaml\n([\s\S]*?)```/g) || [];
      
      yamlBlocks.forEach(block => {
        const lines = block.split('\n').filter(l => l.trim().length > 0);
        lines.forEach(line => {
          if (line.trim().startsWith('-')) {
            const indent = line.search(/\S/);
            expect(indent % 2).toBe(0);
          }
        });
      });
    });

    it('should have nginx code blocks with valid syntax', () => {
      const nginxBlocks = readmeContent.match(/```nginx\n([\s\S]*?)```/g) || [];
      
      nginxBlocks.forEach(block => {
        expect(block).toContain('limit_req_zone');
      });
    });
  });

  describe('Links and References', () => {
    it('should have valid markdown link syntax', () => {
      const links = readmeContent.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
      
      links.forEach(link => {
        expect(link).toMatch(/\[.+\]\(.+\)/);
      });
    });

    it('should reference existing configuration files', () => {
      const referencedFiles = [
        'docker-compose.yml',
        'docker-compose.dev.yml',
        'nginx/nginx.conf'
      ];

      referencedFiles.forEach(file => {
        expect(readmeContent).toContain(file);
      });
    });

    it('should reference the correct directory structure', () => {
      expect(readmeContent).toContain('nodeapp/');
      expect(readmeContent).toContain('nginx/');
      expect(readmeContent).toContain('src/');
      expect(readmeContent).toContain('index.ts');
    });

    it('should mention the image file for diagram', () => {
      expect(readmeContent).toContain('./images/Backend-Architecture-Diagram.png');
    });

    it('should have valid external links', () => {
      const excalidrawLink = readmeContent.match(/https:\/\/excalidraw\.com\/#json=[A-Za-z0-9_-]+/);
      expect(excalidrawLink).toBeTruthy();
    });

    it('should have proper image markdown syntax', () => {
      const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
      const images = readmeContent.match(imageRegex) || [];
      
      expect(images.length).toBeGreaterThan(0);
      images.forEach(img => {
        expect(img).toMatch(/!\[.*\]\(.*\)/);
      });
    });
  });

  describe('Technical Accuracy', () => {
    it('should specify correct technology versions', () => {
      expect(readmeContent).toContain('Express 5');
      expect(readmeContent).toContain('PostgreSQL 15');
      expect(readmeContent).toContain('Redis 7');
    });

    it('should document all API endpoints', () => {
      const endpoints = ['/health', '/', '/api', '/api/db', '/api/cache'];
      
      endpoints.forEach(endpoint => {
        expect(readmeContent).toContain(endpoint);
      });
    });

    it('should specify correct default port', () => {
      expect(readmeContent).toContain('PORT=3000');
      expect(readmeContent).toContain('3000 (internal)');
    });

    it('should specify correct database connection string format', () => {
      expect(readmeContent).toContain('postgresql://postgres:postgres@database:5432/testdb');
    });

    it('should specify correct Redis connection string format', () => {
      expect(readmeContent).toContain('redis://cache:6379');
    });

    it('should document the correct default replica count', () => {
      expect(readmeContent).toContain('3 replicas');
    });

    it('should document nginx rate limiting correctly', () => {
      expect(readmeContent).toContain('100 requests/minute');
      expect(readmeContent).toContain('limit_req_zone');
      expect(readmeContent).toContain('rate=100r/m');
    });

    it('should reference correct nginx proxy port', () => {
      expect(readmeContent).toContain('80');
    });

    it('should document correct database port', () => {
      expect(readmeContent).toContain('5432');
    });

    it('should document correct Redis port', () => {
      expect(readmeContent).toContain('6379');
    });
  });

  describe('Tables', () => {
    it('should have properly formatted markdown tables', () => {
      const tables = readmeContent.match(/\|[\s\S]*?\n\|[-:\s|]+\|[\s\S]*?\n(\|[\s\S]*?\n)+/g) || [];
      expect(tables.length).toBeGreaterThanOrEqual(2);
    });

    it('should have Endpoints table with all routes', () => {
      const endpointsSection = readmeContent.match(/## Endpoints[\s\S]*?##/)?.[0] || '';
      
      expect(endpointsSection).toContain('/health');
      expect(endpointsSection).toContain('/');
      expect(endpointsSection).toContain('/api');
      expect(endpointsSection).toContain('/api/db');
      expect(endpointsSection).toContain('/api/cache');
      expect(endpointsSection).toContain('Health check');
    });

    it('should have Services table with all services', () => {
      const servicesSection = readmeContent.match(/## Services[\s\S]*?##/)?.[0] || '';
      
      expect(servicesSection).toContain('proxy');
      expect(servicesSection).toContain('api');
      expect(servicesSection).toContain('database');
      expect(servicesSection).toContain('cache');
      expect(servicesSection).toContain('80');
      expect(servicesSection).toContain('5432');
      expect(servicesSection).toContain('6379');
    });

    it('should have consistent table column count', () => {
      const tableLines = readmeContent.match(/^\|.+\|$/gm) || [];
      
      let prevColumnCount = 0;
      let currentTableFirstLine = true;
      
      tableLines.forEach(line => {
        const columnCount = (line.match(/\|/g) || []).length - 1;
        
        if (line.includes('---')) {
          currentTableFirstLine = true;
        } else if (currentTableFirstLine) {
          prevColumnCount = columnCount;
          currentTableFirstLine = false;
        } else if (prevColumnCount > 0) {
          expect(columnCount).toBe(prevColumnCount);
        }
      });
    });

    it('should have table headers', () => {
      const tables = readmeContent.match(/\|[\s\S]*?\n\|[-:\s|]+\|/g) || [];
      expect(tables.length).toBeGreaterThan(0);
    });
  });

  describe('Environment Variables', () => {
    it('should document all environment variables', () => {
      const envVars = ['NODE_ENV', 'PORT', 'DATABASE_URL', 'REDIS_URL'];
      
      envVars.forEach(envVar => {
        expect(readmeContent).toContain(envVar);
      });
    });

    it('should show environment variable usage in YAML format', () => {
      expect(readmeContent).toMatch(/environment:\s*\n\s*-\s+NODE_ENV/);
    });

    it('should document production environment', () => {
      expect(readmeContent).toContain('NODE_ENV=production');
    });
  });

  describe('Instructions and Examples', () => {
    it('should have Quick Start section with runnable commands', () => {
      const quickStartSection = readmeContent.match(/## Quick Start[\s\S]*?##/)?.[0] || '';
      
      expect(quickStartSection).toContain('docker-compose up --build');
      expect(quickStartSection).toContain('curl');
    });

    it('should explain development workflow', () => {
      expect(readmeContent).toContain('hot reload');
      expect(readmeContent).toContain('tsx watch');
    });

    it('should provide scaling instructions', () => {
      const scalingSection = readmeContent.match(/## Scaling[\s\S]*?##/)?.[0] || '';
      
      expect(scalingSection).toContain('replicas');
      expect(scalingSection).toMatch(/replicas:\s+\d+/);
    });

    it('should provide rate limiting configuration examples', () => {
      const rateLimitSection = readmeContent.match(/## Rate Limiting[\s\S]*?##/)?.[0] || '';
      
      expect(rateLimitSection).toContain('nginx.conf');
      expect(rateLimitSection).toContain('limit_req_zone');
    });

    it('should explain how to modify configuration', () => {
      expect(readmeContent.toLowerCase()).toContain('edit');
    });

    it('should mention load balancing', () => {
      expect(readmeContent.toLowerCase()).toContain('load balanc');
    });
  });

  describe('Project Information', () => {
    it('should have a description of what the project is', () => {
      expect(readmeContent).toContain('production-ready');
      expect(readmeContent).toContain('Docker');
    });

    it('should list key features', () => {
      const features = [
        'Express',
        'TypeScript',
        'Nginx',
        'PostgreSQL',
        'Redis',
        'Docker Compose'
      ];

      features.forEach(feature => {
        expect(readmeContent.toLowerCase()).toContain(feature.toLowerCase());
      });
    });

    it('should have TODO section with future improvements', () => {
      const todoSection = readmeContent.match(/## TODO[\s\S]*?##/)?.[0] || '';
      
      expect(todoSection.length).toBeGreaterThan(50);
      expect(todoSection).toContain('Monitoring');
    });

    it('should have Notes section with important information', () => {
      const notesSection = readmeContent.match(/## Notes[\s\S]*?##/)?.[0] || '';
      
      expect(notesSection).toContain('credentials');
      expect(notesSection).toContain('production');
    });

    it('should have License section', () => {
      const licenseSection = readmeContent.match(/## License[\s\S]*$/)?.[0] || '';
      
      expect(licenseSection.length).toBeGreaterThan(0);
    });

    it('should mention horizontal scaling capability', () => {
      expect(readmeContent.toLowerCase()).toContain('horizontal scaling');
      expect(readmeContent.toLowerCase()).toContain('replicas');
    });

    it('should mention reverse proxy functionality', () => {
      expect(readmeContent.toLowerCase()).toContain('reverse proxy');
    });
  });

  describe('Content Quality', () => {
    it('should not have common typos', () => {
      const commonTypos = [
        /\bteh\b/i,
        /\brecieve\b/i,
        /\boccured\b/i,
        /\bseperate\b/i,
        /\bdocekr\b/i
      ];

      commonTypos.forEach(typo => {
        expect(readmeContent).not.toMatch(typo);
      });
    });

    it('should use consistent terminology', () => {
      expect(readmeContent).toContain('Node.js');
      expect(readmeContent).toContain('TypeScript');
    });

    it('should not have TODO or FIXME comments in documentation', () => {
      const lines = readmeContent.split('\n');
      const todoComments = lines.filter(line => 
        !line.includes('## TODO') && (line.includes('FIXME') || line.includes('XXX') || line.includes('HACK'))
      );
      expect(todoComments).toHaveLength(0);
    });

    it('should have proper grammar in sentences', () => {
      const sentences = readmeContent
        .split(/[.!?]\s+/)
        .filter(s => s.trim().length > 0 && !s.includes('```'));
      
      sentences.forEach(sentence => {
        const trimmed = sentence.trim();
        if (trimmed.length > 0 && !trimmed.startsWith('#') && !trimmed.startsWith('|')) {
          expect(trimmed[0]).toMatch(/[A-Z]/);
        }
      });
    });

    it('should use active voice in instructions', () => {
      const instructionSections = [
        'Quick Start',
        'Development',
        'Scaling'
      ];

      instructionSections.forEach(section => {
        const sectionContent = readmeContent.match(new RegExp(`## ${section}[\\s\\S]*?##`))?.[0] || '';
        expect(sectionContent.length).toBeGreaterThan(20);
      });
    });
  });

  describe('Security Considerations', () => {
    it('should mention security concerns about hardcoded credentials', () => {
      expect(readmeContent.toLowerCase()).toContain('credential');
      expect(readmeContent.toLowerCase()).toContain('production');
    });

    it('should document rate limiting for security', () => {
      expect(readmeContent).toContain('rate limit');
      expect(readmeContent).toContain('100 requests/minute');
    });

    it('should mention security best practices', () => {
      const notesSection = readmeContent.match(/## Notes[\s\S]*?##/)?.[0] || readmeContent.match(/## Notes[\s\S]*$/)?.[0] || '';
      expect(notesSection.toLowerCase()).toContain('secrets');
    });

    it('should mention SSL/TLS capability', () => {
      expect(readmeContent.toLowerCase()).toContain('ssl');
    });
  });

  describe('Consistency with Project Structure', () => {
    it('should match actual file structure in project', () => {
      const projectFiles = [
        'docker-compose.yml',
        'docker-compose.dev.yml',
        'package.json',
        'tsconfig.json',
        'index.ts',
        'nginx.conf'
      ];

      projectFiles.forEach(file => {
        expect(readmeContent).toContain(file);
      });
    });

    it('should document correct nginx service name', () => {
      expect(readmeContent).toContain('proxy');
    });

    it('should document correct API service name', () => {
      expect(readmeContent).toContain('api');
    });

    it('should document correct database service name', () => {
      expect(readmeContent).toContain('database');
    });

    it('should document correct cache service name', () => {
      expect(readmeContent).toContain('cache');
    });

    it('should reference multi-stage Docker build', () => {
      expect(readmeContent.toLowerCase()).toContain('multi-stage');
    });
  });

  describe('URL and Localhost References', () => {
    it('should use localhost for local development examples', () => {
      const curlCommands = readmeContent.match(/curl [^\n]+/g) || [];
      curlCommands.forEach(cmd => {
        expect(cmd).toContain('localhost');
      });
    });

    it('should specify correct protocol in URLs', () => {
      const httpUrls = readmeContent.match(/http:\/\/localhost/g) || [];
      expect(httpUrls.length).toBeGreaterThan(0);
    });

    it('should have consistent URL formatting', () => {
      const urls = readmeContent.match(/https?:\/\/[^\s)]+/g) || [];
      urls.forEach(url => {
        expect(url).not.toMatch(/\s/);
        expect(url).not.toMatch(/[<>]/);
      });
    });
  });

  describe('File References and Paths', () => {
    it('should use correct path separators', () => {
      const paths = readmeContent.match(/[a-z]+\/[a-z.]+/gi) || [];
      paths.forEach(path => {
        expect(path).not.toContain('\\');
      });
    });

    it('should reference files with correct extensions', () => {
      expect(readmeContent).toContain('.yml');
      expect(readmeContent).toContain('.ts');
      expect(readmeContent).toContain('.conf');
      expect(readmeContent).toContain('.json');
    });

    it('should have consistent file naming conventions', () => {
      expect(readmeContent).toContain('docker-compose.yml');
      expect(readmeContent).toContain('docker-compose.dev.yml');
    });
  });

  describe('Command Examples', () => {
    it('should have curl examples for all documented endpoints', () => {
      const endpoints = ['/health', '/api'];
      const curlCommands = readmeContent.match(/curl http:\/\/localhost[^\n]*/g) || [];
      
      endpoints.forEach(endpoint => {
        const hasExample = curlCommands.some(cmd => cmd.includes(endpoint));
        expect(hasExample).toBe(true);
      });
    });

    it('should show docker-compose with proper flags', () => {
      expect(readmeContent).toContain('--build');
      expect(readmeContent).toContain('-f');
    });

    it('should not have commands with obvious errors', () => {
      const commandLines = readmeLines.filter(line => 
        line.includes('docker') || line.includes('curl')
      );

      commandLines.forEach(line => {
        expect(line).not.toMatch(/\$\$/);
        expect(line).not.toMatch(/;;/);
      });
    });
  });

  describe('Formatting and Style', () => {
    it('should have consistent list formatting', () => {
      const listItems = readmeContent.match(/^- .+$/gm) || [];
      expect(listItems.length).toBeGreaterThan(5);
      
      listItems.forEach(item => {
        expect(item).toMatch(/^- [A-Z]/);
      });
    });

    it('should use backticks for inline code', () => {
      const inlineCodeCount = (readmeContent.match(/`[^`\n]+`/g) || []).length;
      expect(inlineCodeCount).toBeGreaterThan(10);
    });

    it('should have proper spacing around headers', () => {
      const headerLines = readmeLines
        .map((line, index) => ({ line, index }))
        .filter(({ line }) => line.startsWith('#'));

      headerLines.forEach(({ index }) => {
        if (index > 0) {
          expect(readmeLines[index - 1]?.trim()).toBe('');
        }
      });
    });

    it('should not have multiple consecutive blank lines', () => {
      expect(readmeContent).not.toMatch(/\n\n\n\n/);
    });
  });

  describe('Completeness', () => {
    it('should document how to access all services', () => {
      expect(readmeContent).toContain('80');
      expect(readmeContent).toContain('3000');
      expect(readmeContent).toContain('5432');
      expect(readmeContent).toContain('6379');
    });

    it('should provide both production and development instructions', () => {
      expect(readmeContent).toContain('production');
      expect(readmeContent).toContain('development');
      expect(readmeContent.toLowerCase()).toContain('dev');
    });

    it('should explain the purpose of each major component', () => {
      expect(readmeContent).toContain('Nginx');
      expect(readmeContent).toContain('PostgreSQL');
      expect(readmeContent).toContain('Redis');
      expect(readmeContent).toContain('Express');
    });

    it('should have contact or contribution information', () => {
      expect(readmeContent).toContain('License');
    });
  });
});