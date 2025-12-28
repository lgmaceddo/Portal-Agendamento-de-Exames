import React from "react";
import { UserCircle2, Shield, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoleContext } from "@/contexts/UserRoleContext";
import { useData } from "@/contexts/DataContext";
import { cn } from "@/lib/utils";

export const UserProfileCard = () => {
  const { user } = useAuth();
  const { role, isAdmin, loading: roleLoading } = useUserRoleContext();
  const { userName } = useData();

  if (!user) return null;

  const displayRole = isAdmin ? 'Administrador' : 'Usuário';
  const roleIcon = isAdmin ? Shield : User;

  return (
    <Card className="mb-6 shadow-md border-2 border-primary/10 bg-card">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10 text-primary">
            <UserCircle2 className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-lg text-foreground truncate" title={userName || user.email}>
              {userName || "Usuário"}
            </p>
            <p className="text-xs text-muted-foreground truncate" title={user.email}>
              {user.email}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            {roleLoading ? (
              <Badge variant="secondary" className="text-xs">Carregando...</Badge>
            ) : (
              <Badge 
                className={cn(
                    "text-xs font-semibold uppercase",
                    isAdmin ? "bg-green-600 hover:bg-green-600/90 text-white" : "bg-muted text-muted-foreground"
                )}
              >
                {React.createElement(roleIcon, { className: "h-3 w-3 mr-1" })}
                {displayRole}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};