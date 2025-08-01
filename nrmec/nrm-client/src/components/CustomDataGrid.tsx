import { DataGrid, GridColDef, DataGridProps } from "@mui/x-data-grid";
import { Box } from "@mui/material";

interface CustomDataGridProps extends Omit<DataGridProps, "onRowClick"> {
  rows: Record<string, any>[];
  columns: GridColDef[];
  loading?: boolean;
  pageSize?: number;
  getRowId?: (row: Record<string, any>) => string | number;
  checkboxSelection?: boolean;
  onRowClick?: (params: any) => void;
}

const CustomDataGrid = ({
  rows = [],
  columns,
  loading = false,
  pageSize = 10,
  getRowId = (row) => row.id,
  checkboxSelection = false,
  onRowClick,
}: CustomDataGridProps) => {
  const safeRows = rows ?? [];
  const effectivePageSize = 10;
  const tableHeight = 10 * 52 + 120;

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        height: `${tableHeight}px`,
        backgroundColor: "#fffff0",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        position: "relative",
        "& .MuiDataGrid-root": {
          minWidth: "100%",
          height: "100% !important",
          isolation: "isolate",
        },
        "@media (max-width: 600px)": {
          "& .MuiDataGrid-columnHeaders, & .MuiDataGrid-footerContainer": {
            minHeight: "50px !important",
            maxHeight: "50px !important",
          },
          "& .MuiDataGrid-cell": {
            padding: "12px 16px",
            fontSize: "12px",
          },
          "& .MuiDataGrid-columnHeader": {
            padding: "12px 16px",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontSize: "12px",
          },
          "& .MuiDataGrid-row": {
            minHeight: "56px !important",
          },
        },
      }}
    >
      <DataGrid
        rows={safeRows}
        columns={columns}
        loading={loading}
        getRowId={getRowId}
        pagination
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: effectivePageSize,
            },
          },
        }}
        pageSizeOptions={[10]}
        checkboxSelection={checkboxSelection}
        disableRowSelectionOnClick
        onRowClick={onRowClick}
        autoHeight={true}
        disableColumnMenu
        sx={{
          border: "none",
          position: "relative",
          isolation: "isolate",
          "& .MuiDataGrid-main": {
            borderRadius: "12px",
            width: "100%",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: "#fffff0",
            scrollbarWidth: "thin",
            "&::-webkit-scrollbar": {
              width: "8px",
              height: "8px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#d1d5db",
              borderRadius: "4px",
            },
          },
          "& .MuiDataGrid-columnHeaders": {
            borderBottom: "1px solid #f3f4f6",
            backgroundColor: "#ffffff",
            minHeight: "60px !important",
            maxHeight: "60px !important",
            position: "sticky",
            top: 0,
            zIndex: 1,
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "1px solid #f3f4f6",
            padding: "16px 24px",
            fontSize: "14px",
            color: "#374151",
            whiteSpace: "nowrap",
          },
          "& .MuiDataGrid-columnHeader": {
            padding: "16px 24px",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: 600,
            color: "#6b7280",
            fontSize: "14px",
          },
          "& .MuiDataGrid-row": {
            "&:hover": {
              backgroundColor: "#f9fafb",
            },
            minHeight: "64px !important",
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "1px solid #f3f4f6",
            minHeight: "60px",
            position: "sticky",
            bottom: 0,
            backgroundColor: "#ffffff",
            zIndex: 1,
          },
          "& .MuiCheckbox-root": {
            color: "#d1d5db",
            "&.Mui-checked": {
              color: "#6366f1",
            },
          },
          "& .MuiDataGrid-columnSeparator": {
            display: "none",
          },
          "& .MuiDataGrid-menuIcon": {
            display: "none",
          },
          "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
            outline: "none",
          },
          "& .MuiTablePagination-root": {
            color: "#6b7280",
          },
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
            {
              fontSize: "14px",
            },
          "& .MuiTablePagination-select": {
            fontSize: "14px",
          },
          "& .MuiPaginationItem-root": {
            borderRadius: "6px",
          },
        }}
      />
    </Box>
  );
};

export default CustomDataGrid;
