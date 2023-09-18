import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { key } from "localforage";
const initialState: CellState = {
  data: {},
  loading: false,
  error: null,
  order: [],
};

interface CellState {
  data: {
    [key: string]: Cell;
  };
  loading: boolean;
  error: null | string;
  order: string[];
}
enum Direction {
  UP = "up",
  DOWN = "down",
}
export type cellType = "code" | "text";

export interface Cell {
  id: string;
  direction: Direction.UP | Direction.DOWN;
  type: cellType;
  content: string;
}

export const fetchCells = createAsyncThunk("cells/fetchCells", async () => {
  try {
    return [];
  } catch (err) {
    console.log(err);
  }
});

const cellSlice = createSlice({
  name: "cell",
  initialState,
  reducers: {
    updateCell(state, action) {
      const { id, content } = action.payload;
      state.data[id] = { ...state.data[id], content };
    },
    deleteCell(state, action) {
      const { id } = action.payload;
      delete state.data[id];
    },
    moveCell(state, action) {
      const { id: identity, direction } = action.payload;
      const index = state.order.findIndex((id) => id === identity);
      if (direction === Direction.UP) {
        state.order[index] = state.order[index - 1];
        state.order[index - 1] = identity;
      } else {
        state.order[index] = state.order[index + 1];
        state.order[index + 1] = identity;
      }
    },
    insertCellBefore(state, action) {
      const cell: Cell = {
        id: action.payload.id,
        type: action.payload.type,
        content: "",
        direction: Direction.UP,
      };
      state.data[cell.id] = cell;
      const index = state.order.findIndex((id) => id === action.payload.id);
      if (index < 0) {
        state.order.unshift(cell.id);
      } else {
        state.order.splice(index, 0, cell.id);
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCells.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.data = {};
    });
    builder.addCase(fetchCells.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.data = {};
    });
    builder.addCase(fetchCells.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message as string;
      state.data = {};
    });
  },
});

export default cellSlice.reducer;

export const {
  updateCell,
  deleteCell,
  moveCell,

  insertCellBefore,
} = cellSlice.actions;
export const getCells = (state: { cell: CellState }) => state.cell.data;
export const getLoading = (state: { cell: CellState }) => state.cell.loading;
export const getError = (state: { cell: CellState }) => state.cell.error;
export const getOrder = (state: { cell: CellState }) => state.cell.order;
