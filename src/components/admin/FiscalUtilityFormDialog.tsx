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

export interface FiscalUtility {
  id: string;
  name: string;
  description: string;
  download_url: string;
  image_url: string | null;
  hidden_info: string | null;
  ordem: number | null;
  created_at: string | null;
  updated_at: string | null;
}

const formSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  description: z.string().min(1, "A descrição é obrigatória."),
  download_url: z.string().url("A URL de download deve ser válida.").min(1, "A URL de download é obrigatória."),
  image_url: z.string().url("A URL da imagem deve ser válida.").optional().or(z.literal("")),
  hidden_info: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

interface FiscalUtilityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  utility?: FiscalUtility | null;
  onSuccess: () => void;
}

export const FiscalUtilityFormDialog = ({
  open,
  onOpenChange,
  utility,
  onSuccess,
}: FiscalUtilityFormDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const isEditing = !!utility;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
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
      form.reset({ name: "", description: "", download_url: "", image_url: "", hidden_info: "" });
      setCurrentImageUrl(null);
    }
    setImageFile(null);
  }, [utility, form]);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    let imageUrlToSave: string | null = currentImageUrl;

    try {
      if (imageFile) {
        const filePath = `fiscal-images/${Date.now()}-${imageFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(filePath, imageFile, { cacheControl: '3600', upsert: true });
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('logos').getPublicUrl(filePath);
        imageUrlToSave = publicUrlData.publicUrl;
      } else if (currentImageUrl === null) {
        imageUrlToSave = null;
      }

      const data = {
        name: values.name,
        description: values.description,
        download_url: values.download_url,
        image_url: imageUrlToSave,
        hidden_info: values.hidden_info,
      };

      if (isEditing) {
        const { error } = await supabase.from("utilitarios_fiscais").update(data).eq("id", utility.id);
        if (error) throw error;
        toast.success("Utilitário fiscal atualizado");
      } else {
        const { error } = await supabase.from("utilitarios_fiscais").insert([data]);
        if (error) throw error;
        toast.success("Utilitário fiscal adicionado");
      }

      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Erro ao salvar utilitário fiscal:", error);
      toast.error("Erro", { description: error.message || "Ocorreu um erro ao salvar" });
    } finally {
      setLoading(false);
      setImageFile(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Utilitário Fiscal" : "Adicionar Utilitário Fiscal"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize as informações do utilitário fiscal" : "Preencha os dados para cadastrar um novo utilitário fiscal"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Nome</FormLabel><FormControl><Input placeholder="Ex: SAT Fiscal" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea placeholder="Descrição do utilitário..." {...field} rows={3} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="download_url" render={({ field }) => (
              <FormItem><FormLabel>URL de Download</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="space-y-2">
              <Label htmlFor="fiscalImageFile">Imagem (Opcional)</Label>
              <Input id="fiscalImageFile" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} />
              {currentImageUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={currentImageUrl} alt="Utilitário" className="h-10 w-auto object-contain" />
                  <Button type="button" variant="ghost" size="icon" onClick={() => setCurrentImageUrl(null)}><XCircle className="w-4 h-4 text-destructive" /></Button>
                </div>
              )}
            </div>
            <FormField control={form.control} name="hidden_info" render={({ field }) => (
              <FormItem>
                <FormLabel>Informação Oculta (Protegida por Senha)</FormLabel>
                <FormControl><Textarea placeholder="Informação secreta..." {...field} rows={5} /></FormControl>
                <FormDescription>Visível após triplo clique e senha correta.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
              <Button type="submit" disabled={loading}>
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : <><UploadCloud className="w-4 h-4 mr-2" />{isEditing ? "Atualizar" : "Adicionar"}</>}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
