import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon, PokemonDocument } from './entities/pokemon.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class PokemonService {

  private deafultLimit: number;

  constructor(
    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<PokemonDocument>,
    private readonly configService: ConfigService
  ) {
    this.deafultLimit = configService.get<number>('defaultLimit') || 7;
    // console.log({defaultLimit: configService.get<number>('defaultLimit')})
  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try {
      const pokemon = await this.pokemonModel.create( createPokemonDto );

      return {
        pokemon,
        message: 'Pokemon created successfully'
      };
      
    } catch (error: any) {
      this.handleExceptions( error );
    }

  }

  findAll( paginationDto: PaginationDto ) {

    const { limit = this.deafultLimit, offset = 0 } = paginationDto;
    
    return this.pokemonModel.find()
    .limit( limit )
    .skip( offset )
    .sort({ no: 1})
    .select('-__v');
    
  }

  async findOne(term: string) {

    let pokemon: PokemonDocument | null = null;

    if( !isNaN(+term) ) {
      pokemon = await this.pokemonModel.findOne({ no: +term });
    } 

    if( !pokemon && isValidObjectId( term ) ) {
      pokemon = await this.pokemonModel.findById( term );
    }

    if( !pokemon ) {
      pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase().trim() })
    }

    if( !pokemon ) throw new NotFoundException(`Pokemon with id, name or no "${ term }" not found`)
 
    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne(term);

    if (updatePokemonDto.name) {
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase().trim();
    }

    try {
      await pokemon.updateOne( updatePokemonDto );
      return { ...pokemon.toJSON(), ...updatePokemonDto };
      
    } catch (error: any) {
      this.handleExceptions( error );
      
    }

  }

  async remove(id: string ) {

    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });

    if( deletedCount === 0 ) {
      throw new NotFoundException(`Pokemon with id "${ id }" not found`);
    }

    return {
      message: 'Pokemon deleted successfully'
    }
  }

  private handleExceptions( error: any ) {
     if( error.code === 11000 ) {
        throw new BadRequestException(`Pokemon exists in db ${ JSON.stringify( error.keyValue ) }`);
      }

      console.log({error})
      throw new InternalServerErrorException('Error creating pokemon - Check server logs');
      
  }
}
