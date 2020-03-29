const connection = require('../database/connection');

module.exports = {
  async index(request, response) {
    const { page = 1 } = request.query; //Variavel usada para a paginacao

    const [count] = await connection('incidents').count(); //retorna a quantidade de registros na tabela

    const incidents = await connection('incidents')
      .join('ongs', 'ongs.id', '=', 'incidents.ong_id')
      .limit(5)
      .offset((page - 1) * 5) //Para paginacao: 5 registros por vez
      .select(['incidents.*', 'ongs.name', 'ongs.email', 'ongs.whatsapp', 'ongs.city', 'ongs.uf']);

    response.header('X-Total-Count', count['count(*)']); //retorna o total de registros no cabecalho da requisicao

    return response.json(incidents);
  },

  async create(request, response) {
    const { title, description, value } = request.body;
    const ong_id = request.headers.authorization; //recupera o id da ong logada

    const [id] = await connection('incidents').insert({
      title,
      description,
      value,
      ong_id
    });
    return response.json({ id }); //retorna o id do registro criado
  },

  async delete(request, response) {
    const { id } = request.params; //recupera o id a ser deletado
    const ong_id = request.headers.authorization; // recupera o id da ong selecionada para validar se o registro excluído pertence a ela

    const incident = await connection('incidents') //busca na tabela incidents algum registro cujo id seja igual ao id a ser excluído, retornando o ong_id
      .where('id', id)
      .select('ong_id')
      .first(); //retorna os dados do primeiro registro

    if (incident.ong_id !== ong_id) { //valida se o ong-id do registro a ser deletado  é diferente ao ong_id da ong logada
      return response.status(401).json({ error: 'Operaion not permitted.' }); //retorna um estatus nao autorizado
    }

    await connection('incidents').where('id', id).delete(); //detele o registro

    return response.status(204).send(); //retorna uma mensagem de sucesso sem conteúdo (204)
  }
}