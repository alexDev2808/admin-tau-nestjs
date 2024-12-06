import { IsString, MinLength } from "class-validator";

export class CreateUploadDto {

    @IsString()
    @MinLength(3)
    name: string;
    
}
