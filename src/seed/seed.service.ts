import { Injectable } from '@nestjs/common';
import { PokemonResponse } from './interfaces/pokemon-response.interface';
import { Model } from 'mongoose';
import { Pokemon, PokemonDocument } from 'src/pokemon/entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {

  constructor(
    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<PokemonDocument>,
    private readonly http: AxiosAdapter
  ){}

  async executeSeed() {

    await this.pokemonModel.deleteMany({})

    const data = await this.http.get<PokemonResponse>('https://pokeapi.co/api/v2/pokemon?limit=100');
    const pokemonsToInsert: { name: string, no: number }[] = [];

    data.results.forEach(({ name, url }) => {
      const segments = url.split('/');
      const no = +segments[segments.length - 2];
      
      pokemonsToInsert.push({ name, no})

    });

    await this.pokemonModel.insertMany(pokemonsToInsert)

    return 'Seed executed successfully';
  }

}