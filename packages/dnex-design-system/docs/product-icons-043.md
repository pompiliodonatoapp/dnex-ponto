# Glifos de produto DNEX — OODA043

O catálogo contém 21 identidades vetoriais. A identidade de um produto não informa disponibilidade, licença ou conclusão de sua implementação. O estado operacional continua responsabilidade do consumidor.

| Chave canônica | Desenho | Alias aditivo |
| --- | --- | --- |
| `gestao` | Grade de gestão com gráfico de barras | — |
| `xml` | Documento com chevrons e barra de código | — |
| `nfe` | Recibo com confirmação | `notas-fiscais` |
| `juridico` | Balança | `jurídico` |
| `incorporadora` | Edifícios de alturas diferentes | — |
| `marketing` | Megafone de campanha com ondas de alcance | — |
| `portal-cliente` | Porta de acesso com pessoa e fechadura | — |
| `gestao-contador` | Maleta profissional com gráfico de carteira, existente | `contador` |

Gestão empresarial e Gestão Contador têm desenhos distintos. Os aliases históricos `gestao360 → hub`, `econte → fiscal` e `juris → normas` continuam inalterados; o fallback de chave desconhecida também permanece Hub. Use chaves canônicas nos novos catálogos.

## Uso

```tsx
import { ProductGlyph } from "@dnex/ds";

<ProductGlyph product="xml" size={32} label="DNEX XML" />
<ProductGlyph product="notas-fiscais" size={28} />
<ProductGlyph product="marketing" size={32} label="DNEX Marketing" />
<ProductGlyph product="portal-cliente" size={32} label="Portal do Cliente" />
```

Quando o botão ou link já possui nome acessível, omita `label`: a imagem é decorativa. Em uso independente, forneça `label`. Os SVGs também contêm título e descrição para abertura/exportação autônoma.

Os arquivos nativos estão em `src/assets/products/dnex-{chave}.svg`. Não contêm bitmap, fontes, scripts ou recursos externos. A prancheta é 128×128, fundo índigo `#1E1B4B` com raio 28, traços arredondados de 7/8 unidades e um acento âmbar `#F59E0B`; demais cores `#C7CCFE`, `#818BF6` e `#4F46E5`. O componente define a dimensão final; mínimo recomendado 24 px.

## Distribuição e validação

O kit é a fonte de manutenção. Distribua por `scripts/ds-snapshot.mjs` usando commit imutável e manifesto de hashes, conforme NOTICE/ADR-028; não altere SVGs ou ProductGlyph nas cópias geradas dos produtos. O showcase ProductIdentitySection apresenta as 21 identidades, incluindo Folha, Marketing e Portal do Cliente.

O teste focal `tests/product-glyphs043.test.ts` executa o componente TSX para verificar resolução de catálogo/aliases, props de acessibilidade, dimensões, preservação byte a byte dos 14 SVGs legados e ausência de recursos externos nos novos vetores. A inspeção visual em 24/32/56 px e integração do consumidor é um gate separado, coordenado pela frente OODA043.
