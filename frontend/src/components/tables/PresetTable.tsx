import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TableActions from "../templates/workoutTemplates/TableActions";
import {
  Pagination,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface PresetTableProps {
  data: any[];
  handleDelete: (id: string) => void;
  retrieveObjectId: (id: string) => void;
}

const PresetTable: React.FC<PresetTableProps> = ({ data, handleDelete, retrieveObjectId }) => {
  const [displayData, setDisplayData] = useState<any[]>(data);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const totalPages = Math.ceil(displayData.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNextPage = () => {
    if (currentPage === totalPages) return;
    setCurrentPage((prevState) => prevState + 1);
  };

  const handlePrevPage = () => {
    if (currentPage === 1) return;
    setCurrentPage((prevState) => prevState - 1);
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setItemsPerPage(itemsPerPage);
    setCurrentPage(1);
  };

  const paginatedData = displayData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    if (!value) {
      setDisplayData(data);
    }
    const filteredArr = data.filter((item) => item.name.includes(value));

    setDisplayData(filteredArr);
  };

  useEffect(() => {
    setDisplayData(data);
  }, [data]);

  return (
    <div>
      <div className="my-2 w-2/4">
        <Input placeholder="חיפוש..." onChange={handleSearch} />
      </div>
      <Table dir="rtl" className="w-3/4">
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">שם</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length == 0 && (
            <TableRow className="font-bold text-center">
              <TableCell>לא נמצאו תוצאות</TableCell>
            </TableRow>
          )}
          {paginatedData.map((data, i) => (
            <TableRow key={i}>
              <TableCell className="flex justify-between items-center px-3">
                <div className="pr-4">{data.name}</div>
                <div>
                  <TableActions
                    handleDelete={() => handleDelete(data._id)}
                    handleEdit={() => retrieveObjectId(data._id)}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter className="p-2 flex items-start">
          <Pagination>
            <PaginationPrevious onClick={handlePrevPage} className="cursor-pointer" />
            {Array.from({ length: totalPages }, (_, index) => (
              <PaginationLink
                key={index}
                onClick={() => handlePageChange(index + 1)}
                isActive={index + 1 === currentPage}
                className="cursor-pointer"
              >
                {index + 1}
              </PaginationLink>
            ))}
            <PaginationNext onClick={handleNextPage} className="cursor-pointer" />
          </Pagination>
          <Select
            onValueChange={(e) => handleItemsPerPageChange(Number(e))}
            value={itemsPerPage.toString()}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
            </SelectContent>
          </Select>
        </TableFooter>
      </Table>
    </div>
  );
};

export default PresetTable;
