import { UseFormReturn } from "react-hook-form";
import { Form } from "../ui/form";

interface FormWrapperProps {
  children: React.ReactNode;
  form: UseFormReturn<any>;
  submitFunction: (values: any) => void;
  className?: string;
}

export default function FormWrapper({
  children,
  form,
  submitFunction,
  className,
}: FormWrapperProps) {
  return (
    <Form {...form}>
      <form className={className} onSubmit={form.handleSubmit(submitFunction)}>
        {children}
      </form>
    </Form>
  );
}
