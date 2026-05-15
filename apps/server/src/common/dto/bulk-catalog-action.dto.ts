import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, IsString, ArrayNotEmpty } from "class-validator";

export enum BulkCatalogAction {
    ACTIVATE = "activate",
    DEACTIVATE = "deactivate",
    DELETE = "delete",
}

export class BulkCatalogActionDto {
    @ApiProperty({ example: ["clw..."], type: [String] })
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    ids: string[];

    @ApiProperty({ enum: BulkCatalogAction, example: BulkCatalogAction.DEACTIVATE })
    @IsEnum(BulkCatalogAction)
    action: BulkCatalogAction;
}
