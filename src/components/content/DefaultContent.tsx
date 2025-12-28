import { AlertCircle } from "lucide-react";

interface DefaultContentProps {
  section: string;
  subCategory?: string;
}

export const DefaultContent = ({ section, subCategory }: DefaultContentProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
      <h2 className="text-2xl font-bold text-foreground mb-2">
        {subCategory || section}
      </h2>
      <p className="text-muted-foreground">
        Visualização para esta seção ainda não foi implementada.
      </p>
    </div>
  );
};
