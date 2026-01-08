import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateLocationDto {
    @IsString()
    @IsNotEmpty()
    address: string;

    @IsNumber()
    @IsNotEmpty()
    cityId: number;
}
