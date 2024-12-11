
import { Field, InputType, Int } from "@nestjs/graphql";
import { IsInt, IsNotEmpty, IsOptional, Length, Min } from "class-validator";
import { PropertyLocation, PropertyType } from "../../enums/property.enum";
import { ObjectId } from "mongoose";


@InputType()
export class PropertyInput {

    @IsNotEmpty()
    @Field(() => PropertyType)
    propertyType: PropertyType;

    @IsNotEmpty()
    @Field(() => PropertyLocation)
    propertyLocation: PropertyLocation;

    @IsNotEmpty()
    @Length(5, 100)
    @Field(() => String)
    propertyAddress: string;

    @IsNotEmpty()
    @Length(5, 100)
    @Field(() => String)
    propertyTitle: string;

    @IsNotEmpty()
    @Field(() => Int)
    propertyPrice: number;

    @IsNotEmpty()
    @Field(() => Int)
    propertySquare: number;

    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Field(() => Int)
    propertyBeds: number;

    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Field(() => Int)
    propertyRooms: number;

    @IsNotEmpty()
    @Field(() => [String])
    propertyImages: string[];

    @IsOptional()
    @Length(50, 500)
    @Field(() => String, {nullable: true})
    propertyDesc?: string;

    @IsOptional()
    @Field(() => Boolean, {nullable: true})
    propertyBarter?: boolean;

    @IsOptional()
    @Field(() => Boolean, {nullable: true})
    propertyRent?: boolean;

    memberId: ObjectId;
    
    @Field(()=> Date, {nullable: true})
    constructedAt?: Date;

}