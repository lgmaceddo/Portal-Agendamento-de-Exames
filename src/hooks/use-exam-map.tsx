import { useMemo } from "react";
import { useData } from "@/contexts/DataContext";
import { detailedExamData } from "@/data/initialData";
import { DetailedExam } from "@/types/data";

interface ExamMapEntry extends DetailedExam {
    id: string;
}

export const useExamMap = (): Record<string, ExamMapEntry> => {
    const { valueTableData } = useData();

    const examMap = useMemo(() => {
        const map: Record<string, ExamMapEntry> = {};

        // 1. Adicionar exames fixos (para compatibilidade com dados iniciais)
        Object.entries(detailedExamData).forEach(([id, info]) => {
            map[id] = { ...info, id };
        });

        // 2. Adicionar exames da Tabela de Valores (usando o código como ID)
        const valueData = valueTableData['GERAL'] || {};
        
        Object.values(valueData).forEach(categoryItems => {
            categoryItems.forEach(item => {
                // Usa o código como ID
                if (!map[item.codigo]) {
                    map[item.codigo] = {
                        id: item.codigo,
                        name: item.nome,
                        category: 'VALORES', // Categoria genérica para itens da tabela de valores
                    };
                }
            });
        });

        return map;
    }, [valueTableData]);

    return examMap;
};