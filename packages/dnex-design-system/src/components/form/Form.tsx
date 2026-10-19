import {
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useId,
  useMemo,
} from "react";
import type {
  ComponentPropsWithoutRef,
  FormHTMLAttributes,
  ReactElement,
  ReactNode,
} from "react";
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form";
import { cn } from "../../lib/cn";
import { Label } from "../primitives/Label";

/**
 * Camada de formulário do DNEX DS — react-hook-form + zod, no estilo shadcn,
 * mas usando os primitivos JÁ existentes do DS (Label, Input, Select…).
 *
 * Estrutura:
 *   <Form {...methods} onSubmit={…}>        ← FormProvider + <form>
 *     <FormField name="email" control render={({field}) => (
 *       <FormItem>
 *         <FormLabel required>E-mail</FormLabel>
 *         <FormControl><Input {...field} /></FormControl>
 *         <FormDescription>…</FormDescription>
 *         <FormMessage />                    ← erro do zod, acessível
 *       </FormItem>
 *     )} />
 *   </Form>
 *
 * Acessibilidade: FormControl injeta id, aria-describedby e aria-invalid no
 * campo; FormMessage expõe a mensagem com o id certo. O foco/teclado vêm dos
 * próprios primitivos.
 */

/* ---------- contextos internos (id do campo + nome RHF) ---------- */

type FormFieldContextValue = { name: string };
const FormFieldContext = createContext<FormFieldContextValue | null>(null);

type FormItemContextValue = { id: string };
const FormItemContext = createContext<FormItemContextValue | null>(null);

/** Hook que junta estado RHF + ids ARIA do item atual. */
function useFormField() {
  const fieldContext = useContext(FormFieldContext);
  const itemContext = useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  if (!fieldContext) {
    throw new Error("useFormField deve ser usado dentro de <FormField>.");
  }
  if (!itemContext) {
    throw new Error("useFormField deve ser usado dentro de <FormItem>.");
  }

  const fieldState = getFieldState(fieldContext.name, formState);
  const { id } = itemContext;

  return {
    name: fieldContext.name,
    formItemId: `${id}-control`,
    formDescriptionId: `${id}-description`,
    formMessageId: `${id}-message`,
    ...fieldState,
  };
}

/* ---------- Form (provider + <form>) ---------- */

export type FormProps<T extends FieldValues> = {
  /** Métodos do useForm() — passe assim: <Form form={form} onSubmit={…}>. */
  form: UseFormReturn<T>;
  children: ReactNode;
} & Omit<FormHTMLAttributes<HTMLFormElement>, "children">;

export function Form<T extends FieldValues>({
  form,
  children,
  ...formProps
}: FormProps<T>) {
  return (
    <FormProvider {...form}>
      <form noValidate {...formProps}>
        {children}
      </form>
    </FormProvider>
  );
}

/* ---------- FormField (Controller) ---------- */

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName>) {
  const ctx = useMemo<FormFieldContextValue>(
    () => ({ name: props.name }),
    [props.name],
  );
  return (
    <FormFieldContext.Provider value={ctx}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

/* ---------- FormItem (wrapper + id) ---------- */

export const FormItem = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(function FormItem({ className, ...props }, ref) {
  const id = useId();
  const ctx = useMemo<FormItemContextValue>(() => ({ id }), [id]);
  return (
    <FormItemContext.Provider value={ctx}>
      <div ref={ref} className={cn("space-y-1.5", className)} {...props} />
    </FormItemContext.Provider>
  );
});

/* ---------- FormLabel (Label do DS, ligado ao controle) ---------- */

export const FormLabel = forwardRef<
  HTMLLabelElement,
  ComponentPropsWithoutRef<typeof Label>
>(function FormLabel({ className, ...props }, ref) {
  const { error, formItemId } = useFormField();
  return (
    <Label
      ref={ref}
      htmlFor={formItemId}
      className={cn(error && "text-[var(--color-danger)]", className)}
      {...props}
    />
  );
});

/* ---------- FormControl (injeta ARIA no campo filho) ---------- */

/**
 * FormControl — clona o campo filho injetando id, aria-describedby e
 * aria-invalid corretos. Use UM filho controlável (Input, Select, Combobox…).
 * Como nossos primitivos aceitam `invalid`, também propagamos `invalid` quando
 * houver erro (borda/anel em danger sem precisar de classe manual).
 */
export function FormControl({
  children,
}: {
  children: ReactElement<Record<string, unknown>>;
}) {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  if (!isValidElement(children)) return children;

  const describedBy = error
    ? `${formDescriptionId} ${formMessageId}`
    : formDescriptionId;

  return cloneElement(children, {
    id: formItemId,
    "aria-describedby": describedBy,
    "aria-invalid": error ? true : undefined,
    invalid: error ? true : children.props.invalid,
  });
}

/* ---------- FormDescription ---------- */

export const FormDescription = forwardRef<
  HTMLParagraphElement,
  ComponentPropsWithoutRef<"p">
>(function FormDescription({ className, ...props }, ref) {
  const { formDescriptionId } = useFormField();
  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-[0.8rem] leading-relaxed text-fg-subtle", className)}
      {...props}
    />
  );
});

/* ---------- FormMessage (erro acessível) ---------- */

export const FormMessage = forwardRef<
  HTMLParagraphElement,
  ComponentPropsWithoutRef<"p">
>(function FormMessage({ className, children, ...props }, ref) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error.message ?? "") : children;

  if (!body) return null;

  return (
    <p
      ref={ref}
      id={formMessageId}
      role="alert"
      className={cn(
        "text-[0.8rem] font-medium text-[var(--color-danger)]",
        className,
      )}
      {...props}
    >
      {body}
    </p>
  );
});

export { useFormField };
