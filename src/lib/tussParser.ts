import { TussCode } from "@/types/data";

export const parseTussCSV = (csvContent: string): TussCode[] => {
    const lines = csvContent.split('\n').filter(line => line.trim());
    const codes: TussCode[] = [];

    // Pula o cabeçalho (primeira linha)
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Parse CSV considerando campos entre aspas
        const matches = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
        if (!matches || matches.length < 2) continue;

        const code = matches[0].replace(/^"|"$/g, '').trim();
        const description = matches[1].replace(/^"|"$/g, '').trim();

        if (code && description) {
            codes.push({
                id: `tuss-${Date.now()}-${i}`,
                code,
                description,
            });
        }
    }

    return codes;
};

export const parseTussJSON = (jsonContent: string): TussCode[] => {
    try {
        const data = JSON.parse(jsonContent);

        if (!Array.isArray(data)) {
            throw new Error("JSON deve ser um array de objetos");
        }

        return data.map((item, index) => ({
            id: item.id || `tuss-${Date.now()}-${index}`,
            code: item.code || item.codigo || "",
            description: item.description || item.descricao || item.procedimento || "",
        })).filter(item => item.code && item.description);
    } catch (error) {
        throw new Error("Formato JSON inválido");
    }
};

export const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            resolve(text);
        };
        reader.onerror = () => reject(new Error("Erro ao ler o arquivo"));
        reader.readAsText(file, 'UTF-8');
    });
};
