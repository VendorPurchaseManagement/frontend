import create from "zustand";

interface useAuthInterface {
  user: object | null;
  setUser: (user: object) => void;
}

const useAuth = create<useAuthInterface>((set) => ({
  user: null,
  setUser: (user) => set(() => ({user: user})),
}));

export default useAuth;
