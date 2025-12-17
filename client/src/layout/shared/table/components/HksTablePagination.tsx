import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

type Props = {
  table: Table<any>;
};

export default function HksTablePagination(props: Props) {
  const { table } = props;
  const { t } = useTranslation();

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
            {t("table.header.pagination.prev")}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t("table.header.pagination.prev.hover")}</TooltipContent>
      </Tooltip>
      <ButtonGroupText className="bg-background whitespace-nowrap select-none">
        { t("table.header.pagination.page", {
          currentPage: table.getState().pagination.pageIndex + 1,
          totalPages: table.getPageCount()
        })}
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
            {t("table.header.pagination.next")}
            <ChevronRight />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t("table.header.pagination.next.hover")}</TooltipContent>
      </Tooltip>
    </ButtonGroup>
  );
}
