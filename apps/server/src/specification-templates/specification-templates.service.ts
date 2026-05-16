import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, SpecValueType } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSpecificationTemplateDto } from "./dto/create-specification-template.dto";
import { SpecificationGroupInputDto } from "./dto/specification-group-input.dto";
import { SpecificationInputDto } from "./dto/specification-input.dto";
import { SpecificationOptionInputDto } from "./dto/specification-option-input.dto";
import { UpdateSpecificationTemplateDto } from "./dto/update-specification-template.dto";

type NormalizedOption = Required<Pick<SpecificationOptionInputDto, "value" | "sortOrder">> & Pick<SpecificationOptionInputDto, "id">;
type NormalizedSpecification = Required<Pick<SpecificationInputDto, "name" | "type" | "isRequired" | "sortOrder">> &
    Pick<SpecificationInputDto, "id"> & {
        unit: string | null;
        options: NormalizedOption[];
    };
type NormalizedGroup = Required<Pick<SpecificationGroupInputDto, "name" | "sortOrder">> &
    Pick<SpecificationGroupInputDto, "id"> & {
        specifications: NormalizedSpecification[];
    };

@Injectable()
export class SpecificationTemplatesService {
    constructor(private readonly prisma: PrismaService) {}

    findAll() {
        return this.prisma.specificationTemplate.findMany({
            include: {
                category: true,
                _count: { select: { groups: true } },
            },
            orderBy: [{ createdAt: "desc" }],
        });
    }

    async findOne(id: string) {
        const template = await this.prisma.specificationTemplate.findUnique({
            where: { id },
            include: this.templateInclude(),
        });

        if (!template) {
            throw new NotFoundException("Specification template not found");
        }

        return template;
    }

    async findByCategory(categoryId: string) {
        return this.prisma.specificationTemplate.findUnique({
            where: { categoryId },
            include: this.templateInclude(),
        });
    }

    async create(dto: CreateSpecificationTemplateDto) {
        await this.ensureCategoryExists(dto.categoryId);
        this.ensureTemplateName(dto.name);
        const groups = this.normalizeGroups(dto.groups);

        try {
            return await this.prisma.specificationTemplate.create({
                data: {
                    name: dto.name.trim(),
                    categoryId: dto.categoryId,
                    groups: {
                        create: groups.map((group) => ({
                            name: group.name,
                            sortOrder: group.sortOrder,
                            specifications: {
                                create: group.specifications.map((specification) => ({
                                    key: this.createSpecificationKey(),
                                    name: specification.name,
                                    type: specification.type,
                                    unit: specification.unit,
                                    isRequired: specification.isRequired,
                                    sortOrder: specification.sortOrder,
                                    options: {
                                        create: specification.options.map((option) => ({
                                            value: option.value,
                                            sortOrder: option.sortOrder,
                                        })),
                                    },
                                })),
                            },
                        })),
                    },
                },
                include: this.templateInclude(),
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    async update(id: string, dto: UpdateSpecificationTemplateDto) {
        await this.ensureCategoryExists(dto.categoryId);
        this.ensureTemplateName(dto.name);
        const template = await this.prisma.specificationTemplate.findUnique({
            where: { id },
            include: {
                groups: {
                    include: {
                        specifications: {
                            include: { options: true },
                        },
                    },
                },
            },
        });

        if (!template) {
            throw new NotFoundException("Specification template not found");
        }

        const groups = this.normalizeGroups(dto.groups);
        const existingGroups = new Map(template.groups.map((group) => [group.id, group]));
        const existingSpecifications = new Map(
            template.groups.flatMap((group) => group.specifications).map((specification) => [specification.id, specification]),
        );
        const existingOptions = new Map(
            template.groups
                .flatMap((group) => group.specifications)
                .flatMap((specification) => specification.options)
                .map((option) => [option.id, option]),
        );
        const nextGroupIds = new Set(groups.flatMap((group) => (group.id ? [group.id] : [])));

        for (const group of groups) {
            if (group.id && !existingGroups.has(group.id)) {
                throw new BadRequestException("Specification group does not belong to this template");
            }

            for (const specification of group.specifications) {
                if (specification.id && !existingSpecifications.has(specification.id)) {
                    throw new BadRequestException("Specification does not belong to this template");
                }

                for (const option of specification.options) {
                    if (option.id && !existingOptions.has(option.id)) {
                        throw new BadRequestException("Specification option does not belong to this template");
                    }
                }
            }
        }

        try {
            await this.prisma.$transaction(async (tx) => {
                await tx.specificationTemplate.update({
                    where: { id },
                    data: {
                        name: dto.name.trim(),
                        categoryId: dto.categoryId,
                    },
                });

                for (const group of template.groups) {
                    if (!nextGroupIds.has(group.id)) {
                        await tx.specificationGroup.delete({ where: { id: group.id } });
                    }
                }

                for (const group of groups) {
                    const persistedGroup = group.id
                        ? await tx.specificationGroup.update({
                              where: { id: group.id },
                              data: { name: group.name, sortOrder: group.sortOrder },
                          })
                        : await tx.specificationGroup.create({
                              data: {
                                  templateId: id,
                                  name: group.name,
                                  sortOrder: group.sortOrder,
                              },
                          });

                    const previousGroup = group.id ? existingGroups.get(group.id) : undefined;
                    const previousSpecs = new Map((previousGroup?.specifications ?? []).map((specification) => [specification.id, specification]));
                    const nextSpecIds = new Set(group.specifications.flatMap((specification) => (specification.id ? [specification.id] : [])));

                    for (const specification of previousGroup?.specifications ?? []) {
                        if (!nextSpecIds.has(specification.id)) {
                            await tx.specification.delete({ where: { id: specification.id } });
                        }
                    }

                    for (const specification of group.specifications) {
                        const persistedSpecification = specification.id
                            ? await tx.specification.update({
                                  where: { id: specification.id },
                                  data: {
                                      groupId: persistedGroup.id,
                                      name: specification.name,
                                      type: specification.type,
                                      unit: specification.unit,
                                      isRequired: specification.isRequired,
                                      sortOrder: specification.sortOrder,
                                  },
                              })
                            : await tx.specification.create({
                                  data: {
                                      groupId: persistedGroup.id,
                                      key: this.createSpecificationKey(),
                                      name: specification.name,
                                      type: specification.type,
                                      unit: specification.unit,
                                      isRequired: specification.isRequired,
                                      sortOrder: specification.sortOrder,
                                  },
                              });

                        const previousSpecification = specification.id ? previousSpecs.get(specification.id) : undefined;
                        const previousOptions = new Map((previousSpecification?.options ?? []).map((option) => [option.id, option]));
                        const nextOptionIds = new Set(specification.options.flatMap((option) => (option.id ? [option.id] : [])));

                        for (const option of previousSpecification?.options ?? []) {
                            if (!nextOptionIds.has(option.id)) {
                                await tx.specificationOption.delete({ where: { id: option.id } });
                            }
                        }

                        for (const option of specification.options) {
                            if (option.id && previousOptions.has(option.id)) {
                                await tx.specificationOption.update({
                                    where: { id: option.id },
                                    data: {
                                        value: option.value,
                                        sortOrder: option.sortOrder,
                                    },
                                });
                            } else {
                                await tx.specificationOption.create({
                                    data: {
                                        specificationId: persistedSpecification.id,
                                        value: option.value,
                                        sortOrder: option.sortOrder,
                                    },
                                });
                            }
                        }
                    }
                }
            });

            return this.findOne(id);
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    async remove(id: string) {
        await this.findOne(id);

        return this.prisma.specificationTemplate.delete({
            where: { id },
        });
    }

    private normalizeGroups(groups: SpecificationGroupInputDto[]): NormalizedGroup[] {
        return groups.map((group, groupIndex) => {
            const name = group.name.trim();

            if (!name) {
                throw new BadRequestException("Specification group name is required");
            }

            return {
                id: group.id,
                name,
                sortOrder: group.sortOrder ?? groupIndex + 1,
                specifications: (group.specifications ?? []).map((specification, specificationIndex) =>
                    this.normalizeSpecification(specification, specificationIndex),
                ),
            };
        });
    }

    private normalizeSpecification(specification: SpecificationInputDto, index: number): NormalizedSpecification {
        const name = specification.name.trim();

        if (!name) {
            throw new BadRequestException("Specification name is required");
        }

        const options = (specification.options ?? [])
            .map((option, optionIndex) => ({
                id: option.id,
                value: option.value.trim(),
                sortOrder: option.sortOrder ?? optionIndex + 1,
            }));

        if (options.some((option) => option.value.length === 0)) {
            throw new BadRequestException("Specification options cannot be empty");
        }

        if (specification.type === SpecValueType.SELECT && !options.length) {
            throw new BadRequestException("Select specification requires at least one option");
        }

        return {
            id: specification.id,
            name,
            type: specification.type,
            unit: specification.unit?.trim() || null,
            isRequired: specification.isRequired ?? false,
            sortOrder: specification.sortOrder ?? index + 1,
            options: specification.type === SpecValueType.SELECT ? options : [],
        };
    }

    private templateInclude() {
        return {
            category: true,
            groups: {
                orderBy: [{ sortOrder: "asc" as const }, { name: "asc" as const }],
                include: {
                    specifications: {
                        orderBy: [{ sortOrder: "asc" as const }, { name: "asc" as const }],
                        include: {
                            options: {
                                orderBy: [{ sortOrder: "asc" as const }, { value: "asc" as const }],
                            },
                        },
                    },
                },
            },
        };
    }

    private async ensureCategoryExists(categoryId: string) {
        const category = await this.prisma.category.findUnique({
            where: { id: categoryId },
            select: { id: true },
        });

        if (!category) {
            throw new NotFoundException("Category not found");
        }
    }

    private ensureTemplateName(name: string) {
        if (!name.trim()) {
            throw new BadRequestException("Specification template name is required");
        }
    }

    private createSpecificationKey() {
        return `spec_${randomUUID().replace(/-/g, "")}`;
    }

    private handlePrismaError(error: unknown): never {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            throw new ConflictException("Specification template already exists for this category");
        }

        throw error;
    }
}
