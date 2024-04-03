import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { HTMLInputTypeAttribute } from "react";

export const InputForm = ({
  form,
  name,
  inputType,
  label,
  desc,
}: {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  inputType: HTMLInputTypeAttribute;
  desc: string;
}) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input type={inputType} {...field} />
          </FormControl>
          <FormDescription>{desc}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
