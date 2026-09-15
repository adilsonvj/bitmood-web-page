import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => JSON.parse(readFileSync(new URL('../conteudo/' + path, import.meta.url), 'utf8'));
test('editable page content preserves the fields required by the layout', () => {
  const nav = read('navegacao.json');
  for (const id of ['inicio','pilares','sobre','canais','newsletter']) {
    assert.equal(typeof nav[id], 'string');
    const page = read('paginas/' + id + '.json');
    for (const key of ['sobretitulo','titulo_linha_1','titulo_linha_2','descricao']) assert.equal(typeof page[key], 'string');
  }
  const about = read('paginas/sobre.json');
  assert.equal(about.historia.length, 5);
  assert.equal(about.metodo.length, 5);
  assert.equal(about.fotos.length, 4);
  for (const paragraph of [...about.historia, ...about.metodo]) assert.equal(typeof paragraph, 'string');
  for (const photo of about.fotos) {
    assert.equal(typeof photo.titulo, 'string');
    assert.equal(typeof photo.legenda, 'string');
  }
  for (const field of ['rotulo_email','exemplo_email','botao','enviando','inscrito','consentimento','sucesso','erro','erro_conexao']) {
    assert.equal(typeof read('paginas/newsletter.json').formulario[field], 'string');
  }
});
