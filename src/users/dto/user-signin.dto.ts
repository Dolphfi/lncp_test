import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, MinLength } from "class-validator";

export class SignInUserDto {
    @IsNotEmpty({message:'Username required'})
    @MinLength(5,{message:'The usename must be at least 5 characters long'})
    @ApiProperty({
        description:'Username',})
    username: string;
    @IsNotEmpty({message:'Password required'})
    @MinLength(8,{message:'The password must be at least 8 characters long'})
    @ApiProperty({
        description:'User Password',})
    password: string;
}