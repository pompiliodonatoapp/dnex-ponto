/**
 * Camada de formulário do DNEX DS — react-hook-form + zod, estilo shadcn,
 * sobre os primitivos do DS. Reexporta também `useForm`/`Controller` e
 * `zodResolver` por conveniência, para o app consumir tudo de @dnex/ds.
 */
export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  useFormField,
} from "./Form";
export type { FormProps } from "./Form";
