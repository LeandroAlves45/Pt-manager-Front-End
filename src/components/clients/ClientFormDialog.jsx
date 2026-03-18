import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { emailRules, fullNameRules, phoneRules, heightRules } from "@/utils/validators";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";

/**
 * Dialog model para criar ou editar um cliente
 *
 * Props:
 * register: liga inputs ao form
 * handleSubmit: função para lidar com submissão do form
 * -formState: contém erros de validação
 * -reset: função para resetar o form
 * -setValue: função para setar valores do form (usada para editar)
 *
 * @param {Object} open - Controla se o dialog está aberto
 * @param {Function} onOpenChange - Função chamada quando o estado de abertura muda
 * @param {Object|null} client - se preenchido, dialog funciona como edição. Se null, funciona como criação
 * @param {Function} inSave - Callback com os dados do formulário quando o usuário submete
 */
export default function ClientFormDialog({
  open,
  onOpenChange,
  client,
  onSave,
}) {
  const isEditing = !!client;
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      full_name: "",
      phone: "",
      email: "",
      birth_date: "",
      sex: "",
      height_cm: "",
      objetive: "",
      notes: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
    },
  });

  /**
   * Quando o dialog abre, preenche o form com os dados do cliente (se estiver editando) ou reseta o form (se estiver criando)
   * useEffect é usado para rodar esse código toda vez que o estado de abertura muda
   */
  useEffect(() => {
    if (open) {
      if (client) {
        // Modo edição: preenche o form com os dados do cliente
        reset({
          full_name: client.full_name || "",
          phone: client.phone || "",
          email: client.email || "",
          birth_date: client.birth_date || "",
          sex: client.sex || "",
          height_cm: client.height_cm || "",
          objetive: client.objetive || "",
          notes: client.notes || "",
          emergency_contact_name: client.emergency_contact_name || "",
          emergency_contact_phone: client.emergency_contact_phone || "",
        });
      } else {
        // Modo criação: reseta o form
        reset({
          full_name: "",
          phone: "",
          email: "",
          birth_date: "",
          sex: "",
          height_cm: "",
          objetive: "",
          notes: "",
          emergency_contact_name: "",
          emergency_contact_phone: "",
        });
      }
    }
  }, [open, client, reset]);

  /**
   * Processa os dados antes de enviar:
   * - Converte height_cm para número
   * -Converte campos vazios para null (para o backend entender que são opcionais)
   */

  const onSubmit = (data) => {
    const cleaned = {
      ...data,
      sex: data.sex || null,
      height_cm: data.height_cm ? Number(data.height_cm) : null,
      objetive: data.objetive || null,
      notes: data.notes || null,
      emergency_contact_name: data.emergency_contact_name || null,
      emergency_contact_phone: data.emergency_contact_phone || null,
    };
    onSave(cleaned);
  };

  //opções de sexo para o select
  const sexOptions = [
    { value: "male", label: "Masculino" },
    { value: "female", label: "Feminino" },
    { value: "other", label: "Outro" },
    { value: "unknown", label: "Desconhecido" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-foreground sm:max-w-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEditing ? "Editar Cliente" : "Criar Cliente"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEditing
              ? "Atualize as informações do cliente."
              : "Preencha os dados para criar um novo cliente."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 mt-2"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nome completo - ocupa 2 colunas */}
            <div className="flex flex-col gap-1 sm:col-span-2">
              <Label htmlFor="full_name">Nome Completo *</Label>
              <Input
                id="full_name"
                {...register("full_name", fullNameRules)}
                className="bg-background border-input text-foreground"
                placeholder="Nome completo do cliente"
              />
              {errors.full_name && (
                <span className="text-xs text-destructive">
                  {errors.full_name.message}
                </span>
              )}
            </div>

            {/* Telemóvel */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Telemóvel *</Label>
              <Input
                id="phone"
                {...register("phone", phoneRules)}
                className="bg-background border-input text-foreground"
                placeholder="+351 9XX XXX XXX"
              />
              {errors.phone && (
                <span className="text-xs text-destructive">
                  {errors.phone.message}
                </span>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register("email", emailRules)}
                className="bg-background border-input text-foreground"
                placeholder="email@exemplo.com"
              />
              {errors.email && (
                <span className="text-xs text-destructive">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Data de nascimento */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="birth_date">Data de Nascimento *</Label>
              <Input
                id="birth_date"
                type="date"
                {...register("birth_date", {
                  required: "Data de nascimento é obrigatória",
                })}
                className="bg-background border-input text-foreground"
              />
              {errors.birth_date && (
                <span className="text-xs text-destructive">
                  {errors.birth_date.message}
                </span>
              )}
            </div>

            {/* Sexo (Select controlado - Radix não suporta register) */}
            <div className="flex flex-col gap-1.5">
              <Label>Sexo</Label>
              <Select
                value={watch("sex") || ""}
                onValueChange={(val) => setValue("sex", val)}
              >
                <SelectTrigger className="bg-background border-input text-foreground">
                  <SelectValue placeholder="Selecione o sexo" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {sexOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Altura */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="height_cm">Altura (cm) *</Label>
              <Input
                id="height_cm"
                type="number"
                {...register("height_cm", heightRules)}
                className="bg-background border-input text-foreground"
                placeholder="175"
              />
              {errors.height_cm && (
                <span className="text-xs text-destructive">
                  {errors.height_cm.message}
                </span>
              )}
            </div>

            {/* Objetivo */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="objetive">Objetivo</Label>
              <Input
                id="objetive"
                {...register("objetive")}
                className="bg-background border-input text-foreground resize-none"
                placeholder="Ex: Perda de peso, ganho de massa muscular, etc."
                rows={2}
              />
            </div>

            {/* Notas */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                className="bg-background border-input text-foreground resize-none"
                placeholder="Notas adicionais"
                rows={2}
              />
            </div>

            {/* Contacto de emergência */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="emergency_contact_name">
                Contacto de Emergência - Nome
              </Label>
              <Input
                id="emergency_contact_name"
                {...register("emergency_contact_name")}
                className="bg-background border-input text-foreground"
                placeholder="Nome do contacto de emergência"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="emergency_contact_phone">
                Contacto de Emergência - Telefone
              </Label>
              <Input
                id="emergency_contact_phone"
                {...register("emergency_contact_phone")}
                className="bg-background border-input text-foreground"
                placeholder="+351 9XX XXX XXX"
              />
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isEditing ? "Guardar Alterações" : "Criar Cliente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
