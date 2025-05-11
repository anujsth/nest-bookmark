import { IsNotEmpty, IsNumber, IsOptional, IsString, isURL } from "class-validator";

export class CreateBookmarkDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string|null;

    @IsNotEmpty()
    link: string;
}
export class UpdateBookmarkDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  link?: string;
}
