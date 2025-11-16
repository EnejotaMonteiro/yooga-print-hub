import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

export type ScaleProcess = Tables<'scale_processes'>;

const scaleProcessFormSchema = z.object({
  title: z.string().min(1, "O título do processo é obrigatório."),
  button_text: z.string().min(1, "O texto do botão é obrigatório."),
  content: z.string().min(1, "O conteúdo do processo é obrigatório."),
  ordem: z.coerce.number().int().min(0).optional().default(0),
});

type ScaleProcessFormValues = z.infer<typeof scaleProcessFormSchema>;

interface ScaleProcessFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  process?: ScaleProcess | null;
  onSuccess: () => void;
}

export const ScaleProcessFormDialog = ({
  open,
  onOpenChange,
  process,
  onSuccess,
}: ScaleProcessFormDialogProps) => {
  const [loading, setLoading] = useState(false);
  const isEditing = !!process;

  const form = useForm<ScaleProcessFormValues>({
    resolver: zodResolver(scaleProcessFormSchema),
    defaultValues: {
      title: process?.title || "",
      button_text: process?.button_text || "",
      content: process?.content || "",
      ordem: process?.ordem || 0,
    },
  });

  useEffect(() => {
    if (process) {
      form.reset({
        title: process.title || "",
        button_text: process.button_text || "",
        content: process.content || "",
        ordem: process.ordem || 0,
      });
    } else {
      form.reset({
        title: "",
        button_text: "",
        content: "",
        ordem: 0,
      });
    }
  }, [process, form]);

  const onSubmit = async (values: ScaleProcessFormValues) => {
    setLoading(true);
    try {
      const processData = {
        title: values.title,
        button_text: values.button_text,
        content: values.content,
        ordem: values.ordem,
      };

      if (isEditing) {
        const { error } = await supabase
          .from("scale_processes")
          .update(processData)
          .eq("id", process.id);

        if (error) throw error;

        toast.success("Processo atualizado", {
          description: "As informações do processo foram atualizadas com sucesso",
        });
      } else {
        const { error } = await supabase
          .from("scale_processes")
          .insert([processData]);

        if (error) throw error;

        toast.success("Processo adicionado", {
          description: "O novo processo foi cadastrado com sucesso",
        });
      }

      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error("Erro", {
        description: error.message || "Ocorreu um erro ao salvar o processo",
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
            {isEditing ? "Editar Processo de Balança" : "Adicionar Novo Processo de Balança"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do processo"
              : "Preencha os dados para cadastrar um novo processo de balança"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título do Processo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Configuração PRIX 3 FIT" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="button_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Texto do Botão</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: PRIX 3 FIT" {...field} />
                  </FormControl>
                  <FormDescription>
                    Texto que aparecerá no botão na página de Balanças.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteúdo do Processo (Markdown)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o processo aqui usando Markdown..."
                      {...field}
                      rows={10}
                    />
                  </FormControl>
                  <FormDescription>
                    Use Markdown para formatar o texto (negrito, listas, títulos, etc.).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ordem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ordem de Exibição</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>
                    Define a ordem em que os botões aparecerão.
                  </FormDescription>
                  <FormMessage />
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
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  isEditing ? "Atualizar" : "Adicionar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};