import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { InternalServerErrorException, UseGuards} from '@nestjs/common';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.inputs';
import { Member } from '../../libs/dto/member/member';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';

@Resolver()
export class MemberResolver {
  constructor(private readonly memberService: MemberService) {}

  @Mutation(() => Member)

  public async signup(@Args('input') input: MemberInput): Promise<Member> {
      console.log('Mutation: signup');
      console.log('Input:', input);
      return this.memberService.signup(input);
    
  }

  @Mutation(() => Member)

  public async login(@Args('input') input: LoginInput): Promise<Member> {
      console.log('Mutation: login');
      console.log('Login:', input);
      return this.memberService.login(input);
  }

  // Authenticated
  @UseGuards(AuthGuard) // requestni kim amalga oshiryabdi tekshiradi
  @Mutation(() => String)
  public async updateMember(@AuthMember() authMember: Member): Promise<string> {
    console.log('Mutation: updateMember');
    console.log("authMember:",authMember)
    return this.memberService.updateMember();
  }
  @UseGuards(AuthGuard) 
  @Query(() => String)
  public async checkAuth(@AuthMember('memberNick') memberNick: string): Promise<string> {
    console.log("authMember:",memberNick)
    return `Hi ${memberNick}`
  }

  @Roles(MemberType.USER, MemberType.AGENT)
  @UseGuards(RolesGuard)
  @Query(() => String)
  public async checkAuthRoles(@AuthMember() authMember: Member): Promise<string> {
    console.log('Query: checkAuthRoles');
    return `Hi ${authMember.memberNick}, you are ${authMember.memberType} (memberId: ${authMember._id})`;
}

  @Query(() => String)
  public async getMember(): Promise<string> {
    console.log('Query: getMember');
    return this.memberService.getMember();
  }

  /** ADMIN **/

  // Authorization: ADMIN
  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => String)
  public async getAllMembersByAdmin(@AuthMember() authMember: Member): Promise<string> {
    console.log("authMember.memberType", authMember.memberType)
    return this.memberService.getAllMembersByAdmin();
  }

  // Authorization: ADMIN
  @Mutation(() => String)
  public async updateMemberByAdmin(): Promise<string> {
    console.log('Mutation: updateMemberByAdmin');
    return this.memberService.updateMemberByAdmin();
  }

}

