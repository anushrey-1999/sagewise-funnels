"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CreateConfigNav({
  basePath,
  placeholder,
}: {
  basePath: string;
  placeholder: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");

  const go = () => {
    const v = value.trim().replace(/^\/+|\/+$/g, "");
    if (!v) return;
    router.push(`${basePath}/${v}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="sm:max-w-sm"
      />
      <Button type="button" onClick={go} variant="secondary">
        Create / Open
      </Button>
    </div>
  );
}

