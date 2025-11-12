import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import type { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  table: Table<any>;
};

export default function HksTablePagination(props: Props) {
  const { table } = props;

  return (
    <ButtonGroup>
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
      <ButtonGroupText className="bg-background whitespace-nowrap select-none">
        Sayfa
        <span className="font-normal mx-0.5">
          {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
        </span>
      </ButtonGroupText>
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
    </ButtonGroup>
  );
}
