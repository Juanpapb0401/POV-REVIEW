import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {

  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  limit: number

  @ApiProperty()
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  @Min(0)
  offset: number
}
