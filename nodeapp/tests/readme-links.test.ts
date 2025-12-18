import { describe, it, expect, beforeAll } from '@jest/globals';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('README.md Links and File References Validation', () => {
  let readmeContent: string;
  const projectRoot = join(__dirname, '../..');

  beforeAll(() => {
    const readmePath = join(projectRoot, 'README.md');
    readmeContent = readFileSync(readmePath, 'utf-8');
  });

  describe('File References', () => {
    it('should reference only existing files in the repository', () => {
      const fileReferences = [
        'docker-compose.yml',
        'docker-compose.dev.yml',
        'nginx/nginx.conf',
        'nodeapp/package.json',
        'nodeapp/tsconfig.json',
        'nodeapp/src/index.ts'
      ];

      fileReferences.forEach(file => {
        const filePath = join(projectRoot, file);
        expect(existsSync(filePath)).toBe(true);
      });
    });

    it('should reference Dockerfile files that exist', () => {
      const dockerfiles = [
        'nodeapp/Dockerfile',
        'nodeapp/Dockerfile.dev'
      ];

      dockerfiles.forEach(file => {
        expect(readmeContent).toContain(file.split('/').pop() || file);
      });
    });

    it('should reference configuration files with correct names', () => {
      expect(readmeContent).toContain('nginx.conf');
      expect(readmeContent).toContain('package.json');
      expect(readmeContent).toContain('tsconfig.json');
    });
  });

  describe('Code Block Language Tags', () => {
    it('should use bash for shell commands', () => {
      const bashBlocks = readmeContent.match(/```bash/g) || [];
      expect(bashBlocks.length).toBeGreaterThan(0);
    });

    it('should use yaml for docker-compose configurations', () => {
      const yamlBlocks = readmeContent.match(/```yaml/g) || [];
      expect(yamlBlocks.length).toBeGreaterThan(0);
    });

    it('should use nginx for nginx configuration examples', () => {
      const nginxBlocks = readmeContent.match(/```nginx/g) || [];
      expect(nginxBlocks.length).toBeGreaterThan(0);
    });
  });

  describe('URL Validation', () => {
    it('should have well-formed HTTP URLs', () => {
      const httpUrls = readmeContent.match(/http:\/\/localhost[^\s)"]*/g) || [];
      
      httpUrls.forEach(url => {
        expect(url).toMatch(/^http:\/\/localhost(:\d+)?(\/[a-z/]*)?$/);
      });
    });

    it('should have well-formed HTTPS URLs', () => {
      const httpsUrls = readmeContent.match(/https:\/\/[^\s)"]+/g) || [];
      
      httpsUrls.forEach(url => {
        expect(url).not.toContain(' ');
        expect(url).toMatch(/^https:\/\//);
      });
    });

    it('should reference Excalidraw with proper URL format', () => {
      const excalidrawUrls = readmeContent.match(/https:\/\/excalidraw\.com\/#json=[A-Za-z0-9_-]+/g);
      expect(excalidrawUrls).toBeTruthy();
      expect(excalidrawUrls?.length).toBeGreaterThan(0);
    });
  });

  describe('Command Validation', () => {
    it('should have syntactically correct docker-compose commands', () => {
      const dockerCommands = readmeContent.match(/docker-compose[^\n]*/g) || [];
      
      dockerCommands.forEach(cmd => {
        expect(cmd).not.toContain('  '); // No double spaces
        expect(cmd).toMatch(/docker-compose\s+(up|build|-f)/);
      });
    });

    it('should have syntactically correct curl commands', () => {
      const curlCommands = readmeContent.match(/curl[^\n]*/g) || [];
      
      curlCommands.forEach(cmd => {
        expect(cmd).toMatch(/curl\s+http/);
        expect(cmd).not.toContain('curl curl');
      });
    });

    it('should use proper flags in commands', () => {
      expect(readmeContent).toContain('--build');
      expect(readmeContent).toContain('-f docker-compose.yml');
    });
  });

  describe('Configuration Examples', () => {
    it('should show valid YAML syntax in examples', () => {
      const yamlBlocks = readmeContent.match(/```yaml\n([\s\S]*?)```/g) || [];
      
      yamlBlocks.forEach(block => {
        expect(block).not.toContain('\t'); // No tabs in YAML
        expect(block).toMatch(/environment:/);
      });
    });

    it('should show valid environment variable format', () => {
      const envVarPattern = /[A-Z_]+=.+/g;
      const envVars = readmeContent.match(envVarPattern) || [];
      
      expect(envVars.length).toBeGreaterThan(0);
      envVars.forEach(envVar => {
        expect(envVar).toMatch(/^[A-Z_]+=\S/);
      });
    });

    it('should show valid nginx configuration syntax', () => {
      const nginxBlocks = readmeContent.match(/```nginx\n([\s\S]*?)```/g) || [];
      
      nginxBlocks.forEach(block => {
        expect(block).toContain('limit_req_zone');
        expect(block).toContain('$binary_remote_addr');
      });
    });
  });

  describe('Service Name Consistency', () => {
    it('should use consistent service names throughout', () => {
      const serviceNames = ['proxy', 'api', 'database', 'cache'];
      
      serviceNames.forEach(service => {
        const occurrences = (readmeContent.match(new RegExp(`\\b${service}\\b`, 'g')) || []).length;
        expect(occurrences).toBeGreaterThan(0);
      });
    });

    it('should reference services with correct internal hostnames', () => {
      expect(readmeContent).toContain('database:5432');
      expect(readmeContent).toContain('cache:6379');
    });
  });

  describe('Port References', () => {
    it('should consistently reference port 80 for nginx', () => {
      expect(readmeContent).toContain('80');
    });

    it('should consistently reference port 3000 for Node.js app', () => {
      expect(readmeContent).toContain('3000');
    });

    it('should consistently reference port 5432 for PostgreSQL', () => {
      expect(readmeContent).toContain('5432');
    });

    it('should consistently reference port 6379 for Redis', () => {
      expect(readmeContent).toContain('6379');
    });
  });

  describe('Technical Terms', () => {
    it('should use correct capitalization for Docker', () => {
      const dockerMentions = readmeContent.match(/Docker/g) || [];
      expect(dockerMentions.length).toBeGreaterThan(0);
    });

    it('should use correct capitalization for TypeScript', () => {
      const tsMentions = readmeContent.match(/TypeScript/g) || [];
      expect(tsMentions.length).toBeGreaterThan(0);
    });

    it('should use correct naming for Node.js', () => {
      const nodeMentions = readmeContent.match(/Node\.js/g) || [];
      expect(nodeMentions.length).toBeGreaterThan(0);
    });

    it('should use correct naming for PostgreSQL', () => {
      const pgMentions = readmeContent.match(/PostgreSQL/g) || [];
      expect(pgMentions.length).toBeGreaterThan(0);
    });
  });

  describe('Example Output Validation', () => {
    it('should provide example outputs or responses where appropriate', () => {
      const endpointsSection = readmeContent.match(/## Endpoints[\s\S]*?##/)?.[0] || '';
      expect(endpointsSection).toContain('Description');
      expect(endpointsSection.length).toBeGreaterThan(100);
    });

    it('should document expected responses for endpoints', () => {
      expect(readmeContent).toContain('status');
      expect(readmeContent).toContain('timestamp');
    });
  });

  describe('Architecture Diagram', () => {
    it('should reference an architecture diagram', () => {
      expect(readmeContent).toContain('Diagram');
      expect(readmeContent).toContain('.png');
    });

    it('should provide both image and Excalidraw link', () => {
      expect(readmeContent).toContain('excalidraw.com');
      expect(readmeContent).toContain('./images/');
    });

    it('should use proper markdown image syntax', () => {
      const imagePattern = /!\[.*?\]\(.*?\.png\)/;
      expect(readmeContent).toMatch(imagePattern);
    });
  });
});