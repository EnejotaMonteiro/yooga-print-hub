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
import { Label } from "@/components/ui/label";
import { ScaleUtility } from "@/components/ScaleUtilityCard"; // Importar a interface ScaleUtility

const scaleUtilityFormSchema = z.object({
  name: z.string().min(1, "O nome da balança é obrigatório."),
  description: z.string().min(1, "A descrição é obrigatória."),
  download_url: z.string().url("A URL de download deve ser válida.").min(1, "A URL de download é obrigatória."),
  image_url: z.string().url("A URL da imagem deve ser válida.").optional().or(z.literal("")),
  hidden_info: z.string().optional().or(z.literal("")),
});

type ScaleUtilityFormValues = z.infer<typeof scaleUtilityFormSchema>;

interface ScaleUtilityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  utility?: ScaleUtility | null;
  onSuccess: () => void;
}

export const ScaleUtilityFormDialog = ({
  open,
  onOpenChange,
  utility,
  onSuccess,
}: ScaleUtilityFormDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const isEditing = !!utility;

  const form = useForm<ScaleUtilityFormValues>({
    resolver: zodResolver(scaleUtilityFormSchema),
    defaultValues: {
      name: utility?.name || "",
      description: utility?.description || "",
      download_url: utility?.download_url || "",
      image_url: utility?.image_url || "",
      hidden_info: utility?.hidden_info || "",
    },
  });

  useEffect(() => {
    if (utility) {
      form.reset({
        name: utility.name || "",
        description: utility.description || "",
        download_url: utility.download_url || "",
        image_url: utility.image_url || "",
        hidden_info: utility.hidden_info || "",
      });
      setCurrentImageUrl(utility.image_url);
    } else {
      form.reset({
        name: "",
        description: "",
        download_url: "",
        image_url: "",
        hidden_info: "",
      });
      setCurrentImageUrl(null);
    }
    setImageFile(null);
  }, [utility, form]);

  const uploadFile = async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from('balancas_utilitarios') // Usar um bucket específico para utilitários de balanças
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) throw error;
    
    const { data: publicUrlData } = supabase.storage
      .from('balancas_utilitarios')
      .getPublicUrl(path);

    return publicUrlData.publicUrl;
  };

  const onSubmit = async (values: ScaleUtilityFormValues) => {
    setLoading(true);
    let imageUrlToSave: string | null = currentImageUrl;

    try {
      if (imageFile) {
        const filePath = `images/${Date.now()}-${imageFile.name}`;
        imageUrlToSave = await uploadFile(imageFile, filePath);
      } else if (currentImageUrl === null) {
        imageUrlToSave = null;
      }

      const utilityData = {
        name: values.name,
        description: values.description,
        download_url: values.download_url,
        image_url: imageUrlToSave,
        hidden_info: values.hidden_info,
      };

      if (isEditing) {
        const { error } = await supabase
          .from("balancas_utilitarios")
          .update(utilityData)
          .eq("id", utility.id);

        if (error) throw error;

        toast.success("Balança atualizada", {
          description: "As informações da balança foram atualizadas com sucesso",
        });
      } else {
        const { error } = await supabase
          .from("balancas_utilitarios")
          .insert([utilityData]);

        if (error) throw error;

        toast.success("Balança adicionada", {
          description: "A nova balança foi cadastrada com sucesso",
        });
      }

      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Erro ao salvar balança:", error);
      toast.error("Erro", {
        description: error.message || "Ocorreu um erro ao salvar a balança",
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
            {isEditing ? "Editar Balança" : "Adicionar Nova Balança"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações da balança"
              : "Preencha os dados para cadastrar uma nova balança"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Balança</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Balança Toledo Prix 4" {...field} />
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
                    <Textarea placeholder="Driver universal para balanças Toledo..." {...field} rows={3} />
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
                    <Input placeholder="https://toledobrasil.com.br/download" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label htmlFor="imageFile">Imagem da Balança (Opcional)</Label>
              <Input
                id="imageFile"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
              />
              {currentImageUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">Imagem atual:</p>
                  <img src={currentImageUrl} alt="Imagem da Balança" className="h-10 w-auto object-contain" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentImageUrl(null)}
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

            <FormField
              control={form.control}
              name="hidden_info"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Informação Oculta (Protegida por Senha)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Informação secreta ou código..." {...field} rows={5} />
                  </FormControl>
                  <FormDescription>
                    Esta informação só será visível após um triplo clique no título da página e a inserção da senha correta.
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