const fs=require('fs');const f='src/data/artigos.json';const L=JSON.parse(fs.readFileSync(f,'utf8').replace(/^\uFEFF/,''));
const Q=(p,o,i,e)=>({pergunta:p,opcoes:o,indiceCorreto:i,explicacao:e});
const quiz={
'doenca-de-chagas':[
 Q('Qual inseto transmite a doença descoberta por Carlos Chagas?',['Mosquito-prego','Barbeiro','Pulga'],1,'O barbeiro sai das frestas das paredes à noite e pica o rosto de quem dorme.'),
 Q('Em quem Carlos Chagas encontrou o parasita no sangue, completando a prova?',['Em Berenice, uma menina de 2 anos','Em Belisário Penna','Em um trabalhador da ferrovia adulto'],0,'No sangue da menina Berenice, com febre, ele viu os mesmos parasitas se mexendo.'),
 Q('Que nome o parasita recebeu, em homenagem a Oswaldo Cruz?',['Plasmodium cruzi','Trypanosoma cruzi','Leishmania cruzi'],1,'Trypanosoma cruzi, o nome do parasita que causa a doença de Chagas.')],
'proclamacao-da-republica':[
 Q('Qual foi o alvo imediato da ação de Deodoro em 15 de novembro de 1889?',['O imperador dom Pedro II','O gabinete do visconde de Ouro Preto','A princesa Isabel'],1,'Ele depôs o ministério de Ouro Preto; o imperador, em teoria, continuava no trono.'),
 Q('Quem era o marechal que liderou o movimento?',['Floriano Peixoto','Deodoro da Fonseca','Benjamin Constant'],1,'O marechal Deodoro da Fonseca, que se tornou o primeiro presidente.'),
 Q('Para onde seguiu a família imperial na madrugada de 17 de novembro?',['Para a Europa, de navio','Para Petrópolis','Para Portugal por terra'],0,'Dom Pedro II foi levado ao cais e o navio seguiu para a Europa. Ele morreria na França.')],
'hiroo-onoda':[
 Q('Por quantos anos, aproximadamente, Onoda seguiu em guerra depois do fim do conflito?',['9 anos','29 anos','49 anos'],1,'A guerra tinha acabado 29 anos antes de ele ser encontrado, em 1974.'),
 Q('O que finalmente o fez deixar as armas?',['Um panfleto jogado de avião','A voz do irmão no alto-falante','A ordem do seu antigo comandante, o major Taniguchi'],2,'Onoda só aceitaria a ordem de um superior; Taniguchi voou até Lubang e leu a ordem oficial.'),
 Q('Para que país Onoda se mudou em 1975?',['Brasil','Estados Unidos','Filipinas'],0,'Ele criou gado em Terenos, Mato Grosso do Sul.')],
'bandeira-do-brasil':[
 Q('Quanto tempo durou a primeira bandeira da República?',['Quatro dias','Quatro meses','Quatro anos'],0,'De 15 a 19 de novembro de 1889, quando o Decreto nº 4 oficializou a nova bandeira.'),
 Q('A bandeira provisória lembrava a de qual país?',['França','Estados Unidos','Argentina'],1,'Eram listras verdes e amarelas com um canto azul cheio de estrelas.'),
 Q('Que estado a estrela Spica representa?',['Distrito Federal','Pará','Rio de Janeiro'],1,'Segundo as fontes, Spica, a estrela sozinha acima da faixa, representa o Pará.')],
'zumbi-e-palmares':[
 Q('Em que data morreu Zumbi, segundo os relatos?',['20 de novembro de 1695','15 de novembro de 1889','13 de maio de 1888'],0,'Por isso 20 de novembro é o Dia da Consciência Negra.'),
 Q('Qual foi a proposta do acordo de paz de 1678?',['Terra e liberdade, mas só para quem nasceu no quilombo','Liberdade para todos os quilombolas','Dinheiro em troca da rendição'],0,'Ganga Zumba aceitou, Zumbi recusou e Palmares se dividiu.'),
 Q('Onde ficava o quilombo dos Palmares?',['Serra da Barriga, em Alagoas','Chapada Diamantina, na Bahia','Recife, em Pernambuco'],0,'A Serra da Barriga, no atual estado de Alagoas.')],
'brasil-e-guiana-francesa':[
 Q('Qual rio, citado no Tratado de Utrecht (1713), ninguém sabia onde ficava?',['Amazonas','Japoc','Tocantins'],1,'O Japoc era o limite no papel, mas nenhum mapa resolvia onde ele ficava.'),
 Q('O que a Corte portuguesa levou de Caiena para o Brasil?',['Plantas como noz-moscada e cravo','Ouro','Navios de guerra'],0,'Entre elas, a palmeira imperial do Jardim Botânico do Rio.'),
 Q('Quem decidiu a disputa de limites entre Brasil e França?',['A Inglaterra','Os Estados Unidos','A Suíça'],2,'O árbitro suíço Walter Hauser deu a sentença em 1900, favorável ao Brasil.')],
'eua-x-china':[
 Q('Até quando vale a trégua entre EUA e China, segundo o vídeo?',['10 de janeiro de 2027','10 de novembro de 2026','31 de dezembro de 2025'],0,'A pausa foi prorrogada horas antes do prazo de 10 de novembro.'),
 Q('Quais são as quatro frentes da disputa?',['Comércio, minerais, chips e Taiwan','Petróleo, gás, soja e carros','Armas, clima, saúde e esportes'],0,'Comércio, terras raras (minerais), chips e Taiwan.'),
 Q('Que empresa taiwanesa fabrica mais de dois terços dos chips sob encomenda do mundo?',['Nvidia','TSMC','Huawei'],1,'A TSMC, o que torna Taiwan o ponto mais delicado da disputa.')],
'enchente-de-cerveja-de-londres':[
 Q('Em que ano ocorreu a enchente de cerveja em Londres?',['1814','1914','1714'],0,'Dia 17 de outubro de 1814, na cervejaria Horse Shoe.'),
 Q('Quantas pessoas morreram?',['Três','Oito','Trinta'],1,'Oito pessoas, entre mulheres e crianças.'),
 Q('Qual foi o veredicto do júri dois dias depois?',['Falha da cervejaria','Acidente e infortúnio, sem culpados','Sabotagem'],1,'Nos relatos populares, virou um ato de Deus. As famílias não receberam indenização.')],
'como-nasce-um-pais':[
 Q('Quantos requisitos a Convenção de Montevidéu (1933) lista para um Estado?',['Dois','Quatro','Sete'],1,'População permanente, território definido, governo e capacidade de se relacionar com outros países.'),
 Q('Como a Tchecoslováquia virou dois países em 1993?',['Por uma guerra civil','Por uma separação amigável, sem guerra','Por decisão da ONU'],1,'A República Tcheca e a Eslováquia nasceram de um divórcio amigável, sem guerra.'),
 Q('Qual é o país mais novo a entrar na ONU, segundo o vídeo?',['Kosovo','Sudão do Sul','Eslováquia'],1,'O Sudão do Sul foi aceito em julho de 2011, como o 193º membro. O Kosovo ainda está fora da ONU.')]};
let n=0;for(const a of L){if(quiz[a.id]){a.quiz=quiz[a.id];a.pontosAConfirmar=(a.pontosAConfirmar||[]).filter(x=>!/Quiz/.test(x));n++}}
fs.writeFileSync(f,JSON.stringify(L,null,2));console.log('quizzes em',n,'artigos; sem quiz:',L.filter(a=>!a.quiz.length).map(a=>a.id))