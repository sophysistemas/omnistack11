const crypto = require('crypto');
const connection = require('../database/connection');

module.exports = {
  //Lista todas as ONGs
  async index(request, response) {
    const ongs = await connection('ongs').select('*');
    return response.json(ongs);
  },

  //Adiciona uma ONG
  async create(request, response) {
    const { name, email, whatsapp, city, uf } = request.body;

    const id = crypto.randomBytes(4).toString('HEX'); //Gera o id da ong automaticamente

    await connection('ongs').insert({
      id,
      name,
      email,
      whatsapp,
      city,
      uf
    });
    return response.json({ id });
  }
}