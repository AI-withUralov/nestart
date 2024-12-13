import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PropertyService } from './property.service';
import { Properties, Property } from '../../libs/dto/property/property';
import { AgentPropertiesInquiry, AllPropertiesInquery, PropertiesInquiry, PropertyInput } from '../../libs/dto/property/property.input';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { ObjectId } from 'mongoose';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { WithoutGuard } from '../auth/guards/without.guard';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { PropertyUpdate } from '../../libs/dto/property/property.update';

@Resolver()
export class PropertyResolver {
    constructor(private readonly propertyService: PropertyService) {}

    @Roles(MemberType.AGENT)
    @UseGuards(RolesGuard)
    @Mutation(() => Property)
    public async createPropety(
        @Args("input") input: PropertyInput,
        @AuthMember('_id') memberId: ObjectId
    ): Promise<Property> {
        console.log('Mutation: createPropety');
        input.memberId = memberId
        
        return await this.propertyService.createPropety(input);
    }

    @UseGuards(WithoutGuard)
    @Query(() => Property)
    public async getProperty(
    @Args('propertyId') input: string,
    @AuthMember('_id') memberId: ObjectId,
    ): Promise<Property> {
    console.log('Query: getProperty');
    const propertyId = shapeIntoMongoObjectId(input);
    return await this.propertyService.getProperty(memberId, propertyId);
    }

    @Roles(MemberType.AGENT)
    @UseGuards(RolesGuard)
    @Mutation(() => Property)
    public async updateProperty(
    @Args('input') input: PropertyUpdate,
    @AuthMember('_id') memberId: ObjectId,
    ): Promise<Property> {
    console.log('Mutation: updateProperty');
    input._id = shapeIntoMongoObjectId(input._id);
    return await this.propertyService.updateProperty(memberId, input);
    }
  


    @UseGuards(WithoutGuard)
	@Query((returns) => Properties)
	public async getProperties(
		@Args('input') input: PropertiesInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Properties> {
		console.log('Query: getProperties');
		return await this.propertyService.getProperties(memberId, input);
	}
    
    @Roles(MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Query((returns) => Properties)
	public async getAgentProperties(
		@Args('input') input: AgentPropertiesInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Properties> {
		console.log('Mutation: getAgentProperties');
		return await this.propertyService.getAgentProperties(memberId, input);
	}

// ADMIN -----
    @Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query((returns) => Properties)
	public async getAllPropertiesByAdmin(
		@Args('input') input: AllPropertiesInquery,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Properties> {
		console.log('Mutation: getAllPropertiesByAdmin');
		return await this.propertyService.getAllPropertiesByAdmin(memberId, input);
	}


    @Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation((returns) => Property)
	public async updatePropertyByAdmin(@Args('input') input: PropertyUpdate): Promise<Property> {
		console.log('Mutation: updatePropertyByAdmin');
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.propertyService.updatePropertyByAdmin(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation((returns) => Property)
	public async removePropertyByAdmin(@Args('propertyId') input: string): Promise<Property> {
		console.log('Mutation: removePropertyByAdmin');
		const propertyId = shapeIntoMongoObjectId(input);

		console.log('propertyId', propertyId);

		console.log(propertyId);

		return await this.propertyService.removePropertyByAdmin(propertyId);
	}
}
