import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Schema } from 'mongoose';
import { Properties, Property } from '../../libs/dto/property/property';
import { AgentPropertiesInquiry, AllPropertiesInquery, PropertiesInquiry, PropertyInput } from '../../libs/dto/property/property.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { MemberService } from '../member/member.service';
import { PropertyStatus } from '../../libs/enums/property.enum';
import { StatisticModifier, T } from '../../libs/types/common';
import { ViewGroup } from '../../libs/enums/view.enum';
import { ViewService } from '../view/view.service';
import { PropertyUpdate } from '../../libs/dto/property/property.update';
import * as moment from 'moment';
import { lookupMember, shapeIntoMongoObjectId } from '../../libs/config';
import { LikeService } from '../like/like.service';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';

@Injectable()
export class PropertyService {
    
    constructor(@InjectModel("Property") private readonly propertyModel: Model<Property>, 
    private memberService: MemberService,
    private viewService: ViewService,
	private likeService: LikeService
) {};

    public async createPropety(input: PropertyInput): Promise<Property> {
        try {
            const result = await this.propertyModel.create(input);
            await this.memberService.memberStatsEditor({
                _id: result.memberId, 
                targetKey: "memberProperties", 
                modifier: 1
            });
            return result
        } catch (err) {
            console.log('ERROR: createPropety:', err.message);
            throw new BadRequestException(Message.CREATE_FAILED);
        }
    }

    public async getProperty(memberId: ObjectId, propertyId: ObjectId): Promise<Property> {
		const search: T = {
			_id: propertyId,
			propertyStatus: PropertyStatus.ACTIVE,
		};

		const targetProperty: Property = await this.propertyModel.findOne(search).lean<Property>().exec();
		if (!targetProperty) throw new InternalServerErrorException(Message.NO_DATA_FAILED);

		if (memberId) {
			const viewInput = { memberId: memberId, viewRefId: propertyId, viewGroup: ViewGroup.PROPERTY };
			const newView = await this.viewService.recordView(viewInput);
			if (newView) {
				await this.propertyStatsEditor({ _id: propertyId, targetKey: 'propertyViews', modifier: 1 });
				targetProperty.propertyViews++;
			}

			// meLiked
		}
		targetProperty.memberData = await this.memberService.getMember(null, targetProperty.memberId);
		return targetProperty;
	}

      public async updateProperty(memberId: ObjectId, input: PropertyUpdate): Promise<Property> {
        let { propertyStatus, soldAt, deletedAt } = input;
        const search: T = {
            _id: input._id, memberId: memberId, propertyStatus: PropertyStatus.ACTIVE,
        };
    
        if (propertyStatus === PropertyStatus.SOLD) soldAt = moment().toDate();
        else if (propertyStatus === PropertyStatus.DELETE) deletedAt = moment().toDate();
    
        const result = await this.propertyModel
            .findOneAndUpdate(search, input, { new: true })
            .exec();
    
        if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
    
        if (soldAt || deletedAt) 
            await this.memberService.memberStatsEditor({
                _id: memberId, 
                targetKey: 'memberProperties', 
                modifier: -1,
            });
    
        return result;
    }

    public async getProperties(memberId: ObjectId, input: PropertiesInquiry): Promise<Properties> {
		const match: T = { propertyStatus: PropertyStatus.ACTIVE };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		this.shapeMatchQuery(match, input);
		console.log('match', match);

		const result = await this.propertyModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							//meLiked
							lookupMember,
							{ $unwind: '$memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FAILED);
		return result[0];
	}


    private shapeMatchQuery(match: T, input: PropertiesInquiry): void {
		const {
			memberId,
			locationList,
			roomList,
			bedsList,
			typeList,
			periodsRange,
			pricesRange,
			squaresRange,
			options,
			text,
		} = input.search;

		if (memberId) match.memberId = shapeIntoMongoObjectId(memberId);
		if (locationList) match.propertyLocation = { $in: locationList };
		if (roomList) match.propertyRooms = { $in: roomList };
		if (bedsList) match.propertyBeds = { $in: bedsList };
		if (typeList) match.propertyType = { $in: typeList };

		if (pricesRange) match.propertyPrice = { $gte: pricesRange.start, $lte: pricesRange.edit };
		if (periodsRange) match.createdAt = { $gte: periodsRange.start, $lte: periodsRange.edit };
		if (squaresRange) match.propertySquare = { $gte: squaresRange.start, $lte: squaresRange.edit };

		if (text) match.propertyTitle = { $regex: new RegExp(text, 'i') };
		if (options) {
			match['$or'] = options.map((ele: any) => {
				return { [ele]: true };
			});
		}
	}
    
    public async getAgentProperties(memberId: ObjectId, input: AgentPropertiesInquiry): Promise<Properties> {
		const { propertyStatus } = input.search;
		if (propertyStatus === PropertyStatus.DELETE) throw new BadRequestException(Message.NOT_ALLOWED_REQUEST);

		const match: T = { memberId: memberId, propertyStatus: propertyStatus ?? { $ne: PropertyStatus.DELETE } };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		const result = await this.propertyModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupMember,
							{ $unwind: '$memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FAILED);
		return result[0];
	}
    
	public async likeTargetProperty(memberId: ObjectId, likeRefId: ObjectId): Promise<Property> {
	  const target: Property = await this.propertyModel.findOne({ _id: likeRefId, propertyStatus: PropertyStatus.ACTIVE }).exec();
	  if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
	
	  const input: LikeInput = {
		memberId,
		likeRefId,
		likeGroup: LikeGroup.PROPERTY,
	  };
	
	  
	  const modifier: number = await this.likeService.toggleLike(input)
	  const result = await this.propertyStatsEditor({ _id: likeRefId, targetKey: 'propertyLikes', modifier: modifier });
	
	  if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);
	  return result;
	}

    public async getAllPropertiesByAdmin(memberId: ObjectId, input: AllPropertiesInquery): Promise<Properties> {
		const { propertyStatus, propertyLocationList } = input.search;

		const match: T = {};
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		if (propertyStatus) match.propertyStatus = propertyStatus;
		if (propertyLocationList) match.propertyLocationList = { $in: propertyLocationList };

		const result = await this.propertyModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit }, // [property1, property2]
							lookupMember, // memberData: [memberDataValue]
							{ $unwind: '$memberData' }, // memberData: memberDataValue
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FAILED);
		return result[0];
	}

    public async updatePropertyByAdmin(input: PropertyUpdate): Promise<Property> {
		let { propertyStatus, soldAt, deletedAt } = input;
		const search: T = { _id: input._id, propertyStatus: PropertyStatus.ACTIVE };

		if (propertyStatus === PropertyStatus.SOLD) soldAt === moment().toDate();
		else if (propertyStatus === PropertyStatus.DELETE) deletedAt === moment().toDate();

		const result = await this.propertyModel
			.findOneAndUpdate(search, input, {
				new: true,
			})
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
		if (soldAt || deletedAt) {
			await this.memberService.memberStatsEditor({
				_id: result.memberId,
				targetKey: 'memberProperties',
				modifier: -1,
			});
		}
		return result;
	}
	public async removePropertyByAdmin(propertyId: ObjectId): Promise<Property> {

		const search: T = { _id: propertyId, propertyStatus: PropertyStatus.DELETE };
		console.log('searchs', search);

		const result = await this.propertyModel.findOneAndDelete(search).exec();
		console.log('result:', search);
        
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);
		return result;
	}


	public async propertyStatsEditor(input: StatisticModifier): Promise<Property> {
        const { _id, targetKey, modifier } = input;
        return await this.propertyModel
          .findByIdAndUpdate(
            _id,
            { $inc: { [targetKey]: modifier } },
            { new: true },
          )
          .exec();
      }
}
