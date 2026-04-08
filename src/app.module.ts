import { join } from 'path';
import { Module } from '@nestjs/common';
import { PokemonModule } from './pokemon/pokemon.module';
import { ServeStaticModule } from '@nestjs/serve-static'
import { MongooseModule } from '@nestjs/mongoose'
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
@Module({
  imports: [
    ServeStaticModule.forRoot({ 
      rootPath: join(__dirname,'..','public')
    }),

    MongooseModule.forRoot('mongodb://nest-pokemon:123456@localhost:27017'),

    PokemonModule,

    CommonModule,

    SeedModule,
  ],

})
export class AppModule {}
