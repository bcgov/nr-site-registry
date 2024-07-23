import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ResponseDto } from './response/response.dto';
import { Cart } from '../entities/cart.entity';

@ObjectType()
export class CartResponse extends ResponseDto {
    @Field(() => [Cart],  { nullable: true })
    data: Cart[] | null;
}


@InputType()
export class CartDTO {

  @Field()
  @IsNotEmpty()
  @IsString()
  userId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  siteId: string;

  @Field()
  price: number;

  @Field()
  @IsOptional()
  @IsString()
  whoCreated: string;
} 


@InputType()
export class CartDeleteDTO
{
  
  @Field()
  @IsNotEmpty()
  @IsString()
  userId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  cartId: string;

}


@InputType()
export class CartDeleteDTOWithSiteID
{
  
  @Field()
  @IsNotEmpty()
  @IsString()
  userId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  siteId: string;

}