import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { Strategy } from "passport-jwt";
import { Repository } from "typeorm";
import { User } from "../users/entities/user.entity";
import { ConfigService } from "@nestjs/config";
import { UnauthorizedException } from "@nestjs/common";
import { ExtractJwt } from "passport-jwt";
import { Jwt } from "src/interfaces/jwt.interface";

export class JwtStrategy extends PassportStrategy(Strategy) {
    
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService,
    ){
        super({
            secretOrKey: configService.get('JWT_SECRET') as string,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        })
    } 

    async validate(payload: Jwt): Promise<User> {

        const {id} = payload;

        const user = await this.userRepository.findOneBy({id});

        if(!user) throw new UnauthorizedException(`token invalido`);

        if(!user.isActive) throw new UnauthorizedException(`token invalido`);

        delete user.password;

        return user;

    }
}
    