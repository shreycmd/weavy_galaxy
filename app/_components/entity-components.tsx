import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertTriangleIcon, Loader2Icon, PlusIcon } from "lucide-react";
import Link from "next/link";
import React, { ReactNode } from "react";

type EntityHeaderprops = {
  title: string;
  description?: string;
  newButtonLabel?: string;
  disabled?: boolean;
  iscreating?: boolean;
} & (
  | { onNew: () => void; newButtonHref?: never }
  | { newButtonHref: string; onNew?: never }
  | { onNew?: never; newButtonHref?: never }
);
export const Entityheader = ({
  title,
  description,
  onNew,
  newButtonHref,
  newButtonLabel,
  disabled,
  iscreating,
}: EntityHeaderprops) => {
  return (
    <div className="flex flex-row items-center justify-between gap-x-4">
      <div className="flex flex-col">
        <h1 className="text0lg md:text-xl font-semibold">{title}</h1>
        {description && (
          <p className="text-xs md:text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {onNew && !newButtonHref && (
        <Button
          disabled={iscreating || disabled}
          size="sm"
          className="!bg-[#f7ffa8] text-black "
          onClick={onNew}
        >
          <PlusIcon className="size-4" />
          {newButtonLabel}
        </Button>
      )}
      {newButtonHref && !onNew && (
        <Button size="sm" asChild className="!bg-[#f7ffa8] text-black ">
          <Link href={newButtonHref}>
            {" "}
            <PlusIcon className="size-4" />
            {newButtonLabel}
          </Link>
        </Button>
      )}
    </div>
  );
};

type EntityContainerprops = {
  children: React.ReactNode;
  header?: React.ReactNode;
  search?: React.ReactNode;
  pagination?: React.ReactNode;
};
export const EntityContainer = ({
  children,
  header,
  pagination,
  search,
}: EntityContainerprops) => {
  return (
    <div className="p-4 md:px-10 md-py-6 h-full ">
      <div className="mx-auto max-w-screen-xl w-full flex flex-col gap-y-8 h-full">
        {header}

        <div className="flex flex-col gap-y-4 h-full">
          {search}
          {children}
        </div>
        {pagination}
      </div>
    </div>
  );
};
interface staeViewProps {
  message?: string;
}

export const LoadingView = ({ message }: staeViewProps) => {
  return (
    <div className="flex justify-center items-center  bg-black/40 h-screen flex-1 flex-col gap-y-4">
      <Loader2Icon className="size-6 animate-spin text-white" />
      <p className="text-sm text-white">{message ? message : "loading.."}</p>
    </div>
  );
};

export const ErrorView = ({ message }: staeViewProps) => {
  return (
    <div className="flex justify-center items-center h-full flex-1 flex-col gap-y-4">
      <AlertTriangleIcon className="size-6 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        {message ? message : "Error.."}
      </p>
    </div>
  );
};

interface ProjectItemprops {
  href: string;
  name: string;
  subtitle?: React.ReactNode;
  image?: React.ReactNode;
  actions?: React.ReactNode;
}
export const ProjectItem = ({
  href,
  name,
  subtitle,
  image,
  actions,
}: ProjectItemprops) => {
  console.log("sub", subtitle);
  return (
    <div className="flex flex-col items-center w-48">
      {/* Clickable Image Card */}
      <Link href={href} prefetch>
        <Card className="h-72 w-48 bg-[#212126] hover:bg-[#424247] transition cursor-pointer overflow-hidden flex items-center justify-center">
          {image}
        </Card>
      </Link>

      {/* Text Section (Not Part of Card) */}
      <div className="mt-3 text-center">
        <CardTitle className="text-sm font-medium truncate">{name}</CardTitle>

        {!!subtitle && (
          <CardDescription className="text-xs mt-1 text-muted-foreground">
            {subtitle}
          </CardDescription>
        )}
      </div>
    </div>
  );
};
