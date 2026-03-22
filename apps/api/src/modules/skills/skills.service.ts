import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { type Skill, SkillCategory, SkillLevel } from '@prisma/client';

import { CacheService } from '../../cache/cache.service';
import { PrismaService } from '../../database/prisma.service';
import { GitHubService } from '../github/github.service';

/**
 * SKILLS SERVICE
 *
 * O diferencial do portfólio: skills baseadas em dados REAIS, não em
 * porcentagens inventadas.
 *
 * Algoritmo de score (0-100):
 *   - Commits com a tecnologia:  40% do score
 *   - Número de projetos:        30% do score
 *   - Anos de uso:               30% do score
 *
 * SkillLevel é determinado pelo score:
 *   0-25:   BEGINNER
 *   26-50:  INTERMEDIATE
 *   51-75:  ADVANCED
 *   76-100: MASTER
 */
@Injectable()
export class SkillsService {
  private readonly logger = new Logger(SkillsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly github: GitHubService,
  ) {}

  async findAll(): Promise<Skill[]> {
    return this.cache.getOrSet(
      'skills:all',
      () =>
        this.prisma.skill.findMany({
          orderBy: [{ category: 'asc' }, { score: 'desc' }],
        }),
      CacheService.TTL.MEDIUM,
    );
  }

  async findByCategory(category: SkillCategory): Promise<Skill[]> {
    return this.cache.getOrSet(
      `skills:category:${category}`,
      () =>
        this.prisma.skill.findMany({
          where: { category },
          orderBy: { score: 'desc' },
        }),
      CacheService.TTL.MEDIUM,
    );
  }

  async findOne(id: string): Promise<Skill> {
    const skill = await this.prisma.skill.findUnique({ where: { id } });
    if (!skill) throw new NotFoundException(`Skill ${id} não encontrada`);
    return skill;
  }

  /**
   * syncFromGitHub — Sincroniza skills com dados reais do GitHub
   *
   * 1. Busca distribuição de linguagens do GitHub
   * 2. Para cada linguagem, calcula score real
   * 3. Upsert no banco (cria se não existe, atualiza se existe)
   * 4. Invalida cache
   */
  async syncFromGitHub(): Promise<void> {
    this.logger.log('Sincronizando skills com GitHub...');

    const stats = await this.github.getFullStats();
    const { languageDistribution, repos } = stats;

    // Mapa de linguagem → categoria de skill
    const languageCategoryMap: Record<string, SkillCategory> = {
      TypeScript: SkillCategory.FRONTEND,
      JavaScript: SkillCategory.FRONTEND,
      CSS: SkillCategory.FRONTEND,
      HTML: SkillCategory.FRONTEND,
      Python: SkillCategory.BACKEND,
      Go: SkillCategory.BACKEND,
      Rust: SkillCategory.BACKEND,
      Java: SkillCategory.BACKEND,
      'C#': SkillCategory.BACKEND,
      Shell: SkillCategory.DEVOPS,
      Dockerfile: SkillCategory.DEVOPS,
    };

    for (const [language, percentage] of Object.entries(languageDistribution)) {
      const reposWithLang = repos.filter((r) => r.language === language).length;
      const score = this.calculateScore({
        languagePercentage: percentage,
        projectCount: reposWithLang,
      });

      await this.prisma.skill.upsert({
        where: { name: language },
        create: {
          name: language,
          category: languageCategoryMap[language] ?? SkillCategory.TOOLS,
          level: this.scoreToLevel(score),
          score,
          projects: reposWithLang,
        },
        update: {
          score,
          level: this.scoreToLevel(score),
          projects: reposWithLang,
          updatedAt: new Date(),
        },
      });
    }

    // Invalida cache após sync
    await this.cache.delByPattern('skills:*');
    this.logger.log('Skills sincronizadas com sucesso');
  }

  /**
   * calculateScore — Algoritmo de pontuação de skill
   *
   * Pesos:
   *   - Percentual de uso no GitHub: 40%
   *   - Quantidade de projetos: 30%
   *   - Anos de uso (passado por parâmetro opcional): 30%
   */
  private calculateScore({
    languagePercentage,
    projectCount,
    yearsUsing = 1,
  }: {
    languagePercentage: number;
    projectCount: number;
    yearsUsing?: number;
  }): number {
    // Normaliza cada componente para 0-100
    const usageScore = Math.min(languagePercentage * 2, 100); // 50% uso = 100 pts
    const projectScore = Math.min(projectCount * 10, 100);    // 10 projetos = 100 pts
    const yearsScore = Math.min(yearsUsing * 20, 100);        // 5 anos = 100 pts

    const total = usageScore * 0.4 + projectScore * 0.3 + yearsScore * 0.3;
    return Math.round(Math.min(total, 100));
  }

  private scoreToLevel(score: number): SkillLevel {
    if (score <= 25) return SkillLevel.BEGINNER;
    if (score <= 50) return SkillLevel.INTERMEDIATE;
    if (score <= 75) return SkillLevel.ADVANCED;
    return SkillLevel.MASTER;
  }
}
