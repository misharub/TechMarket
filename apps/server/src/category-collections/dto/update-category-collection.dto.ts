import { PartialType } from "@nestjs/swagger";
import { CreateCategoryCollectionDto } from "./create-category-collection.dto";

export class UpdateCategoryCollectionDto extends PartialType(CreateCategoryCollectionDto) {}
