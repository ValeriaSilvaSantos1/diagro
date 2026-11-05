import { photo } from './images'
import type { CatalogEntry } from '@/types/domain'

/**
 * Demonstration catalog. Texts are general, non-validated descriptions written
 * for the prototype and must be reviewed by agronomy professionals before any
 * real use. No treatment recommendations are included on purpose.
 */
export const CATALOG: CatalogEntry[] = [
  {
    id: 'requeima',
    name: 'Requeima',
    crops: ['Tomate', 'Batata'],
    agent: 'Phytophthora infestans',
    image: photo('spotsBacklit', 900),
    summary: 'Costuma ser associada a períodos frios e úmidos e pode afetar folhas, hastes e frutos.',
    description:
      'A requeima é citada com frequência como uma doença foliar de atenção no tomateiro e na batata. Os sinais descritos incluem manchas escuras de aspecto encharcado, que podem avançar rapidamente quando o clima favorece.',
    signs: [
      'Manchas escuras com aspecto encharcado',
      'Lesões que avançam a partir das bordas da folha',
      'Possível crescimento esbranquiçado na face inferior em clima úmido',
    ],
  },
  {
    id: 'pinta-preta',
    name: 'Pinta-preta',
    crops: ['Tomate', 'Batata'],
    agent: 'Alternaria spp.',
    image: photo('spotsBrown', 900),
    summary: 'Manchas escuras com anéis concêntricos, geralmente iniciando pelas folhas mais velhas.',
    description:
      'A pinta-preta é geralmente descrita por lesões marrons a pretas com aparência de anéis concêntricos. É comum que os primeiros sinais apareçam nas folhas da parte inferior da planta.',
    signs: ['Manchas marrons a pretas com anéis concêntricos', 'Halo amarelado ao redor das lesões', 'Início comum nas folhas inferiores'],
  },
  {
    id: 'ferrugem-asiatica',
    name: 'Ferrugem-asiática',
    crops: ['Soja'],
    agent: 'Phakopsora pachyrhizi',
    image: photo('spotsMacro', 900),
    summary: 'Pequenas lesões na face inferior das folhas, que podem evoluir para amarelecimento.',
    description:
      'A ferrugem-asiática é descrita na soja por pequenas lesões, mais visíveis na face inferior da folha. Com a evolução, as folhas podem amarelar e cair antes do esperado.',
    signs: ['Pequenos pontos escuros na face inferior da folha', 'Pústulas com aspecto de pó quando vistas de perto', 'Amarelecimento progressivo das folhas'],
  },
  {
    id: 'cercosporiose',
    name: 'Cercosporiose',
    crops: ['Milho'],
    agent: 'Cercospora zeae-maydis',
    image: photo('spotsLong', 900),
    summary: 'Lesões alongadas e retangulares, delimitadas pelas nervuras da folha.',
    description:
      'No milho, a cercosporiose costuma ser descrita por manchas retangulares acinzentadas, paralelas às nervuras. Os sinais geralmente aparecem primeiro nas folhas mais baixas.',
    signs: ['Lesões retangulares de cor acinzentada', 'Manchas paralelas às nervuras', 'Início frequente nas folhas inferiores'],
  },
  {
    id: 'ferrugem-comum',
    name: 'Ferrugem-comum',
    crops: ['Milho'],
    agent: 'Puccinia sorghi',
    image: photo('discolored', 900),
    summary: 'Pústulas alongadas de cor marrom-avermelhada nas duas faces da folha.',
    description:
      'A ferrugem-comum do milho é geralmente reconhecida por pequenas pústulas marrom-avermelhadas, distribuídas nas duas faces da folha.',
    signs: ['Pústulas pequenas e alongadas', 'Coloração marrom-avermelhada', 'Presença nas duas faces da folha'],
  },
  {
    id: 'antracnose',
    name: 'Antracnose',
    crops: ['Feijão'],
    agent: 'Colletotrichum lindemuthianum',
    image: photo('heroLeaf', 900),
    summary: 'Lesões escuras ao longo das nervuras, principalmente na face inferior das folhas.',
    description:
      'No feijoeiro, a antracnose é descrita por lesões escuras que acompanham as nervuras. Também pode haver sinais em vagens e hastes.',
    signs: ['Escurecimento ao longo das nervuras', 'Lesões mais visíveis na face inferior', 'Possíveis manchas em vagens'],
  },
  {
    id: 'mancha-angular',
    name: 'Mancha-angular',
    crops: ['Feijão'],
    agent: 'Pseudocercospora griseola',
    image: photo('spotsYellow', 900),
    summary: 'Manchas de formato angular, limitadas pelas nervuras da folha.',
    description:
      'A mancha-angular é descrita no feijoeiro por manchas acinzentadas a marrons com contorno angular, pois ficam limitadas pelas nervuras.',
    signs: ['Manchas com contorno angular', 'Coloração acinzentada a marrom', 'Lesões limitadas pelas nervuras'],
  },
  {
    id: 'mosaico',
    name: 'Sintomas de mosaico',
    crops: ['Diversas culturas'],
    agent: 'Associado a diferentes vírus',
    image: photo('mosaic', 900),
    summary: 'Padrão de áreas verde-claras e verde-escuras alternadas nas folhas.',
    description:
      'O termo mosaico descreve um padrão visual, e não uma única doença. Ele pode estar associado a diferentes vírus e também ser confundido com deficiências nutricionais.',
    signs: ['Áreas claras e escuras alternadas', 'Possível deformação das folhas', 'Crescimento reduzido em alguns casos'],
  },
]

export const catalogById = (id: string | null | undefined) => CATALOG.find((c) => c.id === id) ?? null
