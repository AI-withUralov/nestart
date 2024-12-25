
import { Field, InputType, Int } from "@nestjs/graphql";
import { IsIn, IsInt, IsNotEmpty, IsOptional, Length, Min } from "class-validator";
import { PropertyLocation, PropertyStatus, PropertyType } from "../../enums/property.enum";
import { ObjectId } from "mongoose";
import { availablePropertySorts } from "../../config";
import { Direction } from "../../enums/common.enum";


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

    @InputType()
    export class PricesRange {
        @Field(() => Int)
        start: number;

        @Field(() => Date)
        edit: number;
    }

    @InputType()
    export class PeriodsRange {
        @Field(() => Date)
        start: Date;

        @Field(() => Date)
        edit: Date;
    }

    @InputType()
    export class SquaresRange {
        @Field(() => Int)
        start: number;

        @Field(() => Date)
        edit: number;
    }

    @InputType()
    class PISearch {
        @IsOptional()
        @Field(() => String, { nullable: true })
        memberId?: ObjectId;

        @IsOptional()
        @Field(() => [PropertyLocation], { nullable: true })
        locationList?: PropertyLocation[];

        @IsOptional()
        @Field(() => [PropertyType], { nullable: true })
        typeList?: PropertyType[];

        @IsOptional()
        @Field(() => [Int], { nullable: true })
        roomList?: Number[];

        @IsOptional()
        @Field(() => [Int], { nullable: true })
        bedsList?: Number[];

        @IsOptional()
        @Field(() => [Int], { nullable: true })
        options?: Number[];

        @IsOptional()
        @Field(() => PricesRange, { nullable: true })
        pricesRange?: PricesRange;

        @IsOptional()
        @Field(() => PeriodsRange, { nullable: true })
        periodsRange?: PeriodsRange;

        @IsOptional()
        @Field(() => SquaresRange, { nullable: true })
        squaresRange?: SquaresRange;

        @IsOptional()
        @Field(() => String, { nullable: true })
        text?: string;
    }

    @InputType()
    export class PropertiesInquiry {
        @IsNotEmpty()
        @Min(1)
        @Field(() => Int)
        page: number;

        @IsNotEmpty()
        @Min(1)
        @Field(() => Int)
        limit: number;

        @IsOptional()
        @IsIn(availablePropertySorts)
        @Field(() => String, { nullable: true })
        sort?: string;

        @IsOptional()
        @Field(() => Direction, { nullable: true })
        direction?: Direction;

        @IsNotEmpty()
        @Field(() => PISearch)
        search: PISearch;
    }

    @InputType()
    class APISearch {
        @IsOptional()
        @Field(() => PropertyStatus, { nullable: true })
        propertyStatus?: PropertyStatus;
    }

    @InputType()
    export class AgentPropertiesInquiry {
        @IsNotEmpty()
        @Min(1)
        @Field(() => Int)
        page: number;

        @IsNotEmpty()
        @Min(1)
        @Field(() => Int)
        limit: number;

        @IsOptional()
        @IsIn(availablePropertySorts)
        @Field(() => String, { nullable: true })
        sort?: string;

        @IsOptional()
        @Field(() => Direction, { nullable: true })
        direction?: Direction;

        @IsNotEmpty()
        @Field(() => APISearch)
        search: APISearch;
    }

    @InputType()
    class ALPISearch {
        @IsOptional() 
        @Field(() => PropertyStatus, { nullable: true })
        propertyStatus?: PropertyStatus;

        @IsOptional()
        @Field(() => [PropertyLocation], { nullable: true })
        propertyLocationList?: PropertyStatus[];
    }

    @InputType()
    export class AllPropertiesInquery {
        @IsNotEmpty()
        @Min(1)
        @Field(() => Int)
        page: number;

        @IsNotEmpty()
        @Min(1)
        @Field(() => Int)
        limit: number;

        @IsOptional()
        @IsIn(availablePropertySorts)
        @Field(() => String, { nullable: true })
        sort?: string;

        @IsOptional()
        @Field(() => Direction, { nullable: true })
        direction?: Direction;

        @IsNotEmpty()
        @Field(() => ALPISearch)
        search: ALPISearch;
    }

    @InputType()
    export class OrdinaryInquiry {
    @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    page: number;

    @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    limit: number;
}