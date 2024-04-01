import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MaxLength, Min, MinLength } from "class-validator";
import { SignInUserDto } from "./user-signin.dto";


export class SignUpUserDto extends SignInUserDto {
    @MaxLength(30)
    @IsString()
    @IsNotEmpty({message:'first name required'})
    @ApiProperty({
        description:'User first name',})
    first_name: string;
    @MaxLength(30)
    @IsString()
    @IsNotEmpty({message:'last name required'})
    @ApiProperty({
        description:'User last name',})
    last_name: string;
    @IsNotEmpty({message:'Email  required'})
    @IsEmail({},{message:'invalid email'})
    @ApiProperty({
        description:'User email',})
    email: string;
    @IsNotEmpty()
    @MinLength(8,{message:'The password must be at least 8 characters long'})
    @ApiProperty({
        description:'Confirm password',})
    confirm_password: string;
}
