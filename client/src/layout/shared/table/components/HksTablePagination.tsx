import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  table: Table<any>;
};

export default function HksTablePagination(props: Props) {
  const { table } = props;

  return (
    <ButtonGroup>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="default"
            className="select-none"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft />
            Önceki
          </Button>
        </TooltipTrigger>
        <TooltipContent>Önceki sayfaya git</TooltipContent>
      </Tooltip>
      <ButtonGroupText className="bg-background whitespace-nowrap select-none">
        Sayfa
        <span className="font-normal mx-0.5">
          {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
        </span>
      </ButtonGroupText>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="default"
            className="select-none"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Sonraki
            <ChevronRight />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Sonraki sayfaya git</TooltipContent>
      </Tooltip>
    </ButtonGroup>
  );
}
