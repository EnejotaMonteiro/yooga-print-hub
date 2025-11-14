import { useState, useEffect } from "react";
import { useForm } from "react-hook-form"; // Corrigido para react-hook-form
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { convertToEmbedUrl } from "@/lib/utils"; // Importar a função de utilidade

const printerFormSchema = z.object({
  nome: z.string().optional(),
  video_url: z.string().optional(),
  download_url: z.string().optional(),
  imagem_url: z.string().optional(),
  windows_recomendado: z.string().optional().default("Windows 10 e 11"),
  conexao_rede: z.boolean().optional().default(true),
  ativo: z.boolean().optional().default(true),
  ordem: z.coerce.number().int().min(0).optional().default(0), // Keep in schema for default value on insert
});

type PrinterFormValues = z.infer<typeof printerFormSchema>;

interface PrinterFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  printer?: any;
  onSuccess: () => void;
}

export const PrinterFormDialog = ({
  open,
  onOpenChange,
  printer,
  onSuccess,
}: PrinterFormDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const isEditing = !!printer;

  const form = useForm<PrinterFormValues>({
    resolver: zodResolver(printerFormSchema),
    defaultValues: {
      nome: printer?.nome || "",
      video_url: printer?.video_url || "",
      download_url: printer?.download_url || "",
      imagem_url: printer?.imagem_url || "",
      windows_recomendado: printer?.windows_recomendado || "Windows 10 e 11",
      conexao_rede: printer?.conexao_rede ?? true,
      ativo: printer?.ativo ?? true,
      ordem: printer?.ordem || 0,
    },
  });

  useEffect(() => {
    if (printer) {
      form.reset({
        nome: printer.nome || "",
        video_url: printer.video_url || "",
        download_url: printer.download_url || "",
        imagem_url: printer.imagem_url || "",
        windows_recomendado: printer.windows_recomendado || "Windows 10 e 11",
        conexao_rede: printer.conexao_rede ?? true,
        ativo: printer.ativo ?? true,
        ordem: printer.ordem || 0,
      });
    } else {
      form.reset({
        nome: "",
        video_url: "",
        download_url: "",
        imagem_url: "",
        windows_recomendado: "Windows 10 e 11",
        conexao_rede: true,
        ativo: true,
        ordem: 0,
      });
    }
  }, [printer, form]);

  const onSubmit = async (values: PrinterFormValues) => {
    setLoading(true);
    try {
      const formValuesToSave: Partial<PrinterFormValues> = {
        nome: values.nome,
        video_url: values.video_url,
        download_url: values.download_url,
        imagem_url: values.imagem_url,
        windows_recomendado: values.windows_recomendado,
        conexao_rede: values.conexao_rede,
        ativo: values.ativo,
      };

      if (isEditing) {
        const { error } = await supabase
          .from("impressoras")
          .update(formValuesToSave)
          .eq("id", printer.id);

        if (error) throw error;

        toast({
          title: "Impressora atualizada",
          description: "As informações foram atualizadas com sucesso",
        });
      } else {
        const { error } = await supabase
          .from("impressoras")
          .insert([
            {
              ...formValuesToSave,
              ordem: values.ordem,
            }
          ]);

        if (error) throw error;

        toast({
          title: "Impressora adicionada",
          description: "A nova impressora foi cadastrada com sucesso",
        });
      }

      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao salvar a impressora",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Impressora" : "Adicionar Nova Impressora"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações da impressora"
              : "Preencha os dados para cadastrar uma nova impressora"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Impressora</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Elgin i9" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="video_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Vídeo de Instalação</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://www.youtube.com/watch?v=..."
                      {...field}
                      onChange={(e) => field.onChange(convertToEmbedUrl(e.target.value))} // Converter URL
                    />
                  </FormControl>
                  <FormDescription>
                    Use o formato embed do YouTube
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="download_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de Download do Driver</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://drive.google.com/..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imagem_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Imagem</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    URL da imagem da impressora
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="windows_recomendado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Windows Recomendado</FormLabel>
                  <FormControl>
                    <Input placeholder="Windows 10 e 11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* REMOVED ORDEM FIELD FROM UI */}

            <FormField
              control={form.control}
              name="conexao_rede"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Conexão de Rede</FormLabel>
                    <FormDescription>
                      Impressora possui conexão de rede
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ativo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Ativo</FormLabel>
                    <FormDescription>
                      Exibir impressora no site
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : isEditing ? "Atualizar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};