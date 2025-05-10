import { IsNotEmpty, IsNumber, IsString, isURL } from "class-validator";

export class CreateBookmarkDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    description: string;

    @IsNotEmpty()
    link: string;

    @IsNotEmpty()
    @IsNumber()
    userId: number;
}