import { Scale, Plus, GripVertical, Loader2, Trash2, Pencil, UploadCloud, XCircle, Save, X, Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/use-admin";
import { useState, useRef, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useHiddenInfo } from "@/contexts/HiddenInfoContext";
import { ScaleUtilityCard, ScaleUtility } from "@/components/ScaleUtilityCard";
import { ScaleUtilityFormDialog } from "@/components/admin/ScaleUtilityFormDialog";
import { ScaleProcessFormDialog, ScaleProcess } from "@/components/admin/ScaleProcessFormDialog";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const ScalesPage = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedUtility, setSelectedUtility] = useState<ScaleUtility | null>(null);
  const [isDragModeActive, setIsDragModeActive] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [utilityToDelete, setUtilityToDelete] = useState<ScaleUtility | null>(null);

  // Estados para edição inline do conteúdo da página
  const [isEditingPageContent, setIsEditingPageContent] = useState(false);
  const [editablePageContent, setEditablePageContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Estados para imagem maximizada
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [maximizedImageSrc, setMaximizedImageSrc] = useState<string | null>(null);

  // Estado para controlar o processo ativo
  const [activeProcess, setActiveProcess] = useState<ScaleProcess | null>(null);
  const [addScaleProcessDialogOpen, setAddScaleProcessDialogOpen] = useState(false); // Estado para o dialog de adicionar processo
  const [selectedProcessForEdit, setSelectedProcessForEdit] = useState<ScaleProcess | null>(null); // Novo estado para processo a ser editado
  const [editProcessDialogOpen, setEditProcessDialogOpen] = useState(false); // Novo estado para o dialog de edição de processo

  const { openPasswordDialog, showHiddenInfoGlobally } = useHiddenInfo();
  const clickCountRef = useRef(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: pageConfig, isLoading: isLoadingPageContent } = useQuery({
    queryKey: ["site-config-scales-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('configuracao_site')
        .select('id, scales_page_content')
        .single();

      if (error && error.code === 'PGRST116') {
        const { data: newConfig, error: insertError } = await supabase
          .from('configuracao_site')
          .insert({})
          .select('id, scales_page_content')
          .single();
        if (insertError) throw insertError;
        return newConfig;
      } else if (error) {
        throw error;
      }
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: scaleProcesses, isLoading: isLoadingScaleProcesses } = useQuery<ScaleProcess[]>({
    queryKey: ["scale-processes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scale_processes")
        .select("*")
        .order("ordem", { ascending: true });

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (isEditingPageContent && pageConfig) {
      setEditablePageContent(pageConfig.scales_page_content || "");
      setUploadedImageUrl(null);
      setImageFile(null);
    }
  }, [isEditingPageContent, pageConfig]);

  const { data: utilities, isLoading } = useQuery<ScaleUtility[]>({
    queryKey: ["scale-utilities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("balancas_utilitarios")
        .select("*")
        .order("ordem", { ascending: true });

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("balancas_utilitarios")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scale-utilities"] });
      toast.success("Balança excluída", {
        description: "A balança foi removida com sucesso",
      });
      setDeleteDialogOpen(false);
      setUtilityToDelete(null);
    },
    onError: (error: any) => {
      console.error("Erro ao excluir balança:", error);
      toast.error("Erro ao excluir", {
        description: error.message || "Ocorreu um erro ao excluir a balança",
      });
    },
  });

  const handleEdit = (utility: ScaleUtility) => {
    setSelectedUtility(utility);
    setEditDialogOpen(true);
  };

  const handleDelete = (utility: ScaleUtility) => {
    setUtilityToDelete(utility);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (utilityToDelete) {
      deleteMutation.mutate(utilityToDelete.id);
    }
  };

  const handleAddSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["scale-utilities"] });
    setAddDialogOpen(false);
  };

  const handleEditSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["scale-utilities"] });
    setEditDialogOpen(false);
    setSelectedUtility(null);
  };

  const handleScaleProcessSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["scale-processes"] });
    setAddScaleProcessDialogOpen(false);
    setEditProcessDialogOpen(false); // Fechar o dialog de edição também
    setSelectedProcessForEdit(null); // Limpar o processo selecionado
  };

  const handleEditProcess = (process: ScaleProcess) => {
    setSelectedProcessForEdit(process);
    setEditProcessDialogOpen(true);
  };

  const handleCopyContent = () => {
    if (activeProcess?.content) {
      navigator.clipboard.writeText(activeProcess.content);
      toast.success("Conteúdo copiado!", {
        description: "O texto do processo foi copiado para a área de transferência.",
      });
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination || !utilities) {
      return;
    }

    const reorderedUtilities = Array.from(utilities);
    const [removed] = reorderedUtilities.splice(result.source.index, 1);
    reorderedUtilities.splice(result.destination.index, 0, removed);

    queryClient.setQueryData(["scale-utilities"], reorderedUtilities);

    try {
      for (let i = 0; i < reorderedUtilities.length; i++) {
        const utility = reorderedUtilities[i];
        const { error } = await supabase
          .from('balancas_utilitarios')
          .update({ ordem: i })
          .eq('id', utility.id);

        if (error) throw error;
      }

      toast.success("Ordem atualizada", {
        description: "A ordem das balanças foi salva com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["scale-utilities"] });
    } catch (error: any) {
      console.error('Erro ao reordenar balanças:', error);
      toast.error("Erro ao reordenar", {
        description: error.message || "Ocorreu um erro ao reordenar as balanças",
      });
      queryClient.invalidateQueries({ queryKey: ["scale-utilities"] });
    }
  };

  const handleTitleClick = () => {
    clickCountRef.current += 1;

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    clickTimeoutRef.current = setTimeout(() => {
      if (clickCountRef.current === 3) {
        openPasswordDialog();
      }
      clickCountRef.current = 0;
    }, 300);
  };

  const handleSavePageContent = async () => {
    if (!pageConfig?.id) {
      toast.error("Erro", { description: "ID de configuração não encontrado." });
      return;
    }
    setUploadingImage(true);
    try {
      const { error } = await supabase
        .from('configuracao_site')
        .update({ scales_page_content: editablePageContent })
        .eq('id', pageConfig.id);

      if (error) throw error;

      toast.success("Conteúdo salvo!", { description: "O conteúdo da página foi atualizado." });
      queryClient.invalidateQueries({ queryKey: ["site-config-scales-content"] });
      setIsEditingPageContent(false);
    } catch (error: any) {
      console.error("Erro ao salvar conteúdo da página:", error);
      toast.error("Erro ao salvar", { description: error.message || "Não foi possível salvar o conteúdo." });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCancelEditPageContent = () => {
    setIsEditingPageContent(false);
    setEditablePageContent(pageConfig?.scales_page_content || "");
    setUploadedImageUrl(null);
    setImageFile(null);
  };

  const handleImageUpload = async (fileToUpload: File | null) => {
    const file = fileToUpload || imageFile;
    if (!file) {
      toast.error("Nenhuma imagem selecionada", { description: "Por favor, selecione um arquivo para upload." });
      return;
    }

    setUploadingImage(true);
    try {
      const filePath = `images/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('balancas_page_images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('balancas_page_images')
        .getPublicUrl(filePath);

      setUploadedImageUrl(publicUrlData.publicUrl);
      toast.success("Imagem enviada!", { description: "A URL da imagem foi gerada. Copie e cole no editor." });
    } catch (error: any) {
      console.error("Erro ao fazer upload da imagem:", error);
      toast.error("Erro no upload", { description: error.message || "Não foi possível enviar a imagem." });
    } finally {
      setUploadingImage(false);
      setImageFile(null);
    }
  };

  const handleCopyMarkdownUrl = () => {
    if (uploadedImageUrl) {
      const markdownUrl = `![Imagem da Balança](${uploadedImageUrl})`;
      navigator.clipboard.writeText(markdownUrl);
      toast.success("URL Markdown copiada!", {
        description: "Cole no editor para exibir a imagem.",
      });
    }
  };

  // Handlers para Drag and Drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isEditingPageContent) {
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (isEditingPageContent && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleImageUpload(file);
      } else {
        toast.error("Formato inválido", { description: "Por favor, solte apenas arquivos de imagem." });
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:pl-8">
      <div className="flex justify-between items-center mb-8">
        <h1
          className="text-3xl font-bold text-foreground flex items-center gap-3 cursor-pointer select-none"
          onClick={handleTitleClick}
        >
          <Scale className="h-7 w-7 text-primary" />
          Balanças
        </h1>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button
              variant={isEditingPageContent ? "default" : "outline"}
              size="icon"
              onClick={() => setIsEditingPageContent(prev => !prev)}
              title={isEditingPageContent ? "Sair do modo de edição" : "Editar conteúdo da página"}
            >
              {isEditingPageContent ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
            </Button>
          )}
          {isAdmin && (
            <Button
              variant={isDragModeActive ? "default" : "outline"}
              size="icon"
              onClick={() => setIsDragModeActive(prev => !prev)}
              title={isDragModeActive ? "Desativar modo de arrastar" : "Ativar modo de arrastar para reordenar"}
            >
              <GripVertical className="w-4 h-4" />
            </Button>
          )}
          {isAdmin && (
            <>
              <Button
                className="flex items-center gap-2"
                onClick={() => {
                  setSelectedUtility(null);
                  setAddDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4" />
                Adicionar Balança
              </Button>
              <Button
                className="flex items-center gap-2"
                onClick={() => setAddScaleProcessDialogOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Adicionar Processo
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Seção de botões de processo dinâmicos */}
      <div className="mb-8 flex flex-col items-center">
        {isLoadingScaleProcesses ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground text-sm mt-2">Carregando processos...</p>
          </div>
        ) : scaleProcesses && scaleProcesses.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {scaleProcesses.map((process) => (
              <div key={process.id} className="relative group">
                <Button
                  onClick={() => setActiveProcess(process)}
                  variant={activeProcess?.id === process.id ? 'default' : 'outline'}
                  className={activeProcess?.id === process.id ? 'bg-gradient-primary text-white' : ''}
                >
                  {process.button_text}
                </Button>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditProcess(process);
                    }}
                    className="absolute -top-2 -right-2 h-6 w-6 p-1 rounded-full bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Editar processo"
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            Nenhum processo de balança configurado.
          </div>
        )}

        {activeProcess && (
          <Card className="w-full max-w-3xl mx-auto bg-card/80 backdrop-blur-sm border-border shadow-elegant text-left">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{activeProcess.title}</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyContent}
                title="Copiar conteúdo"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert"> {/* Alterado para prose-sm */}
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {activeProcess.content}
              </ReactMarkdown>
            </CardContent>
          </Card>
        )}
      </div>

      {(isLoading || adminLoading) ? (
        <div className="text-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando balanças...</p>
        </div>
      ) : utilities && utilities.length > 0 ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="scale-utilities-list">
            {(provided) => (
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto printers-droppable-area"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {utilities.map((utility, index) => (
                  <Draggable
                    key={utility.id}
                    draggableId={utility.id}
                    index={index}
                    isDragDisabled={!isDragModeActive}
                  >
                    {(provided, snapshot) => (
                      <ScaleUtilityCard
                        utility={utility}
                        isAdmin={isAdmin}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isDragModeActive={isDragModeActive}
                        innerRef={provided.innerRef}
                        draggableProps={provided.draggableProps}
                        dragHandleProps={isDragModeActive ? provided.dragHandleProps : null}
                        isDragging={snapshot.isDragging}
                        showHiddenInfo={showHiddenInfoGlobally}
                      />
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Nenhuma balança cadastrada ainda.
        </div>
      )}

      {/* Área de Conteúdo Principal da Página de Balanças */}
      <Card className="mt-8 bg-card/80 backdrop-blur-sm border-border shadow-elegant">
        <CardContent
          className={cn(
            "p-6 prose prose-sm dark:prose-invert max-w-none text-center", // Alterado para prose-sm
            isEditingPageContent && isDraggingOver && "border-2 border-dashed border-primary-foreground bg-primary/5"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isLoadingPageContent ? (
            <div className="text-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground text-sm mt-2">Carregando conteúdo...</p>
            </div>
          ) : isEditingPageContent && isAdmin ? (
            <div className="flex flex-col space-y-4">
              <Textarea
                value={editablePageContent}
                onChange={(e) => setEditablePageContent(e.target.value)}
                placeholder="Escreva o conteúdo da página de Balanças aqui usando Markdown..."
                className="min-h-[300px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Use **negrito**, *itálico*, `# títulos`, `- listas` e até mesmo HTML para formatar o texto.
              </p>
              <div className="space-y-2">
                <Label htmlFor="imageUpload">Upload de Imagem</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                    className="flex-1"
                    disabled={uploadingImage}
                  />
                  <Button onClick={() => handleImageUpload(null)} disabled={!imageFile || uploadingImage}>
                    {uploadingImage ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <UploadCloud className="w-4 h-4 mr-2" />
                    )}
                    Upload
                  </Button>
                </div>
                {uploadedImageUrl && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>URL da imagem:</span>
                    <Input
                      type="text"
                      value={uploadedImageUrl}
                      readOnly
                      className="flex-1"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                      title="Clique para copiar"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCopyMarkdownUrl}
                      title="Copiar URL em formato Markdown"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setUploadedImageUrl(null)}
                      title="Remover URL"
                    >
                      <XCircle className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Para exibir a imagem, clique em "Copiar URL Markdown" e cole no editor.
                  <br />
                  Para **redimensionar**, use HTML: `&lt;img src="URL_DA_IMAGEM" width="50%" /&gt;`
                  <br />
                  Para **posicionar**, use HTML: `&lt;img src="URL_DA_IMAGEM" style="float: right; margin-left: 15px;" /&gt;`
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancelEditPageContent} disabled={uploadingImage}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSavePageContent} disabled={uploadingImage}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Conteúdo
                </Button>
              </div>
            </div>
          ) : pageConfig?.scales_page_content ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                img: ({ node, ...props }) => (
                  <img
                    style={{ maxWidth: '100%', height: 'auto', maxHeight: '300px', display: 'block', margin: '1.5rem auto', cursor: 'pointer' }}
                    {...props}
                    onClick={() => {
                      if (props.src) {
                        setMaximizedImageSrc(props.src);
                        setIsImageDialogOpen(true);
                      }
                    }}
                  />
                ),
              }}
            >
              {pageConfig.scales_page_content}
            </ReactMarkdown>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              {isAdmin ? (
                <p>Nenhum conteúdo para a página de Balanças. Clique no ícone de lápis para adicionar.</p>
              ) : (
                <p>Nenhum conteúdo disponível para esta página.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <ScaleUtilityFormDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={handleAddSuccess}
        utility={null}
      />

      <ScaleUtilityFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        utility={selectedUtility}
        onSuccess={handleEditSuccess}
      />

      <ScaleProcessFormDialog
        open={addScaleProcessDialogOpen}
        onOpenChange={setAddScaleProcessDialogOpen}
        onSuccess={handleScaleProcessSuccess}
        process={null} // Para adicionar um novo processo
      />

      <ScaleProcessFormDialog
        open={editProcessDialogOpen} // Novo dialog para edição de processo
        onOpenChange={setEditProcessDialogOpen}
        onSuccess={handleScaleProcessSuccess}
        process={selectedProcessForEdit} // Passa o processo selecionado para edição
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a balança "
              <strong>{utilityToDelete?.name}</strong>"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog para exibir imagem maximizada */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="max-w-4xl p-0 border-none bg-transparent shadow-none">
          {maximizedImageSrc && (
            <img
              src={maximizedImageSrc}
              alt="Imagem maximizada"
              className="max-w-full max-h-[90vh] object-contain mx-auto"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScalesPage;