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
import { Loader2, UploadCloud, XCircle } from "lucide-react";
import { Utility } from "@/data/utilities"; // Importar a interface Utility
import { Label } from "@/components/ui/label";

const utilityFormSchema = z.object({
  name: z.string().min(1, "O nome do utilitário é obrigatório."),
  description: z.string().min(1, "A descrição é obrigatória."),
  download_url: z.string().url("A URL de download deve ser válida.").min(1, "A URL de download é obrigatória."),
  image_url: z.string().url("A URL da imagem deve ser válida.").optional().or(z.literal("")),
  // Removido: ordem: z.coerce.number().int().min(0).optional().default(0),
});

type UtilityFormValues = z.infer<typeof utilityFormSchema>;

interface UtilityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  utility?: Utility | null;
  onSuccess: () => void;
}

export const UtilityFormDialog = ({
  open,
  onOpenChange,
  utility,
  onSuccess,
}: UtilityFormDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const isEditing = !!utility;

  const form = useForm<UtilityFormValues>({
    resolver: zodResolver(utilityFormSchema),
    defaultValues: {
      name: utility?.name || "",
      description: utility?.description || "",
      download_url: utility?.download_url || "",
      image_url: utility?.image_url || "",
      // Removido: ordem: utility?.ordem || 0,
    },
  });

  useEffect(() => {
    if (utility) {
      form.reset({
        name: utility.name || "",
        description: utility.description || "",
        download_url: utility.download_url || "",
        image_url: utility.image_url || "",
        // Removido: ordem: utility.ordem || 0,
      });
      setCurrentImageUrl(utility.image_url);
    } else {
      form.reset({
        name: "",
        description: "",
        download_url: "",
        image_url: "",
        // Removido: ordem: 0,
      });
      setCurrentImageUrl(null);
    }
    setImageFile(null);
  }, [utility, form]);

  const uploadFile = async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from('utilitarios') // Usar um bucket específico para utilitários
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) throw error;
    
    const { data: publicUrlData } = supabase.storage
      .from('utilitarios')
      .getPublicUrl(path);

    return publicUrlData.publicUrl;
  };

  const onSubmit = async (values: UtilityFormValues) => {
    setLoading(true);
    let imageUrlToSave: string | null = currentImageUrl;

    try {
      if (imageFile) {
        const filePath = `images/${Date.now()}-${imageFile.name}`;
        imageUrlToSave = await uploadFile(imageFile, filePath);
      } else if (currentImageUrl === null) { // Se a imagem foi removida
        imageUrlToSave = null;
      }

      const utilityData = {
        name: values.name,
        description: values.description,
        download_url: values.download_url,
        image_url: imageUrlToSave,
        // Removido: ordem: values.ordem,
      };

      if (isEditing) {
        const { error } = await supabase
          .from("utilitarios")
          .update(utilityData)
          .eq("id", utility.id);

        if (error) throw error;

        toast.success("Utilitário atualizado", {
          description: "As informações do utilitário foram atualizadas com sucesso",
        });
      } else {
        // Ao criar um novo utilitário, a ordem será definida automaticamente no onDragEnd
        const { error } = await supabase
          .from("utilitarios")
          .insert([utilityData]);

        if (error) throw error;

        toast.success("Utilitário adicionado", {
          description: "O novo utilitário foi cadastrado com sucesso",
        });
      }

      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Erro ao salvar utilitário:", error);
      toast.error("Erro", {
        description: error.message || "Ocorreu um erro ao salvar o utilitário",
      });
    } finally {
      setLoading(false);
      setImageFile(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Utilitário" : "Adicionar Novo Utilitário"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do utilitário"
              : "Preencha os dados para cadastrar um novo utilitário"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Utilitário</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: AnyDesk" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Software de acesso remoto..." {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="download_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de Download</FormLabel>
                  <FormControl>
                    <Input placeholder="https://anydesk.com/download" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label htmlFor="imageFile">Imagem do Utilitário (Opcional)</Label>
              <Input
                id="imageFile"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
              />
              {currentImageUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">Imagem atual:</p>
                  <img src={currentImageUrl} alt="Utilitário" className="h-10 w-auto object-contain" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentImageUrl(null)} // Define como null para remover
                    title="Remover imagem atual"
                  >
                    <XCircle className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              )}
              {imageFile && (
                <p className="text-sm text-muted-foreground">
                  Nova imagem selecionada: {imageFile.name}
                </p>
              )}
            </div>

            {/* Removido: Ordem de Exibição */}
            {/* <FormField
              control={form.control}
              name="ordem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ordem de Exibição</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormDescription>
                    Define a ordem em que o utilitário aparecerá na lista.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

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
                  <>
                    <UploadCloud className="w-4 h-4 mr-2" />
                    {isEditing ? "Atualizar" : "Adicionar"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};