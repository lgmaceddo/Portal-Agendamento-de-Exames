import * as XLSX from 'xlsx';
import { ValueTableItem, Category } from '../types/data';

interface ExcelRow {
  [key: string]: string | number | undefined;
}

// Categoria única GERAL para todos os exames
const GERAL_CATEGORY: Category = {
  id: 'vt-cat-geral',
  name: 'GERAL',
  color: '#0d9488' // Verde teal
};

// Remove acentos e caracteres invisíveis/especiais de uma string para comparação
function removeAccents(str: string | undefined | null): string {
  if (!str) return '';
  const strValue = String(str);
  return strValue
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove caracteres invisíveis (zero-width)
    .replace(/\s+/g, ' ') // Normaliza múltiplos espaços para um só
    .trim();
}

// Busca uma coluna no objeto ignorando case e acentos
function findColumnValue(row: ExcelRow, possibleNames: string[]): string | undefined {
  const keys = Object.keys(row);

  for (const name of possibleNames) {
    const normalizedName = removeAccents(name.toLowerCase().trim());

    for (const key of keys) {
      const normalizedKey = removeAccents(key.toLowerCase().trim());
      if (normalizedKey === normalizedName || normalizedKey.includes(normalizedName) || normalizedName.includes(normalizedKey)) {
        const value = row[key];
        if (value !== undefined && value !== null && value !== '') {
          return String(value);
        }
      }
    }
  }

  return undefined;
}

// Busca valor por índice de coluna (__EMPTY, __EMPTY_1, etc.)
function getValueByColumnIndex(row: ExcelRow, index: number): string | undefined {
  const keys = Object.keys(row);

  // Primeiro tenta a primeira coluna (que geralmente tem o nome do sheet)
  if (index === 0) {
    const firstKey = keys[0];
    if (firstKey && !firstKey.startsWith('__EMPTY')) {
      const value = row[firstKey];
      if (value !== undefined && value !== null && value !== '') {
        return String(value);
      }
    }
  }

  // Depois tenta __EMPTY, __EMPTY_1, etc.
  const emptyKey = index === 0 ? '__EMPTY' : `__EMPTY_${index}`;
  if (row[emptyKey] !== undefined && row[emptyKey] !== null && row[emptyKey] !== '') {
    return String(row[emptyKey]);
  }

  // Fallback para o índice direto
  const key = keys[index];
  if (key && row[key] !== undefined && row[key] !== null && row[key] !== '') {
    return String(row[key]);
  }

  return undefined;
}

function parseMoneyValue(value: string | undefined): number {
  if (!value) return 0;

  // Converte para string se for número
  const strValue = String(value);

  // Remove "R$", espaços
  let cleaned = strValue.replace(/R\$\s*/gi, '').trim();

  // Se contém vírgula e ponto, assume formato brasileiro (1.234,56)
  if (cleaned.includes(',') && cleaned.includes('.')) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  }
  // Se contém apenas vírgula, assume que é decimal brasileiro
  else if (cleaned.includes(',')) {
    cleaned = cleaned.replace(',', '.');
  }
  // Se contém apenas ponto, verifica se é milhar ou decimal
  else if (cleaned.includes('.')) {
    const parts = cleaned.split('.');
    if (parts.length === 2 && parts[1].length === 3) {
      cleaned = cleaned.replace('.', '');
    }
  }

  const parsed = parseFloat(cleaned);

  return isNaN(parsed) ? 0 : parsed;
}

// Detecta o formato do arquivo baseado nos cabeçalhos
function detectFileFormat(firstRow: ExcelRow): 'standard' | 'positional' {
  const keys = Object.keys(firstRow);

  // Se tem colunas __EMPTY, provavelmente é formato posicional
  const hasEmptyColumns = keys.some(k => k.startsWith('__EMPTY'));

  // Se a primeira coluna não é um nome de coluna padrão, é posicional
  const firstKey = keys[0];
  const standardColumns = ['item', 'codigo', 'cod', 'descrição', 'descricao', 'procedimento'];
  const isStandardFirstColumn = standardColumns.some(col =>
    removeAccents(firstKey?.toLowerCase() || '').includes(col)
  );

  if (hasEmptyColumns && !isStandardFirstColumn) {
    return 'positional';
  }

  return 'standard';
}

export function importExcelData(file: File): Promise<{
  values: ValueTableItem[];
  categories: Category[];
  stats: {
    totalRows: number;
    validRows: number;
    skippedRows: number;
    detectedColumns: string[];
  };
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        const values: ValueTableItem[] = [];
        let totalRows = 0;
        let skippedRows = 0;
        const detectedColumns: Set<string> = new Set();

        // Processa cada sheet do Excel
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);

          console.log(`[Excel Import] Sheet "${sheetName}": ${jsonData.length} linhas`);

          if (jsonData.length === 0) return;

          const keys = Object.keys(jsonData[0] || {});
          console.log('[Excel Import] Colunas encontradas:', keys);
          keys.forEach(col => detectedColumns.add(col));

          // Detecta o formato do arquivo
          const format = detectFileFormat(jsonData[0]);
          console.log(`[Excel Import] Formato detectado: ${format}`);

          jsonData.forEach((row, index) => {
            totalRows++;

            let codigo: string | undefined;
            let descricao: string | undefined;
            let honorarioStr: string | undefined;
            let exameCartaoStr: string | undefined;

            if (format === 'positional') {
              // Formato posicional: primeira coluna ou __EMPTY é o código/descrição
              // Estrutura típica: Coluna 0 = Código, Coluna 1 = Descrição, Coluna 2 = HM, Coluna 3 = Exame
              // OU: Coluna 0 = Descrição (com código no início), Coluna 1 = HM, Coluna 2 = Exame

              const col0 = getValueByColumnIndex(row, 0);
              const col1 = getValueByColumnIndex(row, 1);
              const col2 = getValueByColumnIndex(row, 2);
              const col3 = getValueByColumnIndex(row, 3);
              const col4 = getValueByColumnIndex(row, 4);

              // Ignora linhas de cabeçalho/separação
              if (!col0 || col0.toUpperCase().includes('HONORÁRIO') ||
                col0.toUpperCase().includes('VALOR') ||
                col0.toUpperCase().includes('CÓDIGO') ||
                col0.toUpperCase().includes('ITEM') ||
                col0.toUpperCase().includes('PROCEDIMENTO')) {
                skippedRows++;
                return;
              }

              // Tenta detectar se col0 é código ou descrição
              // Códigos geralmente são numéricos ou alfanuméricos curtos
              const isCol0Numeric = /^\d+$/.test(col0.trim());
              const isCol0ShortCode = col0.trim().length <= 10 && /^[A-Z0-9\-\.]+$/i.test(col0.trim());

              if (isCol0Numeric || isCol0ShortCode) {
                // col0 é código
                codigo = col0;
                descricao = col1;
                honorarioStr = col2;
                exameCartaoStr = col3 || col4;
              } else {
                // col0 pode ser descrição (ou tem código embutido)
                // Tenta extrair código do início da descrição
                const match = col0.match(/^(\d+)\s*[-–]\s*(.+)$/) ||
                  col0.match(/^(\d+)\s+(.+)$/) ||
                  col0.match(/^([A-Z0-9]{3,10})\s*[-–]\s*(.+)$/i);

                if (match) {
                  codigo = match[1];
                  descricao = match[2];
                  honorarioStr = col1;
                  exameCartaoStr = col2 || col3;
                } else {
                  // Usa linha como código, col0 como descrição
                  codigo = `${sheetName.substring(0, 3).toUpperCase()}-${String(index + 1).padStart(3, '0')}`;
                  descricao = col0;
                  honorarioStr = col1;
                  exameCartaoStr = col2 || col3;
                }
              }
            } else {
              // Formato padrão com colunas nomeadas
              codigo = findColumnValue(row, ['ITEM', 'CODIGO', 'COD', 'CÓDIGO', 'ID']);
              descricao = findColumnValue(row, ['DESCRIÇÃO', 'DESCRICAO', 'PROCEDIMENTO', 'NOME', 'EXAME', 'DESCRIPTION']);
              honorarioStr = findColumnValue(row, ['HONORÁRIO MÉDICO', 'HONORARIO MEDICO', 'HM', 'HONORÁRIO', 'HONORARIO']);
              exameCartaoStr = findColumnValue(row, ['VALOR EXAME', 'EXAME', 'PACOTE CDU', 'VALOR', 'TOTAL EXAME']);
            }

            // Validações básicas
            if (!descricao || descricao.trim() === '') {
              skippedRows++;
              return;
            }

            // Ignora linhas que parecem ser cabeçalhos
            const descUpper = descricao.toUpperCase();
            if (descUpper.includes('HONORÁRIO') && descUpper.includes('MÉDICO') ||
              descUpper === 'DESCRIÇÃO' || descUpper === 'PROCEDIMENTO' ||
              descUpper.includes('VALOR EXAME')) {
              skippedRows++;
              return;
            }

            const honorario = parseMoneyValue(honorarioStr);
            const exameCartao = parseMoneyValue(exameCartaoStr);

            // Gera código se não tiver
            if (!codigo || codigo.trim() === '') {
              codigo = `${sheetName.substring(0, 3).toUpperCase()}-${String(index + 1).padStart(3, '0')}`;
            }

            // Cria o item de valor
            const item: ValueTableItem = {
              id: `value-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              codigo: codigo.trim(),
              nome: descricao.trim(),
              info: '',
              honorario,
              exame_cartao: exameCartao,
              material_min: 0,
              material_max: 0,
              honorarios_diferenciados: []
            };

            values.push(item);
          });
        });

        // Ordena alfabeticamente pelo nome do exame
        values.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

        console.log(`[Excel Import] Resultado: ${values.length} exames válidos de ${totalRows} linhas (${skippedRows} ignoradas)`);

        resolve({
          values,
          categories: [GERAL_CATEGORY],
          stats: {
            totalRows,
            validRows: values.length,
            skippedRows,
            detectedColumns: Array.from(detectedColumns)
          }
        });
      } catch (error) {
        console.error('[Excel Import] Erro:', error);
        reject(error);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsBinaryString(file);
  });
}

// Função de substituição total que mantém IDs de itens existentes para estabilidade
export function mergeValueTableItems(
  existingItems: ValueTableItem[],
  importedItems: ValueTableItem[]
): {
  mergedItems: ValueTableItem[];
  stats: {
    updated: number;
    added: number;
    unchanged: number;
    removed: number;
  };
} {
  const existingByCode = new Map<string, ValueTableItem>();
  const existingByName = new Map<string, ValueTableItem>();

  existingItems.forEach(item => {
    if (item.codigo) existingByCode.set(item.codigo, item);
    existingByName.set(removeAccents(item.nome.toUpperCase().trim()), item);
  });

  const finalItems: ValueTableItem[] = [];
  let updated = 0;
  let added = 0;
  let unchanged = 0;

  importedItems.forEach((importedItem, index) => {
    const normalizedName = removeAccents(importedItem.nome.toUpperCase().trim());

    // Tenta encontrar por código primeiro, depois por nome
    let existing = existingByCode.get(importedItem.codigo);
    if (!existing) {
      existing = existingByName.get(normalizedName);
    }

    if (existing) {
      const hasChanges =
        existing.nome !== importedItem.nome ||
        existing.codigo !== importedItem.codigo ||
        existing.honorario !== importedItem.honorario ||
        existing.exame_cartao !== importedItem.exame_cartao;

      if (hasChanges) updated++;
      else unchanged++;

      finalItems.push({
        ...existing,
        nome: importedItem.nome,
        codigo: importedItem.codigo,
        honorario: importedItem.honorario,
        exame_cartao: importedItem.exame_cartao,
      });
    } else {
      const newItemId = `v-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`;
      finalItems.push({
        ...importedItem,
        id: newItemId,
      });
      added++;
    }
  });

  const removed = existingItems.length - (finalItems.length - added);
  finalItems.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  return {
    mergedItems: finalItems,
    stats: { updated, added, unchanged, removed }
  };
}
