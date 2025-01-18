import { create } from "zustand";

// {
//   "message": "User registered successfully",
//   "data": {
//       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE1IiwiZW1haWwiOiJiYW5mZnBheUBicGF5LmFmcmljYSIsImlhdCI6MTczNzExODQxOCwiZXhwIjoxNzM3MTIyMDE4fQ.6jTHnE7YrCzB5uLj1RGQIfy_EsMkbo7_RbnrIRD1egs",
//       "user": {
//           "createdAt": "2025-01-17T12:53:37.408Z",
//           "updatedAt": "2025-01-17T12:53:37.410Z",
//           "id": "15",
//           "email": "banffpay@bpay.africa",
//           "type": "admin"
//       }
//   }
// }
export const useStore = create((set) => ({
  user: undefined,
  setUser: (user) => {
    set((state) => ({ user }));
  },
}));


// export const usePaginationStore = create<PaginationState>((set) => ({
//   currentPage: 1,
//   setCurrentPage: (page) => {
//     set((state) => ({ currentPage: page }));
//   },
// }));