import { Module } from "@nestjs/common";
import { SpecificationTemplatesController } from "./specification-templates.controller";
import { SpecificationTemplatesService } from "./specification-templates.service";

@Module({
    controllers: [SpecificationTemplatesController],
    providers: [SpecificationTemplatesService],
    exports: [SpecificationTemplatesService],
})
export class SpecificationTemplatesModule {}
