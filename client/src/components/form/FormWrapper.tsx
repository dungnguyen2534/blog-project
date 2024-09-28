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
  resetAfterSubmit?: boolean;
}

export default function FormWrapper({
  children,
  form,
  submitFunction,
  onInvalid,
  className,
  resetAfterSubmit,
}: FormWrapperProps) {
  const handleSubmit: SubmitHandler<any> = async (data) => {
    if (submitFunction) {
      await submitFunction(data);
      if (resetAfterSubmit) {
        form.reset();
      }
    } else {
      return () => {};
    }
  };

  return (
    <Form {...form}>
      <form
        className={className}
        onSubmit={form.handleSubmit(handleSubmit, onInvalid)}>
        {children}
      </form>
    </Form>
  );
}
