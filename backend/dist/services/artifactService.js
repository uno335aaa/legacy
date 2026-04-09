import fs from 'fs';
import path from 'path';
import { artifactStore } from '../store/artifactStore.js';
import { projectPaths } from '../store/projectPaths.js';
import { projectStore } from '../store/projectStore.js';
import { documentGenerationService, } from './documentGenerationService.js';
const artifactPromptMap = {
    overview_document: { type: 'overview', format: 'json' },
    class_document: { type: 'class_spec', format: 'json' },
    method_document: { type: 'method_spec', format: 'json' },
    crud_matrix: { type: 'crud_table', format: 'json' },
    class_diagram_plantuml: { type: 'class_diagram', format: 'puml' },
    plantuml_repair: { type: 'class_diagram', format: 'puml' },
};
/**
 * 生成した設計書ドラフトを output 配下へ保存する service。
 * まずは prompt workbench から成果物化できることを優先する。
 */
export const artifactService = {
    listArtifacts(projectId) {
        const project = projectStore.findById(projectId);
        if (!project) {
            throw new Error('Project not found');
        }
        return artifactStore.findAll(projectId);
    },
    getArtifact(projectId, artifactId) {
        const project = projectStore.findById(projectId);
        if (!project) {
            throw new Error('Project not found');
        }
        const artifact = artifactStore.findById(projectId, artifactId);
        if (!artifact) {
            throw new Error('Artifact not found');
        }
        const absolutePath = path.join(projectPaths.projectRoot(projectId), artifact.path);
        if (!fs.existsSync(absolutePath)) {
            throw new Error('Artifact file not found');
        }
        return {
            artifact,
            content: fs.readFileSync(absolutePath, 'utf-8'),
        };
    },
    async generateArtifactFromPrompt(projectId, input, generationService = documentGenerationService) {
        const project = projectStore.findById(projectId);
        if (!project) {
            throw new Error('Project not found');
        }
        const versionId = project.active_version_id;
        if (!versionId) {
            throw new Error('Active version is required before generating artifacts');
        }
        const artifactDefinition = artifactPromptMap[input.promptId];
        const generated = await generationService.generateDocument(input);
        const fileBody = this.toPersistedContent(artifactDefinition.format, generated.rawText, generated.parsed);
        const artifactId = `${artifactDefinition.type}-${Date.now()}`;
        const relativePath = this.buildRelativeArtifactPath(projectId, artifactId, artifactDefinition.format);
        const absolutePath = path.join(projectPaths.projectRoot(projectId), relativePath);
        fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
        fs.writeFileSync(absolutePath, fileBody, 'utf-8');
        const artifact = artifactStore.create({
            projectId,
            versionId,
            type: artifactDefinition.type,
            path: relativePath.replace(/\\/g, '/'),
            format: artifactDefinition.format,
        });
        return { artifact, content: fileBody };
    },
    toPersistedContent(format, rawText, parsed) {
        if (format === 'json') {
            return JSON.stringify({
                generated_at: new Date().toISOString(),
                payload: parsed ?? rawText,
            }, null, 2);
        }
        return rawText;
    },
    buildRelativeArtifactPath(projectId, artifactId, format) {
        switch (format) {
            case 'json':
                return path.relative(projectPaths.projectRoot(projectId), path.join(projectPaths.outputJsonDir(projectId), `${artifactId}.json`));
            case 'puml':
                return path.relative(projectPaths.projectRoot(projectId), path.join(projectPaths.outputPumlDir(projectId), `${artifactId}.puml`));
            case 'md':
                return path.relative(projectPaths.projectRoot(projectId), path.join(projectPaths.outputMdDir(projectId), `${artifactId}.md`));
            case 'svg':
                return path.relative(projectPaths.projectRoot(projectId), path.join(projectPaths.outputSvgDir(projectId), `${artifactId}.svg`));
            default:
                return path.relative(projectPaths.projectRoot(projectId), path.join(projectPaths.outputJsonDir(projectId), `${artifactId}.json`));
        }
    },
};
//# sourceMappingURL=artifactService.js.map