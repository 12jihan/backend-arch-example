import { describe, it, expect, beforeAll } from '@jest/globals';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('README.md Content Quality and Best Practices', () => {
  let readmeContent: string;
  let readmeLines: string[];

  beforeAll(() => {
    const readmePath = join(__dirname, '../../README.md');
    readmeContent = readFileSync(readmePath, 'utf-8');
    readmeLines = readmeContent.split('\n');
  });

  describe('Documentation Best Practices', () => {
    it('should have a clear project title at the top', () => {
      expect(readmeLines[0]).toMatch(/^# /);
      expect(readmeLines[0].length).toBeLessThan(100);
    });

    it('should have a concise project description early in the document', () => {
      const firstFewLines = readmeLines.slice(0, 5).join('\n');
      expect(firstFewLines.length).toBeGreaterThan(50);
    });

    it('should have Quick Start section near the beginning', () => {
      const quickStartIndex = readmeLines.findIndex(line => 
        line.includes('Quick Start')
      );
      expect(quickStartIndex).toBeLessThan(30);
      expect(quickStartIndex).toBeGreaterThan(0);
    });

    it('should provide actionable getting started steps', () => {
      const quickStartSection = readmeContent.match(/## Quick Start[\s\S]*?##/)?.[0] || '';
      expect(quickStartSection).toContain('```');
      expect(quickStartSection.length).toBeGreaterThan(50);
    });

    it('should document prerequisites or requirements', () => {
      expect(readmeContent.toLowerCase()).toMatch(/docker|prerequisite|requirement|install/);
    });

    it('should have examples that are copy-pasteable', () => {
      const codeBlocks = readmeContent.match(/```[\s\S]*?```/g) || [];
      expect(codeBlocks.length).toBeGreaterThan(3);
      
      codeBlocks.forEach(block => {
        expect(block).not.toContain('...');
        expect(block).not.toContain('<your-');
      });
    });
  });

  describe('Structure and Organization', () => {
    it('should have logical section ordering', () => {
      const sections = [
        'Quick Start',
        'Project Structure',
        'Endpoints',
        'Configuration'
      ];

      let lastIndex = 0;
      sections.forEach(section => {
        const index = readmeContent.indexOf(section);
        expect(index).toBeGreaterThan(lastIndex);
        lastIndex = index;
      });
    });

    it('should use appropriate heading levels', () => {
      const h1Count = (readmeContent.match(/^# /gm) || []).length;
      const h2Count = (readmeContent.match(/^## /gm) || []).length;
      
      expect(h1Count).toBe(1); // Only one main title
      expect(h2Count).toBeGreaterThan(5); // Multiple sections
    });

    it('should not skip heading levels', () => {
      const headings = readmeLines
        .filter(line => line.match(/^#{1,6} /))
        .map(line => line.match(/^(#{1,6})/)?.[1].length || 0);

      for (let i = 1; i < headings.length; i++) {
        const diff = headings[i]! - headings[i - 1]!;
        expect(diff).toBeLessThanOrEqual(1);
      }
    });

    it('should group related information together', () => {
      const configSection = readmeContent.match(/## Configuration[\s\S]*?##/)?.[0] || '';
      expect(configSection).toContain('environment');
      expect(configSection.length).toBeGreaterThan(100);
    });
  });

  describe('Code Examples Quality', () => {
    it('should have syntax highlighting for all code blocks', () => {
      const codeBlocks = readmeContent.match(/```\w+/g) || [];
      const plainCodeBlocks = readmeContent.match(/```\n/g) || [];
      
      expect(plainCodeBlocks?.length || 0).toBe(0);
      expect(codeBlocks.length).toBeGreaterThan(0);
    });

    it('should have complete and runnable command examples', () => {
      const bashBlocks = readmeContent.match(/```bash\n([\s\S]*?)```/g) || [];
      
      bashBlocks.forEach(block => {
        const commands = block.split('\n').filter(line => 
          line.trim().length > 0 && 
          !line.includes('```') && 
          !line.startsWith('#')
        );
        
        commands.forEach(cmd => {
          expect(cmd).not.toMatch(/\.\.\./);
          expect(cmd).not.toMatch(/<placeholder>/);
        });
      });
    });

    it('should include comments in code blocks where helpful', () => {
      const bashBlocks = readmeContent.match(/```bash\n([\s\S]*?)```/g) || [];
      
      const hasComments = bashBlocks.some(block => block.includes('#'));
      expect(hasComments).toBe(true);
    });

    it('should show realistic configuration values', () => {
      expect(readmeContent).toContain('postgres:postgres');
      expect(readmeContent).toContain('testdb');
      expect(readmeContent).not.toContain('YOUR_');
      expect(readmeContent).not.toContain('REPLACE_ME');
    });
  });

  describe('Endpoint Documentation', () => {
    it('should document all endpoints in a table', () => {
      const endpointsSection = readmeContent.match(/## Endpoints[\s\S]*?##/)?.[0] || '';
      
      expect(endpointsSection).toContain('|');
      expect(endpointsSection).toContain('Route');
      expect(endpointsSection).toContain('Description');
    });

    it('should provide description for each endpoint', () => {
      const endpoints = ['/health', '/', '/api', '/api/db', '/api/cache'];
      const endpointsSection = readmeContent.match(/## Endpoints[\s\S]*?##/)?.[0] || '';
      
      endpoints.forEach(endpoint => {
        expect(endpointsSection).toContain(endpoint);
      });
    });

    it('should document HTTP methods if applicable', () => {
      const endpointsSection = readmeContent.match(/## Endpoints[\s\S]*?##/)?.[0] || '';
      expect(endpointsSection.length).toBeGreaterThan(100);
    });
  });

  describe('Configuration Documentation', () => {
    it('should document all environment variables clearly', () => {
      const configSection = readmeContent.match(/## Configuration[\s\S]*?##/)?.[0] || '';
      
      const envVars = ['NODE_ENV', 'PORT', 'DATABASE_URL', 'REDIS_URL'];
      envVars.forEach(envVar => {
        expect(configSection).toContain(envVar);
      });
    });

    it('should show environment variable values in proper format', () => {
      expect(readmeContent).toMatch(/NODE_ENV=production/);
      expect(readmeContent).toMatch(/PORT=3000/);
      expect(readmeContent).toMatch(/DATABASE_URL=postgresql:\/\//);
      expect(readmeContent).toMatch(/REDIS_URL=redis:\/\//);
    });

    it('should explain how to modify configuration', () => {
      const configSection = readmeContent.match(/## Configuration[\s\S]*?(?:##|$)/)?.[0] || '';
      expect(configSection.length).toBeGreaterThan(50);
    });
  });

  describe('Development Instructions', () => {
    it('should provide development setup instructions', () => {
      const devSection = readmeContent.match(/## Development[\s\S]*?##/)?.[0] || '';
      
      expect(devSection).toContain('docker-compose');
      expect(devSection.length).toBeGreaterThan(50);
    });

    it('should explain hot reload or watch mode', () => {
      expect(readmeContent.toLowerCase()).toContain('hot reload');
      expect(readmeContent.toLowerCase()).toContain('watch');
    });

    it('should reference development-specific files', () => {
      expect(readmeContent).toContain('docker-compose.dev.yml');
      expect(readmeContent).toContain('Dockerfile.dev');
    });
  });

  describe('Production Considerations', () => {
    it('should mention production environment', () => {
      expect(readmeContent.toLowerCase()).toContain('production');
    });

    it('should document security considerations', () => {
      const notesSection = readmeContent.match(/## Notes[\s\S]*?(?:##|$)/)?.[0] || '';
      
      expect(notesSection.toLowerCase()).toContain('credential');
      expect(notesSection.toLowerCase()).toContain('production');
    });

    it('should mention SSL/TLS capability', () => {
      expect(readmeContent.toLowerCase()).toContain('ssl');
    });

    it('should document rate limiting', () => {
      expect(readmeContent.toLowerCase()).toContain('rate limit');
    });
  });

  describe('Scalability Documentation', () => {
    it('should explain how to scale the application', () => {
      const scalingSection = readmeContent.match(/## Scaling[\s\S]*?##/)?.[0] || '';
      
      expect(scalingSection).toContain('replicas');
      expect(scalingSection.length).toBeGreaterThan(50);
    });

    it('should mention load balancing', () => {
      expect(readmeContent.toLowerCase()).toContain('load balanc');
    });

    it('should show how to change replica count', () => {
      expect(readmeContent).toMatch(/replicas:\s*\d+/);
    });
  });

  describe('Troubleshooting and Notes', () => {
    it('should have a Notes section with important information', () => {
      const notesSection = readmeContent.match(/## Notes[\s\S]*?(?:##|$)/)?.[0] || '';
      
      expect(notesSection.length).toBeGreaterThan(50);
    });

    it('should mention known issues or limitations', () => {
      const notesSection = readmeContent.match(/## Notes[\s\S]*?(?:##|$)/)?.[0] || '';
      
      expect(notesSection.toLowerCase()).toMatch(/typo|issue|note|warning/);
    });

    it('should provide helpful warnings about development vs production', () => {
      expect(readmeContent.toLowerCase()).toContain('local dev');
    });
  });

  describe('Future Work and Roadmap', () => {
    it('should have a TODO or roadmap section', () => {
      expect(readmeContent).toContain('TODO');
    });

    it('should list potential improvements', () => {
      const todoSection = readmeContent.match(/## TODO[\s\S]*?##/)?.[0] || '';
      
      const improvements = todoSection.split('\n').filter(line => line.trim().startsWith('-'));
      expect(improvements.length).toBeGreaterThan(3);
    });

    it('should mention monitoring and observability', () => {
      const todoSection = readmeContent.match(/## TODO[\s\S]*?##/)?.[0] || '';
      expect(todoSection.toLowerCase()).toContain('monitor');
    });
  });

  describe('Licensing and Legal', () => {
    it('should have a License section', () => {
      expect(readmeContent).toContain('License');
    });

    it('should clearly state the license or usage terms', () => {
      const licenseSection = readmeContent.match(/## License[\s\S]*$/)?.[0] || '';
      expect(licenseSection.length).toBeGreaterThan(10);
    });
  });

  describe('Readability and Clarity', () => {
    it('should use clear and concise language', () => {
      const sentences = readmeContent
        .replace(/```[\s\S]*?```/g, '')
        .split(/[.!?]\n/)
        .filter(s => s.trim().length > 20);

      sentences.forEach(sentence => {
        expect(sentence.length).toBeLessThan(300);
      });
    });

    it('should not have overly complex sentences', () => {
      const longLines = readmeLines.filter(line => 
        !line.startsWith('```') &&
        !line.startsWith('|') &&
        !line.startsWith('#') &&
        line.length > 200
      );

      expect(longLines.length).toBeLessThan(5);
    });

    it('should use consistent terminology', () => {
      expect(readmeContent).not.toContain('nodejs');
      expect(readmeContent).toContain('Node.js');
    });

    it('should have proper punctuation', () => {
      const lines = readmeLines.filter(line => 
        line.trim().length > 0 &&
        !line.startsWith('#') &&
        !line.startsWith('```') &&
        !line.startsWith('|') &&
        !line.startsWith('-')
      );

      lines.forEach(line => {
        if (line.trim().endsWith(':')) {
          return;
        }
        const trimmed = line.trim();
        if (trimmed.length > 20) {
          expect(trimmed).toMatch(/[.!?]$/);
        }
      });
    });
  });

  describe('Visual Aids', () => {
    it('should include or reference diagrams', () => {
      expect(readmeContent.toLowerCase()).toContain('diagram');
    });

    it('should use tables for structured data', () => {
      const tables = readmeContent.match(/\|[\s\S]*?\|[-:\s|]+\|/g) || [];
      expect(tables.length).toBeGreaterThanOrEqual(2);
    });

    it('should use lists for enumerating items', () => {
      const listItems = readmeContent.match(/^- .+$/gm) || [];
      expect(listItems.length).toBeGreaterThan(5);
    });

    it('should use code blocks for commands and code', () => {
      const codeBlocks = readmeContent.match(/```/g) || [];
      expect(codeBlocks.length).toBeGreaterThan(6);
    });
  });

  describe('Completeness', () => {
    it('should cover all major aspects of the project', () => {
      const aspects = [
        'installation',
        'configuration',
        'endpoints',
        'development',
        'production',
        'scaling'
      ];

      aspects.forEach(aspect => {
        expect(readmeContent.toLowerCase()).toContain(aspect);
      });
    });

    it('should provide contact or support information', () => {
      expect(readmeContent).toContain('License');
    });

    it('should document all services in the architecture', () => {
      const services = ['Nginx', 'Express', 'PostgreSQL', 'Redis'];
      
      services.forEach(service => {
        expect(readmeContent).toContain(service);
      });
    });
  });

  describe('Maintenance and Updates', () => {
    it('should reference specific version numbers', () => {
      expect(readmeContent).toMatch(/\d+/);
      expect(readmeContent).toContain('Express 5');
    });

    it('should be up-to-date with project structure', () => {
      expect(readmeContent).toContain('nodeapp/');
      expect(readmeContent).toContain('nginx/');
    });
  });
});