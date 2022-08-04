import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ){}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto)
      return pokemon;
    } catch (error) {
      this.handleExceptions(error)
    }
    
  }

  async findAll() {
    const pokemon = await this.pokemonModel.find()
    return pokemon;
  }

  async findOne(term: string) {
    let pokemon: Pokemon;

    //NUMBERO
    if(!isNaN(+term)){
      pokemon = await this.pokemonModel.findOne({no: term});
    }

    //MONGOID
    if(!pokemon && isValidObjectId(term)){
      pokemon = await this.pokemonModel.findById(term);
    }

    //NOMBRE
    if(!pokemon){
      pokemon = await this.pokemonModel.findOne({name: term.toLowerCase().trim()})
    }

    if(!pokemon) throw new NotFoundException('Pokemon no encontrado')

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne(term);
    if(updatePokemonDto.name){
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
    }
    await pokemon.updateOne(updatePokemonDto, {new: true});

    return {...pokemon.toJSON(), updatePokemonDto}
  }

  async remove(id: string) {
    // const pokemon = await this.findOne(id)
    // await pokemon.deleteOne()
    // const result = this.pokemonModel.findByIdAndRemove(id)
    const {deletedCount} = await this.pokemonModel.deleteOne({_id: id})
    if(deletedCount === 0){
      throw new BadRequestException('el pokemon no existe')
    }
    return;
  }

  private handleExceptions(error: any){
    if(error.code === 11000){
      throw new BadRequestException('El pokemon ya existe')
    }
    console.log(error)
    throw new InternalServerErrorException('No se pudo crear pokemon')
  }

}
