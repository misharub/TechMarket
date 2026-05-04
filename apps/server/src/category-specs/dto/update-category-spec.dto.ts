import { PartialType } from "@nestjs/swagger";
import { CreateCategorySpecDto } from "./create-category-spec.dto";

// PartialType делает все поля необязательными, потому что PATCH обновляет только переданные поля.
export class UpdateCategorySpecDto extends PartialType(CreateCategorySpecDto) {}
