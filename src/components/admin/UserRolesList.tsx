import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSuperAdmin } from "@/hooks/use-super-admin";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield, ShieldOff, Loader2 } from "lucide-react";

interface UserWithRole {
  id: string;
  nome: string | null;
  email: string | null;
  isAdmin: boolean;
}

export const UserRolesList = () => {
  const queryClient = useQueryClient();
  const { isSuperAdmin, loading: superAdminLoading } = useSuperAdmin();
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ["users-with-roles"],
    queryFn: async () => {
      // Buscar todos os perfis
      const { data: profiles, error: profilesError } = await supabase
        .from("perfis")
        .select("id, nome")
        .order("nome");

      if (profilesError) throw profilesError;

      // Buscar emails dos usuários do auth
      const userIds = profiles?.map(p => p.id) || [];
      
      // Buscar usuários autenticados
      const authUsersMap = new Map<string, string>();
      for (const userId of userIds) {
        try {
          const { data: userData } = await supabase.auth.admin.getUserById(userId);
          if (userData?.user?.email) {
            authUsersMap.set(userId, userData.user.email);
          }
        } catch (error) {
          console.error(`Erro ao buscar usuário ${userId}:`, error);
        }
      }
      
      // Buscar roles de admin
      const { data: adminRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin")
        .in("user_id", userIds);

      if (rolesError) throw rolesError;

      const adminUserIds = new Set(adminRoles?.map(r => r.user_id) || []);

      // Combinar dados
      const usersWithRoles: UserWithRole[] = profiles?.map(profile => {
        return {
          id: profile.id,
          nome: profile.nome,
          email: authUsersMap.get(profile.id) || null,
          isAdmin: adminUserIds.has(profile.id)
        };
      }) || [];

      return usersWithRoles;
    }
  });

  const toggleAdminMutation = useMutation({
    mutationFn: async ({ userId, isCurrentlyAdmin }: { userId: string; isCurrentlyAdmin: boolean }) => {
      if (isCurrentlyAdmin) {
        // Remover role de admin
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", "admin");
        
        if (error) throw error;
      } else {
        // Adicionar role de admin
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: "admin" });
        
        if (error) throw error;
      }
    },
    onMutate: ({ userId }) => {
      setLoadingUserId(userId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users-with-roles"] });
      toast.success(
        variables.isCurrentlyAdmin 
          ? "Permissões de admin removidas com sucesso" 
          : "Usuário promovido a admin com sucesso"
      );
    },
    onError: (error) => {
      console.error("Erro ao alterar role:", error);
      toast.error("Erro ao alterar permissões do usuário");
    },
    onSettled: () => {
      setLoadingUserId(null);
    }
  });

  const handleToggleAdmin = (userId: string, isCurrentlyAdmin: boolean) => {
    toggleAdminMutation.mutate({ userId, isCurrentlyAdmin });
  };

  if (isLoading || superAdminLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Usuários</CardTitle>
          <CardDescription>Carregando usuários...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isSuperAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Usuários</CardTitle>
          <CardDescription>Gerencie as permissões de administrador dos usuários cadastrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">
            <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Acesso Restrito</h3>
            <p className="text-muted-foreground">
              Apenas administradores gerais podem gerenciar usuários.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Usuários</CardTitle>
        <CardDescription>
          Gerencie as permissões de administrador dos usuários cadastrados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Função</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users && users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.nome || "Sem nome"}
                    </TableCell>
                    <TableCell>{user.email || "Sem email"}</TableCell>
                    <TableCell>
                      {user.isAdmin ? (
                        <Badge variant="default">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Usuário</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant={user.isAdmin ? "destructive" : "default"}
                        size="sm"
                        onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                        disabled={loadingUserId === user.id}
                      >
                        {loadingUserId === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : user.isAdmin ? (
                          <>
                            <ShieldOff className="h-4 w-4 mr-1" />
                            Remover Admin
                          </>
                        ) : (
                          <>
                            <Shield className="h-4 w-4 mr-1" />
                            Tornar Admin
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Nenhum usuário encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
