import {
  SubmitErrorHandler,
  SubmitHandler,
  UseFormReturn,
} from "react-hook-form";
import { Form } from "../ui/form";

interface FormWrapperProps {
  children: React.ReactNode;
  form: UseFormReturn<any>;
  submitFunction?: SubmitHandler<any>;
  onInvalid?: SubmitErrorHandler<any> | undefined;
  className?: string;
}

export default function FormWrapper({
  children,
  form,
  submitFunction,
  onInvalid,
  className,
}: FormWrapperProps) {
  return (
    <Form {...form}>
      <form
        className={className}
        onSubmit={form.handleSubmit(submitFunction || (() => {}), onInvalid)}>
        {children}
      </form>
    </Form>
  );
}
